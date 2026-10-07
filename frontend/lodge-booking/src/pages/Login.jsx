import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import api from "../api/api";
import { clearAuth, ROLE_HOME } from "../auth";
import StudentStayMark from "../components/StudentStayMark";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (resendCountdown <= 0) return undefined;
    const timer = window.setTimeout(
      () => setResendCountdown((remaining) => remaining - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/user/login", formData, {
        withCredentials: true,
      });

      if (!response.data?.otpRequired || !response.data?.userId) {
        throw new Error(response.data?.message || "Unable to start OTP verification");
      }

      setUserId(response.data.userId);
      setOtpStep(true);
      setResendCountdown(60);
      setOtpExpired(false);
    } catch (requestError) {
      clearAuth();
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const finishLogin = async (response) => {
    const accessToken = response.data.accessToken;
    if (!accessToken) throw new Error("Access token was not returned");
    localStorage.setItem("accessToken", accessToken);

    let user = response.data.user;
    try {
      const userResponse = await api.get("/user/userdetail", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      user = Array.isArray(userResponse.data)
        ? userResponse.data[0] || user
        : userResponse.data?.user || user;
    } catch {
      // The OTP response already contains the account details and role.
    }

    const role = user?.role === "user" ? "student" : user?.role;
    const destination = ROLE_HOME[role];
    if (!destination) throw new Error("Unsupported account role");

    localStorage.setItem("user", JSON.stringify({ ...user, role }));
    localStorage.setItem("role", role);
    window.dispatchEvent(new Event("auth-changed"));
    navigate(destination, { replace: true });
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setOtpLoading(true);
    try {
      const response = await api.post("/user/verify-login-otp", { userId, otp }, {
        withCredentials: true,
      });
      await finishLogin(response);
    } catch (requestError) {
      const message = requestError.response?.data?.message || requestError.message || "OTP verification failed";
      if (/expired|enter otp/i.test(message)) setOtpExpired(true);
      setError(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setResendLoading(true);
    try {
      await api.post("/user/resend-login-otp", { userId }, { withCredentials: true });
      setOtp("");
      setOtpExpired(false);
      setResendCountdown(60);
    } catch (requestError) {
      const message = requestError.response?.data?.message || requestError.message || "Unable to resend OTP";
      setError(message);
      const retryAfter = Number(requestError.response?.data?.retryAfter);
      if (retryAfter > 0) setResendCountdown(retryAfter);
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setOtpStep(false);
    setOtp("");
    setUserId("");
    setResendCountdown(0);
    setOtpExpired(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_28px_100px_-40px_rgba(153,115,33,0.24)] lg:flex-row">
        <div className="flex flex-1 flex-col justify-center bg-slate-950 px-6 py-10 text-white sm:px-10 lg:px-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <Building2 className="hidden h-5 w-5 md:block" />
              <StudentStayMark className="h-8 w-8 text-white md:hidden" />
            </div>
            <div>
              <p className="hidden text-2xl font-bold text-blue-500 md:block">StudentStay</p>
            </div>
          </div>

          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            Welcome back to your next home.
          </h1>
          <p className="mt-4 max-w-md text-base text-slate-300">
            Sign in to continue your student stay search, manage bookings, and
            discover rooms that match your routine.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3 text-blue-200">
              <Sparkles className="h-4 w-4" />
              <p className="text-sm font-medium">Trusted stays for students</p>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Verified homes, transparent pricing, and a smoother booking
              experience from search to checkout.
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {otpStep ? "Verify your email" : "Sign in"}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {otpStep
                  ? `Enter the verification code sent to ${formData.email}.`
                  : "Access your account and continue exploring."}
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {otpStep ? (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    One-time password
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                    placeholder="Enter the OTP"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  {otpExpired && (
                    <p className="mt-2 text-sm text-red-600">
                      This OTP has expired. Request a new code to continue.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || resendLoading || !otp.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {otpLoading ? "Verifying..." : "Verify OTP"}
                  {!otpLoading && <ArrowRight className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading || otpLoading || resendCountdown > 0}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resendLoading
                    ? "Sending..."
                    : resendCountdown > 0
                      ? `Resend OTP in ${resendCountdown}s`
                      : "Resend OTP"}
                </button>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  disabled={otpLoading || resendLoading}
                  className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-60"
                >
                  Back to login
                </button>
              </form>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
            )}

            {!otpStep && <p className="mt-6 text-center text-sm text-slate-600">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Create account
              </Link>
            </p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
