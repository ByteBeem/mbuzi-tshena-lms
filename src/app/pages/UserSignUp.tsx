import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  User,
  Lock,
  ArrowLeft,
  Mail,
  CreditCard,
  Phone,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Logo, LogoIcon } from "../components/Logo";

const API_URL = "http://localhost:8000/api/auth";

export default function UserSignUp() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    const trimmedFullName = fullName.trim();
    const trimmedEmail = identifier.trim().toLowerCase();
    const trimmedIdNumber = idNumber.trim();
    const trimmedPhoneNumber = phoneNumber.trim();

    if (!trimmedFullName) {
      setError("Please enter your full name.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!trimmedIdNumber) {
      setError("Please enter your ID number.");
      return;
    }

    if (!trimmedPhoneNumber) {
      setError("Please enter your phone number.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          full_name: trimmedFullName,
          email: trimmedEmail,
          id_number: trimmedIdNumber,
          phone_number: trimmedPhoneNumber,
          password,
        }),
      });

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        let message = "Unable to create your account.";

        if (data?.detail) {
          if (Array.isArray(data.detail)) {
            message = data.detail
              .map((item: any) => item?.msg || "Invalid input.")
              .join(" ");
          } else if (typeof data.detail === "string") {
            message = data.detail;
          }
        }

        throw new Error(message);
      }

      setSuccess(true);

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            registered: true,
            message: "Your account has been created successfully. Please log in.",
          },
        });
      }, 1200);
    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong while creating your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex font-['Inter',sans-serif]">
      {/* Left Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#005B3F]">
        <div className="absolute inset-0 bg-[#005B3F]/75 mix-blend-multiply z-10" />

        <img
          src="https://images.unsplash.com/photo-1655720360377-b97f6715e1ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80"
          alt="Banking on the go"
          className="absolute inset-0 w-full h-full object-cover z-0 grayscale"
        />

        <div className="relative z-20 flex flex-col justify-between p-12 text-white h-full w-full">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 hover:text-[#B4D330] transition-colors text-sm font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to main site
            </Link>
          </div>

          <div className="max-w-md">
            <div className="inline-flex bg-[#B4D330] p-3 rounded-xl mb-6 shadow-sm">
              <LogoIcon className="w-10 h-10 text-[#005B3F]" />
            </div>

            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Empowering your financial future.
            </h1>

            <p className="text-lg text-white/90 font-medium leading-relaxed">
              Create your personal account and get access to your dashboard,
              loan requests, payment tracking, and financial services.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#005B3F] hover:text-[#00432E] transition-colors text-sm font-bold mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to main site
          </Link>

          <Logo
            textClassName="text-2xl font-bold tracking-tight"
            iconClassName="w-8 h-8 text-[#005B3F]"
          />
        </div>

        <div className="w-full max-w-lg mx-auto lg:mx-0">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-[#111827]">
              Create your account
            </h2>

            <p className="mt-2 text-sm font-medium text-gray-500">
              Register to access your personal financial dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />

              <div>
                <p className="font-bold">Account created successfully.</p>
                <p className="mt-1">
                  Redirecting you to the login page...
                </p>
              </div>
            </div>
          )}

          <form
            className="space-y-5"
            onSubmit={handleRegister}
            noValidate
          >
            {/* Full Name */}
            <div>
              <label
                htmlFor="full-name"
                className="block text-sm font-bold text-[#111827]"
              >
                Full Name
              </label>

              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  id="full-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading || success}
                  className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-lg text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B4D330] focus:border-transparent transition-all font-medium sm:text-sm shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="John Mohlala"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-[#111827]"
              >
                Email Address
              </label>

              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={loading || success}
                  className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-lg text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B4D330] focus:border-transparent transition-all font-medium sm:text-sm shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* ID Number */}
            <div>
              <label
                htmlFor="id-number"
                className="block text-sm font-bold text-[#111827]"
              >
                ID Number
              </label>

              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  id="id-number"
                  type="text"
                  required
                  autoComplete="off"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  disabled={loading || success}
                  className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-lg text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B4D330] focus:border-transparent transition-all font-medium sm:text-sm shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your ID number"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone-number"
                className="block text-sm font-bold text-[#111827]"
              >
                Phone Number
              </label>

              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  id="phone-number"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading || success}
                  className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-lg text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B4D330] focus:border-transparent transition-all font-medium sm:text-sm shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="+27 71 234 5678"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-[#111827]"
              >
                Password
              </label>

              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || success}
                  className="block w-full pl-10 pr-11 py-3 bg-white border border-gray-200 rounded-lg text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B4D330] focus:border-transparent transition-all font-medium sm:text-sm shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading || success}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-[#005B3F] transition-colors disabled:cursor-not-allowed"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Password must contain at least 8 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-bold text-[#111827]"
              >
                Confirm Password
              </label>

              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || success}
                  className={`block w-full pl-10 pr-11 py-3 bg-white border rounded-lg text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B4D330] focus:border-transparent transition-all font-medium sm:text-sm shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    confirmPassword &&
                    password !== confirmPassword
                      ? "border-red-300"
                      : "border-gray-200"
                  }`}
                  placeholder="Confirm your password"
                />

                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  disabled={loading || success}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-[#005B3F] transition-colors disabled:cursor-not-allowed"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {confirmPassword && password !== confirmPassword && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  Passwords do not match.
                </p>
              )}

              {confirmPassword && password === confirmPassword && (
                <p className="mt-2 text-xs font-medium text-green-600">
                  Passwords match.
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#005B3F] hover:bg-[#00432E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B4D330] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Account Created
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          {/* Login */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center text-sm font-medium">
            <span className="text-gray-500 mr-1">
              Already have an account?
            </span>

            <Link
              to="/login"
              className="font-bold text-[#005B3F] hover:text-[#00432E] transition-colors"
            >
              Log in
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400 leading-relaxed">
            By creating an account, you agree to our terms and conditions and
            acknowledge our privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}