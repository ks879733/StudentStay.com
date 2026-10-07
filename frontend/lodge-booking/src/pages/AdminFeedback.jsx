import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Clock3,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  RefreshCw,
  Star,
} from "lucide-react";
import api from "../api/api";
import { clearAuth } from "../auth";
import StudentStayMark from "../components/StudentStayMark";
import NotificationBell from "../components/NotificationBell";

const displayDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

const FeedbackMeta = ({ label, children }) => (
  <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900">
    {label}: <span className="break-words">{children}</span>
  </span>
);

const AdminFeedback = () => {
  const navigate = useNavigate();
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFeedback = useCallback(async () => {
    try {
      const response = await api.get("/admin/all-feedback");
      setError("");
      setFeedbackItems(response.data?.allFeedback || []);
    } catch (requestError) {
      const responseData = requestError.response?.data;

      // The existing endpoint returns HTTP 400 with an empty array when there
      // are no submissions, so treat that response as a valid empty state.
      if (responseData?.success && Array.isArray(responseData.allFeedback)) {
        setError("");
        setFeedbackItems(responseData.allFeedback);
      } else if (
        requestError.response?.status === 401 ||
        requestError.response?.status === 403
      ) {
        clearAuth();
        navigate("/login");
      } else {
        setError(
          responseData?.message ||
            "We could not load user feedback right now. Please try again.",
        );
        setFeedbackItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadFeedback();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadFeedback]);

  const refreshFeedback = () => {
    setLoading(true);
    loadFeedback();
  };

  const handleLogout = async () => {
    try {
      await api.post("/user/logout", {}, { withCredentials: true });
    } catch (requestError) {
      console.log("Admin logout failed:", requestError);
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen min-w-0 bg-amber-50/50 text-slate-900">
      <div className="flex min-h-screen min-w-0 flex-col lg:flex-row">
        <aside className="w-full border-b border-amber-200 bg-amber-50 text-slate-900 lg:min-h-screen lg:w-[18rem] lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-5 py-6 lg:px-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-200 text-amber-900 shadow-lg shadow-amber-900/10">
              <Building2 className="hidden h-5 w-5 lg:block" />
              <StudentStayMark className="h-8 w-8 text-white lg:hidden" />
            </div>
            <div>
              <p className="hidden text-xl font-black tracking-tight text-amber-800 lg:block">
                StudentStay
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Admin panel
              </p>
            </div>
          </div>

          <nav className="space-y-2 px-4 pb-6 lg:px-5" aria-label="Admin">
            <div className="rounded-2xl border border-amber-200 bg-white/70 p-2">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-amber-100"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
              <button
                type="button"
                aria-current="page"
                onClick={() => navigate("/admin/feedback")}
                className="mt-1 flex w-full items-center gap-3 rounded-xl bg-amber-200 px-3 py-2.5 text-left text-sm font-medium text-amber-950"
              >
                <MessageSquareText className="h-4 w-4" />
                Users Feedback
              </button>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white/70 p-2">
              <button
                type="button"
                onClick={() => navigate("/admin/pending-requests")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-amber-100"
              >
                <Clock3 className="h-4 w-4" />
                Pending Requests
              </button>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                  Admin
                </p>
                <h1 className="mt-1 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                  Users Feedback
                </h1>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <NotificationBell />
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

          <section className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Student suggestions
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                  Feedback received
                </h2>
                {!loading && (
                  <p className="mt-1 text-sm text-slate-500">
                    {feedbackItems.length} {feedbackItems.length === 1 ? "submission" : "submissions"}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={refreshFeedback}
                disabled={loading}
                className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-50 disabled:cursor-wait disabled:opacity-60 sm:self-auto"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {error && (
              <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={refreshFeedback}
                  className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-white px-3 font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Try again
                </button>
              </div>
            )}

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                Loading feedback...
              </div>
            ) : error ? null : feedbackItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm sm:p-12">
                <MessageSquareText className="mx-auto h-9 w-9 text-amber-700" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  No feedback yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Student suggestions will appear here after they submit the
                  feedback form.
                </p>
              </div>
            ) : (
              <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                {feedbackItems.map((item, index) => {
                  const user = item.user && typeof item.user === "object" ? item.user : {};
                  const name = item.name || user.name || "Unnamed user";
                  const email = item.email || user.email || "Email unavailable";
                  const hasRating = item.rating !== undefined && item.rating !== null && item.rating !== "";

                  return (
                    <article
                      key={item._id || item.id || `${item.email || "feedback"}-${index}`}
                      className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-900">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                            <div className="min-w-0">
                              <h3 className="break-words text-base font-semibold text-slate-900">
                                {name}
                              </h3>
                              <p className="break-all text-sm text-slate-500">
                                {email}
                              </p>
                            </div>
                            <time
                              className="shrink-0 text-xs text-slate-500 sm:pt-1"
                              dateTime={item.createdAt || undefined}
                            >
                              {displayDate(item.createdAt)}
                            </time>
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                        {item.message || "No message provided."}
                      </p>

                      {(item.type || hasRating || item.status) && (
                        <div className="mt-4 flex min-w-0 flex-wrap gap-2">
                          {item.type && <FeedbackMeta label="Type">{item.type}</FeedbackMeta>}
                          {hasRating && (
                            <FeedbackMeta label="Rating">
                              <span className="inline-flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                {item.rating}
                              </span>
                            </FeedbackMeta>
                          )}
                          {item.status && <FeedbackMeta label="Status">{item.status}</FeedbackMeta>}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminFeedback;
