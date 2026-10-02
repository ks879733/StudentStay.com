import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, LogOut, Mail, Phone, UserRound } from "lucide-react";
import api from "../api/api";
import { clearAuth } from "../auth";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch {
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/user/logout", {}, { withCredentials: true });
    } catch (error) {
      console.log("Profile logout request failed:", error);
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  const initials = user?.name?.trim()?.charAt(0)?.toUpperCase() || "S";
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "User";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 text-slate-900 sm:px-6 sm:py-9 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-7 sm:mb-9">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Student account
          </p>
          <h1 className="mt-2 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
            Profile
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your account information and booking shortcuts.
          </p>
        </header>

        {loading && (
          <div
            className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm"
            role="status"
          >
            Loading profile...
          </div>
        )}

        {!loading && !user && (
          <section className="rounded-3xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm">
            <UserRound
              className="mx-auto h-8 w-8 text-slate-400"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Sign in to view your profile
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Your account details will be available after you log in.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Log in
            </Link>
          </section>
        )}

        {!loading && user && (
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8">
            <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex min-w-0 flex-wrap items-center gap-4 border-b border-slate-200 pb-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xl font-semibold text-blue-700">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h2 className="break-words text-xl font-semibold text-slate-900">
                    {user.name || "Student"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {roleLabel} account
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid min-w-0 gap-5 sm:grid-cols-2">
                <div className="min-w-0">
                  <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                    Full name
                  </dt>
                  <dd className="mt-2 break-words text-sm text-slate-800">
                    {user.name || "Not provided"}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Email
                  </dt>
                  <dd className="mt-2 break-all text-sm text-slate-800">
                    {user.email || "Not provided"}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    Phone
                  </dt>
                  <dd className="mt-2 break-words text-sm text-slate-800">
                    {user.phone || "Not provided"}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                    Account type
                  </dt>
                  <dd className="mt-2 text-sm text-slate-800">{roleLabel}</dd>
                </div>
              </dl>
            </section>

            <aside className="h-fit min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Your account
              </h2>
              <div className="mt-4 space-y-2">
                <Link
                  to="/bookings"
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <CalendarDays
                    className="h-4 w-4 text-slate-500"
                    aria-hidden="true"
                  />
                  My bookings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Log out
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Profile;
