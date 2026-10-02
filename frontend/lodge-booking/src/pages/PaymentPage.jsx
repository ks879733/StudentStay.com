import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Clock3,
  CreditCard,
} from "lucide-react";
import api from "../api/api";

const currencyFormatter = new Intl.NumberFormat("en-IN");

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PaymentPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [checkoutOrder, setCheckoutOrder] = useState(null);
  const [verificationDetails, setVerificationDetails] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const loadBooking = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/user/my-booking/${bookingId}`);
        setBooking(response.data.booking);
      } catch (requestError) {
        if (requestError.response?.status === 404) {
          setError("This booking could not be found.");
        } else if (requestError.response?.status === 403) {
          setError("Please log in with the account that created this booking.");
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
  }, [bookingId]);

  const verifyPayment = async (details) => {
    setError("");
    setNotice("");
    setVerifying(true);

    try {
      const response = await api.post(
        `/booking/booking/${bookingId}/verify-payment`,
        {
          razorpay_order_id: details.razorpay_order_id,
          razorpay_payment_id: details.razorpay_payment_id,
          razorpay_signature: details.razorpay_signature,
        },
      );

      setBooking(response.data.booking);
      setCheckoutOrder(null);
      setVerificationDetails(null);
    } catch (requestError) {
      setVerificationDetails(details);
      setError(
        requestError.response?.data?.message ||
          "Payment was submitted, but confirmation could not be verified. Retry verification; do not pay again.",
      );
    } finally {
      setVerifying(false);
      setPaymentLoading(false);
    }
  };

  const openCheckout = (order) => {
    const checkout = new window.Razorpay({
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: "StudentStay",
      description: `Monthly rent for Room ${booking.room?.roomNumber || ""}`,
      order_id: order.orderId,
      handler: verifyPayment,
      modal: {
        ondismiss: () => {
          setPaymentLoading(false);
          setNotice(
            "Checkout was closed. You can resume this payment from this page.",
          );
        },
      },
      theme: { color: "#2563eb" },
    });

    checkout.open();
  };

  const handlePayment = async () => {
    setError("");
    setNotice("");
    setPaymentLoading(true);

    try {
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        throw new Error(
          "Razorpay checkout could not be loaded. Check your connection and try again.",
        );
      }

      if (checkoutOrder) {
        openCheckout(checkoutOrder);
        return;
      }

      const response = await api.post(`/booking/booking/${bookingId}/payment`);
      const order = response.data;

      if (!order.orderId || !order.key || !order.amount || !order.currency) {
        throw new Error("The server did not return complete payment details.");
      }

      setCheckoutOrder(order);
      openCheckout(order);
    } catch (requestError) {
      setPaymentLoading(false);
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "We could not start payment. Please try again.",
      );
    }
  };

  const confirmed =
    booking?.bookingStatus === "confirmed" && booking?.paymentStatus === "paid";
  const canPay =
    booking?.bookingStatus === "pending" &&
    booking?.paymentStatus === "pending";
  const bookingExpired = error.toLowerCase().includes("expired");
  const existingOrderCannotResume =
    Boolean(booking?.razorpayOrderId) && !checkoutOrder && canPay;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
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
            Loading booking...
          </div>
        )}

        {!loading && error && !booking && (
          <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <p className="break-words text-sm text-red-700">{error}</p>
            <Link
              to="/bookings"
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
            >
              Back to bookings
            </Link>
          </section>
        )}

        {!loading && booking && (
          <>
            <header className="mb-7 mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                {confirmed ? "Payment confirmed" : "Booking payment"}
              </p>
              <h1 className="mt-2 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                {confirmed ? "Your stay is confirmed" : "Complete your payment"}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Booking reference:{" "}
                <span className="break-all">{booking._id}</span>
              </p>
            </header>

            {confirmed ? (
              <section className="rounded-3xl border border-blue-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex items-start gap-3">
                  <BadgeCheck
                    className="mt-0.5 h-6 w-6 shrink-0 text-blue-600"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Payment successful
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Your booking is confirmed. You can find its details in My
                      Bookings.
                    </p>
                  </div>
                </div>
                <Link
                  to="/bookings"
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                >
                  View my bookings
                </Link>
              </section>
            ) : (
              <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-8">
                <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Booking summary
                  </h2>

                  <div className="mt-5 space-y-4 border-b border-slate-200 pb-5">
                    <div className="flex min-w-0 items-start gap-3">
                      <Building2
                        className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="break-words text-sm font-medium text-slate-800">
                          {booking.lodge?.name || "Lodge"}
                        </p>
                        <p className="mt-1 break-words text-xs text-slate-500">
                          {[
                            booking.lodge?.address?.area,
                            booking.lodge?.address?.city,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex min-w-0 items-start gap-3">
                      <CreditCard
                        className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="break-words text-sm font-medium text-slate-800">
                          Room {booking.room?.roomNumber || ""}
                        </p>
                        <p className="mt-1 break-words text-xs capitalize text-slate-500">
                          {booking.room?.sharingType} sharing ·{" "}
                          {booking.occupants}{" "}
                          {booking.occupants === 1 ? "occupant" : "occupants"}
                        </p>
                      </div>
                    </div>

                    {booking.createdAt && (
                      <div className="flex items-start gap-3 text-sm text-slate-600">
                        <Clock3
                          className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
                          aria-hidden="true"
                        />
                        <span>
                          Booking date:{" "}
                          {new Date(booking.createdAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div
                      className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 break-words text-sm text-red-700"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}
                  {notice && (
                    <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 break-words text-sm text-slate-700">
                      {notice}
                    </p>
                  )}

                  {verificationDetails && (
                    <button
                      type="button"
                      onClick={() => verifyPayment(verificationDetails)}
                      disabled={verifying}
                      className="mt-4 min-h-10 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                    >
                      {verifying
                        ? "Verifying..."
                        : "Retry payment verification"}
                    </button>
                  )}
                </section>

                <aside className="h-fit min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-base font-semibold text-slate-900">
                    Payment
                  </h2>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700">Monthly rent</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Payment amount is one month
                      </p>
                    </div>
                    <p className="shrink-0 text-lg font-bold text-slate-900">
                      ₹{currencyFormatter.format(booking.totalAmount)}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.07em] text-slate-500">
                        Booking
                      </p>
                      <p className="mt-1 text-sm capitalize text-slate-800">
                        {booking.bookingStatus}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.07em] text-slate-500">
                        Payment
                      </p>
                      <p className="mt-1 text-sm capitalize text-slate-800">
                        {booking.paymentStatus}
                      </p>
                    </div>
                  </div>

                  {booking.expiresAt && (
                    <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
                      <Clock3
                        className="mt-0.5 h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      Complete payment before{" "}
                      {new Date(booking.expiresAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      .
                    </p>
                  )}

                  {existingOrderCannotResume && (
                    <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-700">
                      A payment order already exists, but this page cannot
                      resume it after a reload. The backend does not provide an
                      order-retrieval endpoint.
                    </p>
                  )}

                  {canPay &&
                  !existingOrderCannotResume &&
                  !verificationDetails ? (
                    <button
                      type="button"
                      onClick={handlePayment}
                      disabled={paymentLoading || verifying}
                      className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-50"
                    >
                      <CreditCard className="h-4 w-4" aria-hidden="true" />
                      {paymentLoading
                        ? "Opening secure checkout..."
                        : checkoutOrder
                          ? "Resume payment"
                          : "Pay securely"}
                    </button>
                  ) : !confirmed &&
                    !bookingExpired &&
                    !verificationDetails &&
                    !canPay ? (
                    <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                      This booking is not awaiting payment.
                    </p>
                  ) : null}

                  {bookingExpired && (
                    <Link
                      to="/explore"
                      className="mt-5 flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                    >
                      Explore other stays
                    </Link>
                  )}
                </aside>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default PaymentPage;
