import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import api from "../api/api";
import CompactBrandMark from "../components/StudentStayMark";
import FeedbackForm from "../components/FeedbackForm";

const PAGE_SIZE = 6;

const StudentStayMark = ({ className = "" }) => (
  <svg
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="8" y="10" width="48" height="44" rx="12" fill="#FBF7E9" />
    <path
      d="M18 30.5L32 18L46 30.5V42C46 43.66 44.66 45 43 45H21C19.34 45 18 43.66 18 42V30.5Z"
      fill="#D4AF37"
    />
    <path
      d="M26 31H38C39.66 31 41 32.34 41 34V45H23V34C23 32.34 24.34 31 26 31Z"
      fill="#FFFDF8"
    />
    <path
      d="M29 45V35H35V45"
      stroke="#D4AF37"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <circle cx="44" cy="20" r="8" fill="#D4AF37" />
    <path
      d="M44 15V25M39 20H49"
      stroke="#FFFDF8"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const getProperties = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/user/all-properties", {
        params: { page, limit: PAGE_SIZE },
      });

      setProperties(response.data.properties || []);
      setPagination(response.data.pagination || null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We could not load student stays right now. Please try again.",
      );
      setProperties([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProperties();
  }, [page]);

  const getImageUrl = (images) => {
    const image = images?.[0];
    return typeof image === "string" ? image : image?.url;
  };

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return properties;
    }

    return properties.filter((property) => {
      const name = (property.name || "").toLowerCase();
      const city = (property.address?.city || "").toLowerCase();
      const area = (property.address?.area || "").toLowerCase();
      const type = (property.type || "").toLowerCase();

      return (
        name.includes(query) ||
        city.includes(query) ||
        area.includes(query) ||
        type.includes(query)
      );
    });
  }, [properties, search]);

  const featuredProperties = filteredProperties.slice(0, 3);

  const heroImage =
    getImageUrl(properties[0]?.images) ||
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(91,68,24,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="p-5 sm:p-8 lg:p-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
                  <StudentStayMark className="hidden h-8 w-8 md:block" />
                  <CompactBrandMark className="h-8 w-8 text-blue-600 md:hidden" />
                </div>
                <div>
                  <p className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 md:block">
                    StudentStay
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                <Sparkles className="h-3.5 w-3.5" />
                Verified student stays
              </span>

              <h1 className="mt-6 max-w-xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Find the right PG, lodge, or hostel for your student life.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                Discover comfortable, verified student accommodation with
                transparent monthly rent, flexible room choices, and easy
                booking for your next move.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/explore")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Browse stays
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/bookings")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                >
                  My bookings
                </button>
              </div>

              <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <label
                  htmlFor="dashboard-search"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                >
                  Search by city, area, or stay type
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative w-full">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="dashboard-search"
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search city, area or lodge..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/explore")}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            <div className="relative min-h-[280px] border-t border-slate-200 bg-slate-100 lg:border-l lg:border-t-0">
              <img
                src={heroImage}
                alt="Student accommodation"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/15 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                    <Building2 className="h-3.5 w-3.5" />
                    Student accommodation
                  </div>
                  <p className="mt-3 text-xl font-semibold text-white">
                    {properties[0]?.name || "Verified stays near you"}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-200">
                    <MapPin className="h-4 w-4" />
                    {properties[0]?.address?.city || "Patna"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Explore
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Featured stays
            </h2>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Loading approved properties...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && filteredProperties.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Building2 className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No matching stays found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try a different city, area, or stay type.
            </p>
          </div>
        )}

        {!loading && !error && filteredProperties.length > 0 && (
          <>
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {featuredProperties.map((property) => {
                const imageUrl = getImageUrl(property.images);
                const location = [
                  property.address?.area,
                  property.address?.city,
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <article
                    key={property._id}
                    className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={property.name || "Student accommodation"}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
                          <Building2 className="h-10 w-10" />
                        </div>
                      )}

                      <span className="absolute left-4 top-4 rounded-full border border-blue-200 bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                        {property.type || "Accommodation"}
                      </span>
                    </div>

                    <div className="min-w-0 p-4 sm:p-5">
                      <h3 className="break-words text-lg font-semibold text-slate-900 sm:text-xl">
                        {property.name || "Student stay"}
                      </h3>

                      {location && (
                        <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                          <span>{location}</span>
                        </p>
                      )}

                      <p className="mt-3 break-words text-sm leading-6 text-slate-600">
                        {property.description ||
                          "Comfortable student accommodation with easy booking and verified stay options."}
                      </p>

                      <button
                        type="button"
                        onClick={() => navigate(`/lodge/${property._id}`)}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        View details
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() =>
                    setPage((currentPage) => Math.max(1, currentPage - 1))
                  }
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <p className="text-sm text-slate-500">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </p>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            How it works
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Move in with confidence
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Find a place",
              description:
                "Explore verified PGs, lodges and hostels near your college.",
              icon: Building2,
            },
            {
              title: "Choose a room",
              description:
                "Compare room types, sharing setup, and monthly rent options.",
              icon: Users,
            },
            {
              title: "Book securely",
              description:
                "Create a booking and complete payment with Razorpay.",
              icon: CreditCard,
            },
            {
              title: "Move in",
              description:
                "Track your booking status and manage upcoming stay details.",
              icon: CheckCircle2,
            },
          ].map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Why StudentStay
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Built for student accommodation needs
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Monthly rent clarity",
              description:
                "Clear room-based pricing and straightforward booking flow.",
              icon: CreditCard,
            },
            {
              title: "Verified stays",
              description:
                "Approved lodges and hostels for a more trusted experience.",
              icon: ShieldCheck,
            },
            {
              title: "Easy booking",
              description:
                "Simple steps from room selection to secure payment.",
              icon: CheckCircle2,
            },
            {
              title: "Flexible choices",
              description: "Explore different room types and sharing options.",
              icon: Users,
            },
          ].map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <FeedbackForm />
    </main>
  );
};

export default Dashboard;
