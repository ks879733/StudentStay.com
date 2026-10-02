import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Users } from "lucide-react";
import api from "../api/api";
import OwnerSidebar from "./OwnerSideBar";
import OwnerBackButton from "./OwnerBackButton";

const currencyFormatter = new Intl.NumberFormat("en-IN");

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
};

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOwnerBookings = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/owner/bookings");
        setBookings(response.data.bookings || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "We could not load your bookings right now.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerBookings();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <OwnerSidebar />

      <main className="min-h-screen px-4 pb-8 pt-20 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
        <header className="mb-7">
          <OwnerBackButton />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Owner panel
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="mt-2 text-sm text-slate-600">
            Confirmed reservations for your properties.
          </p>
        </header>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Loading bookings...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <CalendarDays
              className="mx-auto h-8 w-8 text-slate-400"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              No confirmed bookings yet
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Your students’ confirmed reservations will appear here.
            </p>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const lodge = booking.lodge || {};
              const room = booking.room || {};
              const user = booking.user || {};
              const address = lodge.address || {};
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
                  key={booking._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                        Booking #{String(booking._id).slice(-6)}
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-slate-900">
                        {lodge.name || "Lodge"}
                      </h2>
                    </div>

                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                      Confirmed
                    </span>
                  </div>

                  <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                    <div className="space-y-4">
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin
                          className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                          aria-hidden="true"
                        />
                        <span>{locationText || "Location not available"}</span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                            Guest
                          </p>
                          <p className="mt-2 text-sm font-medium text-slate-800">
                            {user.name || "Student"}
                          </p>
                          <p className="mt-1 break-all text-xs text-slate-600">
                            {user.email || "Email not available"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                            Room
                          </p>
                          <p className="mt-2 text-sm font-medium text-slate-800">
                            Room {room.roomNumber || "N/A"}
                          </p>
                          <p className="mt-1 text-xs text-slate-600 capitalize">
                            {room.roomType || "Room"} ·{" "}
                            {room.sharingType || "Sharing"} sharing
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                        <Users className="h-4 w-4" aria-hidden="true" />
                        Booking details
                      </div>

                      <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-slate-600">Occupants</dt>
                          <dd className="font-medium text-slate-800">
                            {booking.occupants || 0}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-slate-600">Rent</dt>
                          <dd className="font-medium text-slate-800">
                            ₹
                            {currencyFormatter.format(
                              booking.rentPerMonth || 0,
                            )}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-slate-600">Total</dt>
                          <dd className="font-medium text-slate-800">
                            ₹
                            {currencyFormatter.format(booking.totalAmount || 0)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-slate-600">Booked on</dt>
                          <dd className="text-right text-slate-800">
                            {formatDate(booking.createdAt)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default OwnerBookings;
