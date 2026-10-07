import { useEffect, useState } from "react";
import { AlertTriangle, BedDouble, Building2, Send } from "lucide-react";
import api from "../api/api";
import OwnerBackButton from "../components/OwnerBackButton";
import OwnerSidebar from "../components/OwnerSideBar";

const statusStyles = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-100 text-slate-600",
  maintenance: "border-amber-200 bg-amber-50 text-amber-700",
};

const RoomManagement = () => {
  const [properties, setProperties] = useState([]);
  const [selectedLodgeId, setSelectedLodgeId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [reason, setReason] = useState("");
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const approvedProperties = properties.filter(
    (property) => property.status === "approved",
  );
  const selectedProperty = approvedProperties.find(
    (property) => property._id === selectedLodgeId,
  );

  useEffect(() => {
    const loadProperties = async () => {
      setLoadingProperties(true);
      setError("");

      try {
        const response = await api.get("/owner/my-properties");
        const ownerProperties = response.data.properties || [];
        const approved = ownerProperties.filter(
          (property) => property.status === "approved",
        );

        setProperties(ownerProperties);
        if (approved.length > 0) {
          setSelectedLodgeId(approved[0]._id);
        }
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "We could not load your properties. Please try again.",
        );
      } finally {
        setLoadingProperties(false);
      }
    };

    loadProperties();
  }, []);

  useEffect(() => {
    if (!selectedLodgeId) {
      return;
    }

    const loadRooms = async () => {
      setLoadingRooms(true);
      setError("");

      try {
        const response = await api.get(
          `/owner/property-owner/lodges/${selectedLodgeId}/rooms`,
        );
        setRooms(response.data.rooms || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "We could not load rooms for this lodge.",
        );
      } finally {
        setLoadingRooms(false);
      }
    };

    loadRooms();
  }, [selectedLodgeId]);

  const handleRequest = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedProperty) {
      setError("Select an approved lodge before sending a request.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post(
        `/booking/request-deactivate/${selectedProperty._id}`,
        { reason: reason.trim() },
      );
      setSuccess(
        response.data.message ||
          "Your lodge inactivation request was sent to the admin.",
      );
      setReason("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We could not send your request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full bg-slate-50 text-slate-900">
      <OwnerSidebar />

      <main className="w-full min-w-0 max-w-full px-4 pb-8 pt-20 sm:px-6 lg:ml-64 lg:w-auto lg:px-8 lg:py-8">
        <div className="mx-auto w-full min-w-0 max-w-7xl">
          <header className="mb-6 sm:mb-8">
            <OwnerBackButton />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Owner panel
            </p>
            <h1 className="mt-2 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
              RoomManagement
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Review rooms in your approved lodges and submit an inactivation
              request.
            </p>
          </header>

          {error && (
            <div
              className="mb-5 break-words rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm"
              role="alert"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm"
              role="status"
            >
              {success}
            </div>
          )}

          {loadingProperties ? (
            <div
              className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm"
              role="status"
            >
              Loading your properties...
            </div>
          ) : approvedProperties.length === 0 ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <Building2
                className="h-6 w-6 text-blue-600"
                aria-hidden="true"
              />
              <h2 className="mt-3 text-lg font-semibold text-slate-900">
                No approved lodges yet
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Room lists and inactivation requests are available for lodges
                after they have been approved.
              </p>
            </section>
          ) : (
            <>
              <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <label
                  htmlFor="room-management-lodge"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Approved lodge
                </label>
                <select
                  id="room-management-lodge"
                  value={selectedLodgeId}
                  onChange={(event) => {
                    setSelectedLodgeId(event.target.value);
                    setRooms([]);
                    setSuccess("");
                  }}
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 sm:max-w-xl"
                >
                  {approvedProperties.map((property) => (
                    <option key={property._id} value={property._id}>
                      {property.name} · {property.address?.city || "Location not set"}
                    </option>
                  ))}
                </select>
              </section>

              <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
                <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Rooms
                      </h2>
                      <p className="mt-1 break-words text-sm text-slate-500">
                        {selectedProperty?.name}
                      </p>
                    </div>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
                    </span>
                  </div>

                  {loadingRooms ? (
                    <p
                      className="py-10 text-center text-sm text-slate-500"
                      role="status"
                    >
                      Loading rooms...
                    </p>
                  ) : rooms.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center">
                      <BedDouble
                        className="mx-auto h-7 w-7 text-slate-400"
                        aria-hidden="true"
                      />
                      <p className="mt-3 text-sm text-slate-600">
                        No rooms have been added to this lodge yet.
                      </p>
                    </div>
                  ) : (
                    <ul className="mt-5 divide-y divide-slate-100">
                      {rooms.map((room) => (
                        <li
                          key={room._id}
                          className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                              <BedDouble
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                            <div className="min-w-0">
                              <p className="break-words text-sm font-semibold text-slate-900">
                                Room {room.roomNumber}
                              </p>
                              <p className="mt-1 text-xs capitalize text-slate-500">
                                {room.roomType || "Room"}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${
                              statusStyles[room.status] ||
                              "border-slate-200 bg-slate-100 text-slate-600"
                            }`}
                          >
                            {room.status || "unknown"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <AlertTriangle
                      className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
                      aria-hidden="true"
                    />
                    <p className="text-sm leading-6 text-amber-900">
                      <strong>This request is lodge-wide.</strong> The existing
                      system does not support inactivating a single room. If an
                      admin approves this request, this lodge and all its rooms
                      will be inactivated.
                    </p>
                  </div>

                  <form onSubmit={handleRequest} className="mt-5 space-y-4">
                    <div>
                      <label
                        htmlFor="inactivation-reason"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Reason for inactivation request
                      </label>
                      <textarea
                        id="inactivation-reason"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        maxLength={500}
                        rows={4}
                        placeholder="Share why you are requesting inactivation..."
                        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500"
                      />
                      <p className="mt-1 text-right text-xs text-slate-500">
                        {reason.length}/500
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || loadingRooms || rooms.length === 0}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                      {submitting
                        ? "Sending request..."
                        : "Request lodge inactivation"}
                    </button>
                  </form>
                </section>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default RoomManagement;
