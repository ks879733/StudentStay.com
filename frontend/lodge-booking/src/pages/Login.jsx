import { useState } from "react";
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

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      const accessToken = response.data.accessToken;
      console.log("Login successful");
      console.log("Access Token:", accessToken);
      localStorage.setItem("accessToken", accessToken);

      let user = response.data.user;
      try {
        const userResponse = await api.get("/user/userdetail", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        user = Array.isArray(userResponse.data)
          ? userResponse.data[0] || user
          : userResponse.data?.user || user;
      } catch {
        // The login response already contains the account details and role.
      }

      console.log("User Details:", user);
      console.log("User Role:", user?.role);

      const role = user?.role === "user" ? "student" : user?.role;
      const destination = ROLE_HOME[role];
      if (!destination) throw new Error("Unsupported account role");

      localStorage.setItem("user", JSON.stringify({ ...user, role }));
      localStorage.setItem("role", role);
      navigate(destination, { replace: true });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_28px_100px_-40px_rgba(59,130,246,0.35)] lg:flex-row">
        <div className="flex flex-1 flex-col justify-center bg-slate-950 px-6 py-10 text-white sm:px-10 lg:px-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">StudentStay</p>
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
              <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
              <p className="mt-2 text-sm text-slate-600">
                Access your account and continue exploring.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

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

            <p className="mt-6 text-center text-sm text-slate-600">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
