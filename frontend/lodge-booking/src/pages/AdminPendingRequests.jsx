import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Check,
  Clock3,
  LayoutDashboard,
  LogOut,
  Mail,
  Phone,
  UserRound,
  X,
} from "lucide-react";
import api from "../api/api";
import { clearAuth } from "../auth";
import StudentStayMark from "../components/StudentStayMark";

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString();
};

const AdminPendingRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [actionType, setActionType] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/room-deactivation-requests");
      setRequests(response.data.pendingRequest || []);
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
          "We could not load pending deactivation requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (requestId) => {
    setError("");
    setProcessingId(requestId);
    setActionType("approve");

    try {
      await api.post(`/admin/deactivation-request/${requestId}/approve`);
      setRequests((currentRequests) =>
        currentRequests.filter((request) => request._id !== requestId),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to approve this request right now.",
      );
    } finally {
      setProcessingId(null);
      setActionType("");
    }
  };

  const handleReject = async (requestId) => {
    setError("");
    setProcessingId(requestId);
    setActionType("reject");

    try {
      await api.post(`/admin/room-deactivation/${requestId}/reject`);
      setRequests((currentRequests) =>
        currentRequests.filter((request) => request._id !== requestId),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to reject this request right now.",
      );
    } finally {
      setProcessingId(null);
      setActionType("");
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
      <div className="flex min-h-screen min-w-0 flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-200 bg-slate-950 text-white lg:min-h-screen lg:w-[18rem] lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-5 py-6 lg:px-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <Building2 className="hidden h-5 w-5 lg:block" />
              <StudentStayMark className="h-8 w-8 text-white lg:hidden" />
            </div>
            <div>
              <p className="hidden text-xl font-black tracking-tight text-blue-400 lg:block">
                StudentStay
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-300">
                Admin panel
              </p>
            </div>
          </div>

          <nav className="space-y-2 px-4 pb-6 lg:px-5">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/5"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/pending-requests")}
              className="flex w-full items-center gap-3 rounded-xl bg-blue-600/20 px-3 py-2.5 text-sm font-medium text-blue-100"
            >
              <Clock3 className="h-4 w-4" />
              <span>Pending Requests</span>
              <span className="ml-auto rounded-full bg-blue-500/25 px-2 py-0.5 text-[10px] font-semibold text-blue-100">
                {requests.length}
              </span>
            </button>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/admin/dashboard")}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                  aria-label="Back to dashboard"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                    Requests
                  </p>
                  <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                    Pending deactivation requests
                  </h1>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                Loading pending requests...
              </div>
            ) : requests.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                <Clock3 className="mx-auto h-8 w-8 text-slate-400" />
                <h2 className="mt-4 text-xl font-semibold text-slate-900">
                  No pending requests
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Owner deactivation requests will appear here once they are submitted.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 xl:grid-cols-2">
                {requests.map((request) => {
                  const lodge = request.lodge || {};
                  const owner = request.owner || {};
                  const room = request.room || {};
                  const isApproving =
                    processingId === request._id && actionType === "approve";
                  const isRejecting =
                    processingId === request._id && actionType === "reject";

                  return (
                    <article
                      key={request._id}
                      className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                            Request #{String(request._id).slice(-6)}
                          </p>
                          <h2 className="mt-2 text-xl font-semibold text-slate-900">
                            {lodge.name || "Property"} <span className="text-slate-500">· Room {room.roomNumber || "details unavailable"}</span>
                          </h2>
                        </div>
                        <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                          {request.status || "pending"}
                        </span>
                      </div>

                      <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                            Owner
                          </p>
                          <div className="mt-2 flex items-start gap-3">
                            <UserRound className="mt-0.5 h-4 w-4 text-blue-600" />
                            <div className="text-sm text-slate-700">
                              <p className="font-medium text-slate-900">
                                {owner.name || "Owner"}
                              </p>
                              <p className="mt-1 break-all">
                                {owner.email || "No email provided"}
                              </p>
                              <p className="mt-1 flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-slate-500" />
                                {owner.phone || "No phone number provided"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                            Request reason
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {request.reason || "No reason provided."}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatDate(request.createdAt)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            {room.roomType ? `Room type: ${room.roomType}` : (lodge.address?.city || "Property")}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleApprove(request._id)}
                          disabled={isApproving || isRejecting}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Check className="h-4 w-4" />
                          {isApproving ? "Approving..." : "Approve"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(request._id)}
                          disabled={isApproving || isRejecting}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <X className="h-4 w-4" />
                          {isRejecting ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPendingRequests;
