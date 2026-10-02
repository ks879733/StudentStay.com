import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, CalendarDays, MapPin, ReceiptText } from "lucide-react";
import api from "../api/api";

const currencyFormatter = new Intl.NumberFormat("en-IN");

const bookingStatusStyles = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border-blue-200 bg-blue-50 text-blue-700",
  completed: "border-slate-200 bg-slate-100 text-slate-700",
  cancelled: "border-slate-200 bg-slate-100 text-slate-600",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

const paymentStatusStyles = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  paid: "border-blue-200 bg-blue-50 text-blue-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  refunded: "border-slate-200 bg-slate-100 text-slate-700",
};

const formatLabel = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "Unknown";

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString();
};

const MyBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/user/my-booking");
        setBookings(response.data.booking || []);
      } catch (requestError) {
        if (requestError.response?.status === 403) {
          setError("Log in to view your bookings.");
        } else {
          setError(
            requestError.response?.data?.message ||
              "We could not load your bookings. Please try again.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [reload]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 text-slate-900 sm:px-6 sm:py-9 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-7 sm:mb-9">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Student account
          </p>
          <h1 className="mt-2 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
            My bookings
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Track your room bookings, monthly rent, and payment status.
          </p>
          {!loading && !error && bookings.length > 0 && (
            <p className="mt-4 text-sm text-slate-500">
              {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
            </p>
          )}
        </header>

        {loading && (
          <div
            className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm"
            role="status"
          >
            Loading your bookings...
          </div>
        )}

        {!loading && error && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <p className="break-words text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => setReload((currentReload) => currentReload + 1)}
              className="mt-5 min-h-10 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Try again
            </button>
          </section>
        )}

        {!loading && !error && bookings.length === 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
            <ReceiptText
              className="mx-auto h-8 w-8 text-slate-400"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No bookings yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Your room bookings will appear here after you request one.
            </p>
            <Link
              to="/explore"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Explore stays
            </Link>
          </section>
        )}

        {!loading && !error && bookings.length > 0 && (
          <section className="space-y-4" aria-label="Your bookings">
            {bookings.map((booking) => {
              const image = booking.lodge?.images?.[0];
              const imageUrl = typeof image === "string" ? image : image?.url;
              const bookingStatus = booking.bookingStatus || "pending";
              const paymentStatus = booking.paymentStatus || "pending";
              const location = [
                booking.lodge?.address?.area,
                booking.lodge?.address?.city,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <article
                  key={booking._id}
                  className="grid min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm sm:grid-cols-[12rem_minmax(0,1fr)]"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100 sm:aspect-auto sm:min-h-full">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={booking.lodge?.name || "Booked lodge"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full min-h-36 items-center justify-center text-slate-400">
                        <Building2 className="h-8 w-8" aria-hidden="true" />
                        <span className="sr-only">
                          No lodge image available
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 p-4 sm:p-5">
                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="break-words text-lg font-semibold text-slate-900">
                          {booking.lodge?.name || "Lodge details unavailable"}
                        </h2>
                        <p className="mt-1 break-words text-sm capitalize text-slate-600">
                          Room {booking.room?.roomNumber || "unavailable"}
                          {booking.room?.sharingType &&
                            ` · ${booking.room.sharingType} sharing`}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                            bookingStatusStyles[bookingStatus] ||
                            "border-slate-200 bg-slate-100 text-slate-700"
                          }`}
                        >
                          {formatLabel(bookingStatus)}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                            paymentStatusStyles[paymentStatus] ||
                            "border-slate-200 bg-slate-100 text-slate-700"
                          }`}
                        >
                          Payment {formatLabel(paymentStatus)}
                        </span>
                      </div>
                    </div>

                    {location && (
                      <p className="mt-3 flex min-w-0 items-start gap-2 break-words text-sm text-slate-600">
                        <MapPin
                          className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                          aria-hidden="true"
                        />
                        <span>{location}</span>
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-200 pt-4 sm:grid-cols-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-[0.07em] text-slate-500">
                          Monthly rent
                        </p>
                        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                          ₹{currencyFormatter.format(booking.rentPerMonth)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-[0.07em] text-slate-500">
                          Payment amount
                        </p>
                        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                          ₹{currencyFormatter.format(booking.totalAmount)}
                        </p>
                      </div>
                      <div className="col-span-2 min-w-0 sm:col-span-1">
                        <p className="text-xs font-medium uppercase tracking-[0.07em] text-slate-500">
                          Booking date
                        </p>
                        <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-700">
                          <CalendarDays
                            className="h-4 w-4 shrink-0 text-slate-500"
                            aria-hidden="true"
                          />
                          {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {bookingStatus === "pending" &&
                        paymentStatus === "pending" && (
                          <Link
                            to={`/booking/${booking._id}/payment`}
                            className="flex min-h-10 flex-1 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 sm:flex-none"
                          >
                            Continue payment
                          </Link>
                        )}
                      <Link
                        to={`/bookings/${booking._id}`}
                        className="flex min-h-10 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:flex-none"
                      >
                        Booking details
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default MyBooking;
