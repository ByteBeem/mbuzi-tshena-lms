from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from fastapi import Response
from app.database import get_db
from app.models import User, UserRole
from app.schemas import (
    Token, UserLogin, AdminLogin, UserRegister, UserOut, Message
)
from app.auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    get_user_by_email,
    get_user_by_id_number,
    get_current_user,
)
from app.config import settings
from app.utils.email import send_login_alert

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if get_user_by_id_number(db, user_in.id_number):
        raise HTTPException(status_code=400, detail="ID number already registered")

    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        id_number=user_in.id_number,
        phone_number=user_in.phone_number,
        role=UserRole.BORROWER,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get client IP address
    client_ip = request.client.host if request.client else "Unknown"


    forwarded_for = request.headers.get("X-Forwarded-For")
    real_ip = request.headers.get("X-Real-IP")
    cf_connecting_ip = request.headers.get("CF-Connecting-IP")

    if cf_connecting_ip:
        client_ip = cf_connecting_ip
    elif real_ip:
        client_ip = real_ip
    elif forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()

    # Get User-Agent
    user_agent = request.headers.get("User-Agent", "Unknown")

    # Basic device detection
    user_agent_lower = user_agent.lower()

    if "mobile" in user_agent_lower or "android" in user_agent_lower or "iphone" in user_agent_lower:
        device_name = "Mobile device"
    elif "ipad" in user_agent_lower or "tablet" in user_agent_lower:
        device_name = "Tablet"
    else:
        device_name = "Desktop"

    # Basic browser detection
    if "edg/" in user_agent_lower:
        browser_name = "Microsoft Edge"
    elif "chrome/" in user_agent_lower:
        browser_name = "Google Chrome"
    elif "firefox/" in user_agent_lower:
        browser_name = "Mozilla Firefox"
    elif "safari/" in user_agent_lower and "chrome/" not in user_agent_lower:
        browser_name = "Safari"
    elif "opera" in user_agent_lower or "opr/" in user_agent_lower:
        browser_name = "Opera"
    else:
        browser_name = "Unknown browser"

    # Login timestamp
    login_time = datetime.now().strftime("%d %B %Y at %H:%M:%S")

  
    login_location = "Unknown location"

    access_token = create_access_token(
        data={
            "sub": user.email,
            "role": user.role.value,
        },
        expires_delta=timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        ),
    )

    # Send security notification after successful authentication
    await send_login_alert(
        to_email=user.email,
        customer_name=user.first_name or user.email,
        login_time=login_time,
        ip_address=client_ip,
        location=login_location,
        device=device_name,
        browser=browser_name,
        security_url=f"{settings.FRONTEND_URL}/security",
    )

    return Token(
        access_token=access_token,
        user=UserOut.model_validate(user),
    )



@router.post("/login/json", response_model=Token)
async def login_json(
    credentials: UserLogin,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db,
        credentials.identifier,
        credentials.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/ID or password",
        )

    if user.role.value == "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect Email/ID or Password.",
        )

 

    # Default client IP
    client_ip = request.client.host if request.client else "Unknown"

    # Cloudflare's real client IP
    cf_ip = request.headers.get("CF-Connecting-IP")

    # Reverse proxy IP headers
    real_ip = request.headers.get("X-Real-IP")
    forwarded_for = request.headers.get("X-Forwarded-For")

    if cf_ip:
        client_ip = cf_ip
    elif real_ip:
        client_ip = real_ip
    elif forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()

    # User-Agent contains browser + operating system + device information
    user_agent = request.headers.get(
        "User-Agent",
        "Unknown",
    )

    user_agent_lower = user_agent.lower()



    if any(
        device in user_agent_lower
        for device in [
            "iphone",
            "android",
            "mobile",
        ]
    ):
        device_name = "Mobile"

    elif any(
        device in user_agent_lower
        for device in [
            "ipad",
            "tablet",
        ]
    ):
        device_name = "Tablet"

    else:
        device_name = "Desktop"



    if "edg/" in user_agent_lower:
        browser_name = "Microsoft Edge"

    elif "opr/" in user_agent_lower or "opera" in user_agent_lower:
        browser_name = "Opera"

    elif "firefox/" in user_agent_lower:
        browser_name = "Mozilla Firefox"

    elif "chrome/" in user_agent_lower:
        browser_name = "Google Chrome"

    elif "safari/" in user_agent_lower:
        browser_name = "Safari"

    else:
        browser_name = "Unknown Browser"


    if "windows" in user_agent_lower:
        operating_system = "Windows"

    elif "iphone" in user_agent_lower or "ipad" in user_agent_lower:
        operating_system = "iOS"

    elif "android" in user_agent_lower:
        operating_system = "Android"

    elif "mac os" in user_agent_lower or "macintosh" in user_agent_lower:
        operating_system = "macOS"

    elif "linux" in user_agent_lower:
        operating_system = "Linux"

    else:
        operating_system = "Unknown OS"

 
    login_time = datetime.now().strftime(
        "%d %B %Y at %H:%M:%S"
    )

    login_location = "Unknown location"


    access_token = create_access_token(
        data={
            "sub": user.email,
            "role": user.role.value,
        },
        expires_delta=timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        ),
    )



    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )



    try:
        print(f"Sending login alert email to {user.email}...")
        await send_login_alert(
            to_email=user.email,
            customer_name=user.full_name or user.email,
            login_time=login_time,
            ip_address=client_ip,
            location=login_location,
            device=f"{device_name} ({operating_system})",
            browser=browser_name,
            security_url=f"{settings.FRONTEND_URL}/security",
        )
    except Exception as e:
        print(f"Failed to send login alert email. This may be due to email server issues: {e}")
        # Do not prevent a successful login if the email server
        # is temporarily unavailable.
        pass


    return Token(
        access_token=access_token,
        user=UserOut.model_validate(user),
    )


@router.post("/admin/login", response_model=Token)
def admin_login(credentials: AdminLogin, response: Response, db: Session = Depends(get_db)):
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect Email or Password.",
        )
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,          # False only during local HTTP development
        samesite="none",      # "lax" if frontend/backend share the same site
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    return Token(access_token=access_token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user





@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        secure=True,      # False for local HTTP development
        samesite="none",  # "lax" if not cross-site
    )

    return {
        "message": "Logged out successfully"
    }