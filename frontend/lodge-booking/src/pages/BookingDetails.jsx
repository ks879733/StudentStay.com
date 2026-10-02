import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarDays,
  CreditCard,
  MapPin,
  Users,
} from "lucide-react";
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
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
};

const BookingDetails = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const loadBooking = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/user/my-booking/${bookingId}`);
        setBooking(response.data.booking);
      } catch (requestError) {
        if (requestError.response?.status === 404) {
          setError("This booking could not be found in your account.");
        } else if (requestError.response?.status === 403) {
          setError("Log in with the account that created this booking.");
        } else {
          setError(
            requestError.response?.data?.message ||
              "We could not load this booking. Please try again.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, reload]);

  const bookingStatus = booking?.bookingStatus || "pending";
  const paymentStatus = booking?.paymentStatus || "pending";
  const lodgeImage = booking?.lodge?.images?.[0];
  const imageUrl =
    typeof lodgeImage === "string" ? lodgeImage : lodgeImage?.url;
  const address = booking?.lodge?.address;
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
      <div className="mx-auto w-full max-w-5xl">
        <Link
          to="/bookings"
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          My bookings
        </Link>

        {loading && (
          <div
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm"
            role="status"
          >
            Loading booking details...
          </div>
        )}

        {!loading && error && (
          <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
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

        {!loading && !error && booking && (
          <>
            <header className="mb-6 mt-6 flex min-w-0 flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Booking details
                </p>
                <h1 className="mt-2 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                  {booking.lodge?.name || "Your booking"}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Reference: <span className="break-all">{booking._id}</span>
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
            </header>

            <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-8">
              <div className="min-w-0 space-y-5">
                <section className="grid min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm sm:grid-cols-[minmax(12rem,0.85fr)_minmax(0,1fr)]">
                  <div className="aspect-[16/10] min-w-0 overflow-hidden bg-slate-100 sm:aspect-auto sm:min-h-52">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={booking.lodge?.name || "Booked lodge"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-36 items-center justify-center text-slate-400">
                        <Building2 className="h-9 w-9" aria-hidden="true" />
                        <span className="sr-only">
                          No lodge image available
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                      {booking.lodge?.type || "Accommodation"}
                    </p>
                    <h2 className="mt-2 break-words text-lg font-semibold text-slate-900">
                      Room {booking.room?.roomNumber || "details unavailable"}
                    </h2>
                    <p className="mt-1 break-words text-sm capitalize text-slate-600">
                      {booking.room?.roomType || "Room"} ·{" "}
                      {booking.room?.sharingType || "Sharing"} sharing
                    </p>
                    {fullAddress && (
                      <p className="mt-4 flex min-w-0 items-start gap-2 break-words text-sm leading-6 text-slate-600">
                        <MapPin
                          className="mt-1 h-4 w-4 shrink-0 text-blue-600"
                          aria-hidden="true"
                        />
                        <span>{fullAddress}</span>
                      </p>
                    )}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <h2 className="text-base font-semibold text-slate-900">
                    Stay information
                  </h2>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
                    <div className="min-w-0">
                      <dt className="text-xs font-medium uppercase tracking-[0.07em] text-slate-500">
                        Occupants
                      </dt>
                      <dd className="mt-1 inline-flex items-center gap-2 text-sm text-slate-800">
                        <Users
                          className="h-4 w-4 text-slate-500"
                          aria-hidden="true"
                        />
                        {booking.occupants}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs font-medium uppercase tracking-[0.07em] text-slate-500">
                        Room capacity
                      </dt>
                      <dd className="mt-1 text-sm text-slate-800">
                        {booking.room?.capacity ?? "Not available"}
                      </dd>
                    </div>
                    <div className="col-span-2 min-w-0 sm:col-span-1">
                      <dt className="text-xs font-medium uppercase tracking-[0.07em] text-slate-500">
                        Beds
                      </dt>
                      <dd className="mt-1 inline-flex items-center gap-2 text-sm text-slate-800">
                        <BedDouble
                          className="h-4 w-4 text-slate-500"
                          aria-hidden="true"
                        />
                        {booking.room?.beds ?? "Not available"}
                      </dd>
                    </div>
                    <div className="col-span-2 min-w-0 sm:col-span-1">
                      <dt className="text-xs font-medium uppercase tracking-[0.07em] text-slate-500">
                        Booking date
                      </dt>
                      <dd className="mt-1 inline-flex items-center gap-2 text-sm text-slate-800">
                        <CalendarDays
                          className="h-4 w-4 shrink-0 text-slate-500"
                          aria-hidden="true"
                        />
                        <span className="break-words">
                          {formatDate(booking.createdAt)}
                        </span>
                      </dd>
                    </div>
                    {booking.expiresAt && (
                      <div className="col-span-2 min-w-0 sm:col-span-2">
                        <dt className="text-xs font-medium uppercase tracking-[0.07em] text-slate-500">
                          Payment deadline
                        </dt>
                        <dd className="mt-1 text-sm text-slate-800">
                          {formatDate(booking.expiresAt)}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {booking.specialRequests && (
                    <div className="mt-6 border-t border-slate-200 pt-5">
                      <h3 className="text-sm font-medium text-slate-700">
                        Special requests
                      </h3>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                        {booking.specialRequests}
                      </p>
                    </div>
                  )}
                </section>
              </div>

              <aside className="h-fit min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">
                  Payment summary
                </h2>
                <dl className="mt-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="min-w-0 text-sm text-slate-600">
                      Monthly rent
                    </dt>
                    <dd className="shrink-0 text-sm font-semibold text-slate-800">
                      ₹{currencyFormatter.format(booking.rentPerMonth)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="min-w-0 text-sm text-slate-600">
                      Booking payment amount
                    </dt>
                    <dd className="shrink-0 text-sm font-semibold text-slate-800">
                      ₹{currencyFormatter.format(booking.totalAmount)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3 border-t border-slate-200 pt-4">
                    <dt className="min-w-0 text-sm text-slate-600">
                      Amount paid
                    </dt>
                    <dd className="shrink-0 text-sm font-semibold text-slate-800">
                      ₹{currencyFormatter.format(booking.amountPaid || 0)}
                    </dd>
                  </div>
                </dl>

                {booking.razorpayPaymentId && (
                  <div className="mt-5 border-t border-slate-200 pt-4">
                    <p className="text-xs font-medium uppercase tracking-[0.07em] text-slate-500">
                      Payment reference
                    </p>
                    <p className="mt-1 break-all text-xs text-slate-700">
                      {booking.razorpayPaymentId}
                    </p>
                  </div>
                )}

                {bookingStatus === "pending" && paymentStatus === "pending" && (
                  <Link
                    to={`/booking/${booking._id}/payment`}
                    className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <CreditCard className="h-4 w-4" aria-hidden="true" />
                    Continue payment
                  </Link>
                )}
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default BookingDetails;
