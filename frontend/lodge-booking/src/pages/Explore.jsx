import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import api from "../api/api";

const PAGE_SIZE = 9;

const Explore = () => {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadProperties = async () => {
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
            "We could not load approved properties. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [page, reload]);

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
      const city = (property.address?.city || "").toLowerCase();
      const area = (property.address?.area || "").toLowerCase();
      const type = (property.type || "").toLowerCase();
      const name = (property.name || "").toLowerCase();

      return (
        city.includes(query) ||
        area.includes(query) ||
        type.includes(query) ||
        name.includes(query)
      );
    });
  }, [properties, search]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Student accommodation
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Explore PGs, lodges, and hostels
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Browse approved student stays and compare rooms that match your
                budget, city, and preferred living setup.
              </p>
            </div>

            {!loading && !error && pagination && (
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {pagination.totalProperties} approved{" "}
                {pagination.totalProperties === 1 ? "stay" : "stays"}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by city, area, or stay name"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>
        </header>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Loading approved properties...
          </div>
        )}

        {!loading && error && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => setReload((currentReload) => currentReload + 1)}
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Try again
            </button>
          </section>
        )}

        {!loading && !error && filteredProperties.length === 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Building2 className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No approved stays yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Approved PGs and hostels will appear here when they are available.
            </p>
          </section>
        )}

        {!loading && !error && filteredProperties.length > 0 && (
          <>
            <section
              className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3"
              aria-label="Approved student accommodation"
            >
              {filteredProperties.map((property) => {
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
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
                          <Building2 className="h-9 w-9" aria-hidden="true" />
                          <span className="sr-only">
                            No property image available
                          </span>
                        </div>
                      )}

                      <span className="absolute left-4 top-4 rounded-full border border-blue-200 bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                        {property.type || "Accommodation"}
                      </span>
                    </div>

                    <div className="min-w-0 p-4 sm:p-5">
                      <h2 className="break-words text-lg font-semibold text-slate-900 sm:text-xl">
                        {property.name || "Student stay"}
                      </h2>

                      {location && (
                        <p className="mt-2 flex min-w-0 items-start gap-2 text-sm text-slate-500">
                          <MapPin
                            className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                            aria-hidden="true"
                          />
                          <span>{location}</span>
                        </p>
                      )}

                      {property.description && (
                        <p className="mt-3 break-words text-sm leading-6 text-slate-600">
                          {property.description}
                        </p>
                      )}

                      <Link
                        to={`/lodge/${property._id}`}
                        className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        View stay
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </section>

            {pagination && pagination.totalPages > 1 && (
              <nav
                className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between"
                aria-label="Property pages"
              >
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() =>
                    setPage((currentPage) => Math.max(1, currentPage - 1))
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Previous
                </button>

                <span className="text-center text-sm text-slate-500">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Explore;
