import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BedDouble, Building2, Clock3, Users } from "lucide-react";
import api from "../api/api";

const currencyFormatter = new Intl.NumberFormat("en-IN");

const BookingPage = () => {
  const { lodgeId, roomId } = useParams();
  const [lodge, setLodge] = useState(null);
  const [room, setRoom] = useState(null);
  const [occupants, setOccupants] = useState("1");
  const [specialRequests, setSpecialRequests] = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      const response = await api.post(`/booking/booking/${roomId}`, {
        occupants: Number(occupants),
        specialRequests: specialRequests.trim(),
      });
      setBooking(response.data.newBooking);
    } catch (requestError) {
      if (requestError.response?.status === 403) {
        setError("Please log in before requesting a booking.");
      } else {
        setError(
          requestError.response?.data?.message ||
            "We could not create this booking. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const monthlyRent = room?.rentPerMonth ?? 0;
  const expiresAt = booking?.expiresAt
    ? new Date(booking.expiresAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          to={`/lodge/${lodgeId}/rooms/${roomId}`}
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Room details
        </Link>

        {loading && (
          <div
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm"
            role="status"
          >
            Loading booking details...
          </div>
        )}

        {!loading && error && !room && (
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

        {!loading && room && lodge && (
          <>
            <header className="mb-7 mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Booking request
              </p>
              <h1 className="mt-2 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                Book Room {room.roomNumber}
              </h1>
              <p className="mt-2 flex min-w-0 items-center gap-2 break-words text-sm text-slate-600">
                <Building2
                  className="h-4 w-4 shrink-0 text-blue-600"
                  aria-hidden="true"
                />
                {lodge.name}
              </p>
            </header>

            {booking ? (
              <section className="rounded-3xl border border-blue-200 bg-white p-5 shadow-sm sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Booking created
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  Your room is held temporarily
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Complete payment to confirm your booking.
                  {expiresAt &&
                    ` This pending booking expires at ${expiresAt}.`}
                </p>

                <div className="mt-6 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.07em] text-slate-500">
                      Booking status
                    </p>
                    <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                      {booking.bookingStatus || "pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.07em] text-slate-500">
                      Payment status
                    </p>
                    <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                      {booking.paymentStatus || "pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.07em] text-slate-500">
                      Payment amount
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      ₹{currencyFormatter.format(booking.totalAmount)}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/booking/${booking._id}/payment`}
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                >
                  Continue to payment
                </Link>
              </section>
            ) : (
              <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-8">
                <form
                  onSubmit={handleSubmit}
                  className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
                >
                  <h2 className="text-lg font-semibold text-slate-900">
                    Your booking
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Choose how many occupants will stay in this room.
                  </p>

                  {error && (
                    <p
                      className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 break-words text-sm text-red-700"
                      role="alert"
                    >
                      {error}
                    </p>
                  )}

                  {room.status !== "active" && (
                    <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      This room is marked {room.status || "inactive"} and cannot
                      be booked right now.
                    </p>
                  )}

                  <label
                    htmlFor="occupants"
                    className="mt-6 block text-sm font-medium text-slate-700"
                  >
                    Occupants
                  </label>
                  <select
                    id="occupants"
                    value={occupants}
                    onChange={(event) => setOccupants(event.target.value)}
                    disabled={room.status !== "active" || submitting}
                    className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    {Array.from({ length: room.capacity }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1} {index === 0 ? "occupant" : "occupants"}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5" aria-hidden="true" />
                    Maximum capacity: {room.capacity}
                  </p>

                  <label
                    htmlFor="specialRequests"
                    className="mt-6 block text-sm font-medium text-slate-700"
                  >
                    Special requests{" "}
                    <span className="text-slate-500">(optional)</span>
                  </label>
                  <textarea
                    id="specialRequests"
                    value={specialRequests}
                    onChange={(event) => setSpecialRequests(event.target.value)}
                    maxLength={1000}
                    rows={4}
                    disabled={room.status !== "active" || submitting}
                    placeholder="Add a request for the lodge owner"
                    className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                  <p className="mt-1 text-right text-xs text-slate-500">
                    {specialRequests.length}/1000
                  </p>

                  <button
                    type="submit"
                    disabled={submitting || room.status !== "active"}
                    className="mt-6 flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Creating booking..." : "Create booking"}
                  </button>
                </form>

                <aside className="h-fit min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-base font-semibold text-slate-900">
                    Booking summary
                  </h2>
                  <p className="mt-4 break-words text-sm font-semibold text-slate-800">
                    {lodge.name} · Room {room.roomNumber}
                  </p>
                  <p className="mt-1 text-sm capitalize text-slate-600">
                    {room.sharingType} sharing · {room.capacity} capacity
                  </p>

                  <div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-200 pt-4">
                    <div>
                      <p className="text-sm text-slate-500">Monthly rent</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Payment amount is one month
                      </p>
                    </div>
                    <p className="shrink-0 text-lg font-bold text-slate-900">
                      ₹{currencyFormatter.format(monthlyRent)}
                    </p>
                  </div>

                  <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
                    <Clock3
                      className="mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                    A pending booking is held for 10 minutes while you complete
                    payment.
                  </p>

                  <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <BedDouble className="h-4 w-4" aria-hidden="true" />
                      {room.beds} {room.beds === 1 ? "bed" : "beds"}
                    </span>
                  </div>
                </aside>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default BookingPage;
