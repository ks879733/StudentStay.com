import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Plus, ShieldCheck, Sparkles } from "lucide-react";
import api from "../api/api";
import { clearAuth } from "../auth";
import OwnerSidebar from "./OwnerSideBar";
import OwnerBackButton from "./OwnerBackButton";

const OwnerProperty = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/owner/my-properties");
        setProperties(response.data.properties || []);
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          clearAuth();
          navigate("/login");
          return;
        }

        if (requestError.response?.status === 403) {
          navigate("/dashboard");
          return;
        }

        setError(
          requestError.response?.data?.message ||
            "We could not load your properties right now.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [navigate]);

  const approvedProperties = properties.filter(
    (property) => property.status === "approved",
  ).length;
  const pendingProperties = properties.filter(
    (property) => property.status === "pending",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <OwnerSidebar />
      <div className="min-h-screen px-4 pb-8 pt-20 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-1 py-4 shadow-sm sm:px-4">
          <div>
            <OwnerBackButton />
            <h1 className="text-xl font-semibold text-slate-900">
              My Properties
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage your listings</p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/owner/add-property")}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Lodge
          </button>
        </header>

        <main className="py-6 sm:py-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {properties.length}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Approved</p>
              <h2 className="mt-3 text-3xl font-bold text-emerald-600">
                {approvedProperties}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Pending</p>
              <h2 className="mt-3 text-3xl font-bold text-amber-600">
                {pendingProperties}
              </h2>
            </div>
          </div>

          {loading && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
              Loading properties...
            </div>
          )}

          {!loading && error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700 shadow-sm">
              {error}
            </div>
          )}

          {!loading && !error && properties.length === 0 && (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <Sparkles
                className="mx-auto h-8 w-8 text-blue-500"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                No properties yet
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Add your first lodge to start managing rooms and bookings.
              </p>
              <button
                type="button"
                onClick={() => navigate("/owner/add-property")}
                className="mt-6 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Create property
              </button>
            </div>
          )}

          {!loading && !error && properties.length > 0 && (
            <div className="mt-6 grid gap-5">
              {properties.map((property) => {
                const imageUrl =
                  property.images?.[0]?.url || property.image || "";
                const address = property.address || {};
                const locationText = [
                  address.street,
                  address.area,
                  address.city,
                  address.state,
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <article
                    key={property._id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="grid md:grid-cols-[260px_minmax(0,1fr)]">
                      <div className="h-full min-h-[200px] bg-slate-100">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={property.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full min-h-[200px] items-center justify-center text-slate-400">
                            <Building2
                              className="h-10 w-10"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                      </div>

                      <div className="p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                              {property.type || "Accommodation"}
                            </p>
                            <h3 className="mt-2 text-xl font-semibold text-slate-900">
                              {property.name}
                            </h3>
                          </div>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                              property.status === "approved"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : property.status === "pending"
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-red-200 bg-red-50 text-red-700"
                            }`}
                          >
                            {property.status || "pending"}
                          </span>
                        </div>

                        {locationText && (
                          <p className="mt-4 flex items-start gap-2 text-sm text-slate-600">
                            <MapPin
                              className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                              aria-hidden="true"
                            />
                            <span>{locationText}</span>
                          </p>
                        )}

                        {property.description && (
                          <p className="mt-4 text-sm leading-6 text-slate-600">
                            {property.description}
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                            <ShieldCheck
                              className="h-3.5 w-3.5 text-emerald-600"
                              aria-hidden="true"
                            />
                            {property.contactPhone || "Phone not added"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OwnerProperty;
