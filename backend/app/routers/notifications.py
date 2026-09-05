from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Notification
from app.schemas import NotificationOut, NotificationCreate, Message
from app.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("/me", response_model=List[NotificationOut])
def my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.get("/me/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id, Notification.read == False)  # noqa: E712
        .count()
    )
    return {"unread_count": count}


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notif.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    notif.read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.patch("/me/read-all", response_model=Message)
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read == False,  # noqa: E712
    ).update({"read": True})
    db.commit()
    return Message(message="All notifications marked as read")


# ========== Internal/admin endpoint ==========
# Call this from other routers (e.g. applications.update_application_status,
# or payments.create_payment for proof-of-payment review) whenever a user
# needs to be notified of something. There's no separate "system" auth
# context here, so for now it's gated behind admin — if you want other
# routers to create notifications on a user's behalf without an admin in
# the request, pull the `Notification(...)` + `db.add`/`db.commit` block
# out into a small helper function (e.g. app/utils/notify.py) and call
# that directly instead of going through this HTTP endpoint.
@router.post("", response_model=NotificationOut, status_code=status.HTTP_201_CREATED)
def create_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    notif = Notification(
        user_id=data.user_id,
        type=data.type,
        message=data.message,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif