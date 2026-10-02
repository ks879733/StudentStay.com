import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BedDouble, Building2, MapPin, Phone } from "lucide-react";
import api from "../api/api";

const LodgeDetails = () => {
  const { lodgeId } = useParams();
  const [lodge, setLodge] = useState(null);
  const [roomCount, setRoomCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const loadLodge = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/user/lodges/${lodgeId}/rooms`);
        setLodge(response.data.lodge);
        setRoomCount(response.data.count || 0);
      } catch (requestError) {
        if (requestError.response?.status === 404) {
          setError("This approved lodge could not be found.");
        } else {
          setError(
            requestError.response?.data?.message ||
              "We could not load this lodge. Please try again.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadLodge();
  }, [lodgeId, reload]);

  const images = (lodge?.images || [])
    .map((image) => (typeof image === "string" ? image : image?.url))
    .filter(Boolean);

  const address = lodge?.address;
  const fullAddress = [
    address?.street,
    address?.area,
    address?.city,
    address?.state,
    address?.pincode,
    address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          to="/explore"
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to explore
        </Link>

        {loading && (
          <div
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm"
            role="status"
          >
            Loading lodge details...
          </div>
        )}

        {!loading && error && (
          <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
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

        {!loading && !error && lodge && (
          <article className="mt-6 min-w-0">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="grid aspect-video max-h-[460px] min-h-[220px] overflow-hidden sm:aspect-[2/1]">
                {images[0] ? (
                  <img
                    src={images[0]}
                    alt={lodge.name || "Lodge"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center bg-slate-100 text-slate-400">
                    <Building2 className="h-10 w-10" aria-hidden="true" />
                    <span className="sr-only">No lodge image available</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8">
              <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                    {lodge.type || "Accommodation"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                    Approved
                  </span>
                </div>

                <h1 className="mt-4 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                  {lodge.name || "Student accommodation"}
                </h1>

                {fullAddress && (
                  <p className="mt-3 flex min-w-0 items-start gap-2 break-words text-sm leading-6 text-slate-600">
                    <MapPin
                      className="mt-1 h-4 w-4 shrink-0 text-blue-600"
                      aria-hidden="true"
                    />
                    <span>{fullAddress}</span>
                  </p>
                )}

                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    About this stay
                  </h2>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                    {lodge.description || "No description has been provided."}
                  </p>
                </div>

                {lodge.amenities?.length > 0 && (
                  <div className="mt-8 border-t border-slate-200 pt-6">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Amenities
                    </h2>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {lodge.amenities.map((amenity, index) => (
                        <li
                          key={`${amenity}-${index}`}
                          className="max-w-full break-words rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                        >
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              <aside className="h-fit min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <BedDouble className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Rooms listed</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {roomCount}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Monthly rent and room availability are shown with each room.
                </p>

                {lodge.contactPhone && (
                  <a
                    href={`tel:${lodge.contactPhone}`}
                    className="mt-5 flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="break-words">Contact lodge</span>
                  </a>
                )}

                <Link
                  to={`/lodge/${lodgeId}/rooms`}
                  className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  View rooms
                </Link>
              </aside>
            </div>
          </article>
        )}
      </div>
    </main>
  );
};

export default LodgeDetails;
