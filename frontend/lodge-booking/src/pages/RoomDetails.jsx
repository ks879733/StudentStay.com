import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import api from "../api/api";

const currencyFormatter = new Intl.NumberFormat("en-IN");

const statusStyles = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-100 text-slate-600",
  maintenance: "border-amber-200 bg-amber-50 text-amber-700",
};

const RoomDetails = () => {
  const { lodgeId, roomId } = useParams();
  const [lodge, setLodge] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const loadRoom = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/user/lodges/${lodgeId}/rooms`);
        const selectedRoom = (response.data.rooms || []).find(
          (item) => item._id === roomId,
        );

        if (!selectedRoom) {
          setError("This room could not be found in the selected lodge.");
          return;
        }

        setLodge(response.data.lodge);
        setRoom(selectedRoom);
      } catch (requestError) {
        if (requestError.response?.status === 404) {
          setError("This approved lodge could not be found.");
        } else {
          setError(
            requestError.response?.data?.message ||
              "We could not load this room. Please try again.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [lodgeId, roomId, reload]);

  const images = (room?.roomImage || [])
    .map((image) => (typeof image === "string" ? image : image?.url))
    .filter(Boolean);
  const status = room?.status || "inactive";
  const statusClass = statusStyles[status] || statusStyles.inactive;
  const location = [lodge?.address?.area, lodge?.address?.city]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          to={`/lodge/${lodgeId}/rooms`}
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All rooms
        </Link>

        {loading && (
          <div
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm"
            role="status"
          >
            Loading room details...
          </div>
        )}

        {!loading && error && (
          <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <p className="break-words text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => setReload((currentReload) => currentReload + 1)}
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Try again
            </button>
          </section>
        )}

        {!loading && !error && room && lodge && (
          <article className="mt-6 min-w-0">
            <div
              className={`grid min-w-0 gap-3 ${
                images.length > 1
                  ? "sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
                  : ""
              }`}
            >
              <div className="grid aspect-video min-h-52 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm sm:aspect-auto sm:min-h-80">
                {images[0] ? (
                  <img
                    src={images[0]}
                    alt={`Room ${room.roomNumber} at ${lodge.name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center bg-slate-100 text-slate-400">
                    <BedDouble className="h-10 w-10" aria-hidden="true" />
                    <span className="sr-only">No room image available</span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div
                  className={`grid gap-3 ${
                    images.length > 2 ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {images.slice(1, 3).map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="aspect-video overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm sm:aspect-auto sm:min-h-40"
                    >
                      <img
                        src={image}
                        alt={`Room ${room.roomNumber}, photo ${index + 2}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-10">
              <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] capitalize ${statusClass}`}
                  >
                    {status}
                  </span>
                  {room.roomType && (
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] capitalize text-slate-700">
                      {room.roomType} room
                    </span>
                  )}
                </div>

                <h1 className="mt-4 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                  Room {room.roomNumber}
                </h1>

                <Link
                  to={`/lodge/${lodgeId}`}
                  className="mt-3 inline-flex min-w-0 items-start gap-2 break-words text-sm text-slate-600 transition hover:text-blue-700"
                >
                  <Building2
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                    aria-hidden="true"
                  />
                  <span>{lodge.name}</span>
                </Link>

                {location && (
                  <p className="mt-2 flex min-w-0 items-start gap-2 break-words text-sm text-slate-600">
                    <MapPin
                      className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                      aria-hidden="true"
                    />
                    <span>{location}</span>
                  </p>
                )}

                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                      Sharing
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold capitalize text-slate-800">
                      {room.sharingType || "Not specified"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                      Capacity
                    </p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Users
                        className="h-4 w-4 text-slate-500"
                        aria-hidden="true"
                      />
                      {room.capacity}
                    </p>
                  </div>
                  <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-1">
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                      Beds
                    </p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <BedDouble
                        className="h-4 w-4 text-slate-500"
                        aria-hidden="true"
                      />
                      {room.beds}
                    </p>
                  </div>
                </div>

                {room.amenities?.length > 0 && (
                  <div className="mt-8 border-t border-slate-200 pt-6">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Room amenities
                    </h2>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {room.amenities.map((amenity, index) => (
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
                <p className="text-sm text-slate-500">Monthly rent</p>
                <p className="mt-1 break-words text-3xl font-bold text-slate-900">
                  ₹{currencyFormatter.format(room.rentPerMonth)}
                  <span className="ml-1 text-sm font-normal text-slate-500">
                    / month
                  </span>
                </p>

                {lodge.contactPhone && (
                  <a
                    href={`tel:${lodge.contactPhone}`}
                    className="mt-5 flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Contact lodge
                  </a>
                )}

                {status === "active" ? (
                  <Link
                    to={`/booking/${lodgeId}/rooms/${room._id}`}
                    className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Continue to booking
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-3 min-h-11 w-full cursor-not-allowed rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
                  >
                    Booking unavailable
                  </button>
                )}
              </aside>
            </div>
          </article>
        )}
      </div>
    </main>
  );
};

export default RoomDetails;
