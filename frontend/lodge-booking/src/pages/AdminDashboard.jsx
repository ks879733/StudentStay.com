import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Building2,
  Check,
  Clock3,
  LayoutDashboard,
  LogOut,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import api from "../api/api";
import { clearAuth } from "../auth";

const formatLabel = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "Unknown";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [pendingLodges, setPendingLodges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalProperties: 0,
    approvedProperties: 0,
    pendingApprovals: 0,
    totalUsers: 0,
  });

  const loadAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");

      if (!storedUser || storedUser.role !== "admin") {
        navigate("/login");
        return;
      }

      const [pendingResponse, usersResponse, propertiesResponse] =
        await Promise.all([
          api.get("/admin/pending-lodge", { params: { page: 1, limit: 20 } }),
          api.get("/admin/all-users"),
          api.get("/user/all-properties", { params: { page: 1, limit: 50 } }),
        ]);

      const lodges = pendingResponse.data.lodges || [];
      const allUsers = usersResponse.data.users || [];
      const allProperties = propertiesResponse.data.properties || [];

      setPendingLodges(lodges);
      setUsers(allUsers.slice(0, 6));
      setStats({
        totalProperties: allProperties.length,
        approvedProperties: allProperties.filter(
          (item) => item.status === "approved",
        ).length,
        pendingApprovals: lodges.length,
        totalUsers: allUsers.length,
      });
    } catch (requestError) {
      if (
        requestError.response?.status === 401 ||
        requestError.response?.status === 403
      ) {
        clearAuth();
        navigate("/login");
        return;
      }

      setError(
        requestError.response?.data?.message ||
          "We could not load the admin dashboard right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApprove = async (lodgeId) => {
    try {
      await api.patch(`/admin/lodges/${lodgeId}/approve`);
      await loadAdminData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to approve this lodge right now.",
      );
    }
  };

  const handleReject = async (lodgeId) => {
    try {
      await api.patch(`/admin/lodge/${lodgeId}/reject-lodge`);
      await loadAdminData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to reject this lodge right now.",
      );
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/user/logout", {}, { withCredentials: true });
    } catch (error) {
      console.log("Admin logout failed:", error);
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-col overflow-x-hidden lg:flex-row">
        <aside className="w-full border-b border-slate-200 bg-slate-950 text-white lg:min-h-screen lg:w-[18rem] lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-5 py-6 lg:px-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-blue-400">
                StudentStay
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-300">
                Admin panel
              </p>
            </div>
          </div>

          <nav className="space-y-2 px-4 pb-6 lg:px-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl bg-blue-600/20 px-3 py-2.5 text-sm font-medium text-blue-100"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 overflow-x-hidden">
          <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                  Overview
                </p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Admin dashboard
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                {error}
              </div>
            )}

            <div className="mb-6 rounded-[28px] border border-slate-200 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 p-5 text-white shadow-[0_18px_50px_-24px_rgba(37,99,235,0.9)] sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                    Welcome back
                  </p>
                  <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                    Manage properties and student accounts.
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-blue-50">
                  <Sparkles className="h-4 w-4" />
                  Recently added review
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Total users
                  </p>
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <p className="mt-5 text-3xl font-bold text-slate-900">
                  {stats.totalUsers}
                </p>
                <p className="mt-2 text-xs text-slate-500">Active accounts</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Properties
                  </p>
                  <Building2 className="h-5 w-5 text-violet-600" />
                </div>
                <p className="mt-5 text-3xl font-bold text-slate-900">
                  {stats.totalProperties}
                </p>
                <p className="mt-2 text-xs text-slate-500">All listed stays</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Approved</p>
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="mt-5 text-3xl font-bold text-emerald-600">
                  {stats.approvedProperties}
                </p>
                <p className="mt-2 text-xs text-slate-500">Live on platform</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Pending</p>
                  <Clock3 className="h-5 w-5 text-amber-600" />
                </div>
                <p className="mt-5 text-3xl font-bold text-amber-600">
                  {stats.pendingApprovals}
                </p>
                <p className="mt-2 text-xs text-slate-500">Awaiting approval</p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 2xl:grid-cols-[1.5fr_0.8fr] xl:grid-cols-[1.4fr_0.7fr]">
              <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                      Approvals
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">
                      Pending lodges
                    </h3>
                  </div>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {pendingLodges.length} pending
                  </span>
                </div>

                {loading ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                    Loading recent submissions...
                  </div>
                ) : pendingLodges.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                    No pending lodges right now.
                  </div>
                ) : (
                  <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1 lg:max-h-none lg:overflow-visible">
                    {pendingLodges.map((lodge) => {
                      const imageUrl =
                        typeof lodge.images?.[0] === "string"
                          ? lodge.images[0]
                          : lodge.images?.[0]?.url;

                      return (
                        <article
                          key={lodge._id}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                        >
                          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                            <div className="h-28 w-full overflow-hidden rounded-xl bg-slate-200 sm:w-32">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={lodge.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-slate-400">
                                  <Building2 className="h-8 w-8" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <h4 className="break-words text-lg font-semibold text-slate-900">
                                    {lodge.name}
                                  </h4>
                                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-600">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                    {lodge.address?.area || "Area not provided"}
                                    ,{" "}
                                    {lodge.address?.city || "City not provided"}
                                  </p>
                                </div>

                                <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                                  {formatLabel(lodge.status)}
                                </span>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                                <span className="rounded-full bg-white px-2 py-1">
                                  {formatLabel(lodge.type)}
                                </span>
                                <span className="rounded-full bg-white px-2 py-1">
                                  {lodge.owner?.name || "Owner"}
                                </span>
                                <span className="rounded-full bg-white px-2 py-1">
                                  {lodge.owner?.email || "No email"}
                                </span>
                              </div>

                              <p className="mt-3 text-sm leading-6 text-slate-600">
                                {lodge.description ||
                                  "No description added yet."}
                              </p>

                              <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleApprove(lodge._id)}
                                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                >
                                  <Check className="h-4 w-4" />
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(lodge._id)}
                                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="min-h-[460px] rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                    Recent users
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    Accounts
                  </h3>
                </div>

                <div className="max-h-[38vh] overflow-y-auto pr-1 lg:max-h-none lg:overflow-visible">
                  <div className="space-y-3">
                    {users.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                        No users found.
                      </div>
                    ) : (
                      users.map((user) => (
                        <div
                          key={user._id || user.email}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                              {(user.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {user.name || "Unnamed user"}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {user.email || "Email unavailable"}
                              </p>
                            </div>
                          </div>

                          <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                            {formatLabel(user.role)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Open public dashboard
                  <ArrowRight className="h-4 w-4" />
                </button>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
