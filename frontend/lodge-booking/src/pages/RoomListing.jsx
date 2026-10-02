import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  ChevronRight,
  MapPin,
  Users,
} from "lucide-react";
import api from "../api/api";

const currencyFormatter = new Intl.NumberFormat("en-IN");

const statusStyles = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-100 text-slate-600",
  maintenance: "border-amber-200 bg-amber-50 text-amber-700",
};

const RoomListing = () => {
  const { lodgeId } = useParams();
  const [lodge, setLodge] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const loadRooms = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/user/lodges/${lodgeId}/rooms`);
        setLodge(response.data.lodge);
        setRooms(response.data.rooms || []);
      } catch (requestError) {
        if (requestError.response?.status === 404) {
          setError("This approved lodge could not be found.");
        } else {
          setError(
            requestError.response?.data?.message ||
              "We could not load the rooms. Please try again.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [lodgeId, reload]);

  const activeRoomCount = rooms.filter(
    (room) => room.status === "active",
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Link
          to={`/lodge/${lodgeId}`}
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Lodge details
        </Link>

        {loading && (
          <div
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm"
            role="status"
          >
            Loading rooms...
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

        {!loading && !error && lodge && (
          <>
            <header className="mb-7 mt-6 border-b border-slate-200 pb-6 sm:mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Room options
              </p>
              <h1 className="mt-2 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                Rooms at {lodge.name}
              </h1>
              {lodge.address && (
                <p className="mt-3 flex min-w-0 items-start gap-2 break-words text-sm text-slate-600">
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                    aria-hidden="true"
                  />
                  <span>
                    {[lodge.address.area, lodge.address.city]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </p>
              )}
              <p className="mt-4 text-sm text-slate-500">
                {rooms.length}{" "}
                {rooms.length === 1 ? "room listed" : "rooms listed"}
                {activeRoomCount > 0 && (
                  <span> · {activeRoomCount} marked active</span>
                )}
              </p>
            </header>

            {rooms.length === 0 ? (
              <section className="rounded-3xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
                <Building2
                  className="mx-auto h-8 w-8 text-slate-400"
                  aria-hidden="true"
                />
                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                  No rooms listed yet
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  This lodge has not added any rooms for students to view.
                </p>
              </section>
            ) : (
              <section
                className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
                aria-label={`Rooms at ${lodge.name}`}
              >
                {rooms.map((room) => {
                  const image = room.roomImage?.[0];
                  const imageUrl =
                    typeof image === "string" ? image : image?.url;
                  const status = room.status || "inactive";
                  const statusClass =
                    statusStyles[status] || statusStyles.inactive;

                  return (
                    <article
                      key={room._id}
                      className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`Room ${room.roomNumber || ""} at ${lodge.name}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <BedDouble className="h-8 w-8" aria-hidden="true" />
                            <span className="sr-only">
                              No room image available
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 p-4 sm:p-5">
                        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                          <h2 className="min-w-0 break-words text-lg font-semibold text-slate-900">
                            Room {room.roomNumber}
                          </h2>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] capitalize ${statusClass}`}
                          >
                            {status}
                          </span>
                        </div>

                        <p className="mt-1 text-sm capitalize text-slate-600">
                          {room.roomType || "Room"} ·{" "}
                          {room.sharingType || "Sharing"} sharing
                        </p>

                        <p className="mt-4 break-words text-2xl font-bold text-slate-900">
                          ₹{currencyFormatter.format(room.rentPerMonth)}
                          <span className="ml-1 text-sm font-normal text-slate-500">
                            / month
                          </span>
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-2">
                            <Users
                              className="h-4 w-4 text-slate-500"
                              aria-hidden="true"
                            />
                            Capacity: {room.capacity}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <BedDouble
                              className="h-4 w-4 text-slate-500"
                              aria-hidden="true"
                            />
                            {room.beds} {room.beds === 1 ? "bed" : "beds"}
                          </span>
                        </div>

                        {room.amenities?.length > 0 && (
                          <ul className="mt-4 flex flex-wrap gap-2">
                            {room.amenities.map((amenity, index) => (
                              <li
                                key={`${amenity}-${index}`}
                                className="max-w-full break-words rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700"
                              >
                                {amenity}
                              </li>
                            ))}
                          </ul>
                        )}

                        <Link
                          to={`/lodge/${lodgeId}/rooms/${room._id}`}
                          className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Room details
                          <ChevronRight
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default RoomListing;
