import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, LogOut, Mail, Phone, UserRound } from "lucide-react";
import api from "../api/api";
import { clearAuth } from "../auth";
import OwnerSidebar from "./OwnerSideBar";
import OwnerBackButton from "./OwnerBackButton";

const OwnerProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredUser = () => {
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
      console.log("Owner profile logout failed:", error);
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  const initials = user?.name?.trim()?.charAt(0)?.toUpperCase() || "O";
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Owner";

  return (
    <div className="min-h-screen bg-slate-50">
      <OwnerSidebar />
      <div className="min-h-screen px-4 pb-8 pt-20 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-1 py-4 shadow-sm sm:px-4">
          <div>
            <OwnerBackButton />
            <h1 className="text-xl font-semibold text-slate-900">
              Owner Profile
            </h1>
            <p className="text-sm text-slate-500 mt-1">Account details</p>
          </div>
        </header>

        <main className="py-6 sm:py-8">
          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
              Loading profile...
            </div>
          )}

          {!loading && !user && (
            <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <UserRound
                className="mx-auto h-8 w-8 text-slate-400"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                Sign in to view your profile
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Your owner account details will appear here after login.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-6 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Go to login
              </button>
            </section>
          )}

          {!loading && user && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 pb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xl font-semibold text-blue-700">
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {user.name || "Owner"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {roleLabel} account
                    </p>
                  </div>
                </div>

                <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                      <UserRound className="h-4 w-4" aria-hidden="true" />
                      Full name
                    </dt>
                    <dd className="mt-2 text-sm text-slate-800">
                      {user.name || "Not provided"}
                    </dd>
                  </div>

                  <div>
                    <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      Email
                    </dt>
                    <dd className="mt-2 break-all text-sm text-slate-800">
                      {user.email || "Not provided"}
                    </dd>
                  </div>

                  <div>
                    <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      Phone
                    </dt>
                    <dd className="mt-2 text-sm text-slate-800">
                      {user.phone || "Not provided"}
                    </dd>
                  </div>

                  <div>
                    <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                      <Building2 className="h-4 w-4" aria-hidden="true" />
                      Account type
                    </dt>
                    <dd className="mt-2 text-sm text-slate-800">{roleLabel}</dd>
                  </div>
                </dl>
              </section>

              <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">
                  Account actions
                </h2>
                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Log out
                  </button>
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OwnerProfile;
