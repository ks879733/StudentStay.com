import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BedDouble,
  Building2,
  MapPin,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import api from "../api/api";
import OwnerSidebar from "./OwnerSideBar";
import OwnerBackButton from "./OwnerBackButton";

const EMPTY_FORM = {
  roomNumber: "",
  roomType: "single",
  capacity: "1",
  beds: "1",
  rentPerMonth: "",
  sharingType: "single",
};

const statusStyles = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-100 text-slate-600",
  maintenance: "border-amber-200 bg-amber-50 text-amber-700",
};

const propertyStatusStyles = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-blue-200 bg-blue-50 text-blue-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

const currencyFormatter = new Intl.NumberFormat("en-IN");

const OwnerRooms = () => {
  const [properties, setProperties] = useState([]);
  const [selectedLodgeId, setSelectedLodgeId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [amenities, setAmenities] = useState([]);
  const [amenityInput, setAmenityInput] = useState("");
  const [roomImages, setRoomImages] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [propertyError, setPropertyError] = useState("");
  const [roomsError, setRoomsError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [deactivationRoom, setDeactivationRoom] = useState(null);
  const [deactivationReason, setDeactivationReason] = useState("");
  const [deactivationError, setDeactivationError] = useState("");
  const [deactivationPending, setDeactivationPending] = useState({});
  const [deactivationSubmitting, setDeactivationSubmitting] = useState(false);

  const approvedProperties = properties.filter(
    (property) => property.status === "approved",
  );
  const selectedProperty = approvedProperties.find(
    (property) => property._id === selectedLodgeId,
  );

  useEffect(() => {
    const loadProperties = async () => {
      setLoadingProperties(true);
      setPropertyError("");

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
        setPropertyError(
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
      setRoomsError("");

      try {
        const response = await api.get(
          `/owner/property-owner/lodges/${selectedLodgeId}/rooms`,
        );
        setRooms(response.data.rooms || []);
      } catch (requestError) {
        setRoomsError(
          requestError.response?.data?.message ||
            "We could not load rooms for this lodge.",
        );
      } finally {
        setLoadingRooms(false);
      }
    };

    loadRooms();
  }, [selectedLodgeId]);

  const handleChange = (event) => {
    setFormData((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const addAmenity = () => {
    const amenity = amenityInput.trim();
    if (!amenity) return;

    setAmenities((currentAmenities) => [...currentAmenities, amenity]);
    setAmenityInput("");
  };

  const handleImageChange = (event) => {
    const selectedImages = Array.from(event.target.files || []);
    if (selectedImages.length > 6) {
      setFormError("You can upload up to 6 room images.");
      return;
    }

    setRoomImages(selectedImages);
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccess("");

    if (!selectedProperty) {
      setFormError("Select an approved lodge before adding a room.");
      return;
    }

    const data = new FormData();
    data.append("roomNumber", formData.roomNumber.trim());
    data.append("roomType", formData.roomType);
    data.append("capacity", formData.capacity);
    data.append("beds", formData.beds);
    data.append("rentPerMonth", formData.rentPerMonth);
    data.append("sharingType", formData.sharingType);
    amenities.forEach((amenity) => data.append("amenities", amenity));
    roomImages.forEach((image) => data.append("roomImage", image));

    try {
      setSubmitting(true);
      const response = await api.post(
        `/owner/properties/${selectedLodgeId}/rooms`,
        data,
      );

      setRooms((currentRooms) => [response.data.room, ...currentRooms]);
      setFormData(EMPTY_FORM);
      setAmenities([]);
      setRoomImages([]);
      setSuccess("Room added successfully.");
      const imageInput = document.getElementById("room-images");
      if (imageInput) imageInput.value = "";
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.message ||
          "We could not add this room. Please check the details and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submitDeactivationRequest = async (event) => {
    event.preventDefault();
    const reason = deactivationReason.trim();
    if (!deactivationRoom || !reason) {
      setDeactivationError("Please provide a reason for this request.");
      return;
    }
    setDeactivationSubmitting(true);
    setDeactivationError("");
    try {
      await api.post(
        `/owner/room/${deactivationRoom._id}/room-deactivation-request`,
        { reason },
      );
      setDeactivationPending((current) => ({ ...current, [deactivationRoom._id]: true }));
      setSuccess(`Deactivation request submitted for room ${deactivationRoom.roomNumber}.`);
      setDeactivationRoom(null);
      setDeactivationReason("");
    } catch (requestError) {
      setDeactivationError(
        requestError.response?.data?.message || "We could not submit this request. Please try again.",
      );
    } finally {
      setDeactivationSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full bg-slate-50 text-slate-900">
      <OwnerSidebar />

      <main className="w-full min-w-0 max-w-full px-4 pb-8 pt-20 sm:px-6 lg:ml-64 lg:w-auto lg:px-8 lg:py-8">
        <div className="mx-auto w-full min-w-0 max-w-7xl">
          <header className="mb-6 min-w-0 sm:mb-8">
            <OwnerBackButton />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Owner panel
            </p>
            <h1 className="mt-2 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
              Room management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Add rooms to an approved lodge and manage its existing room list.
            </p>
          </header>

          {propertyError && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 break-words text-sm text-red-700 shadow-sm">
              {propertyError}
            </div>
          )}

          {loadingProperties ? (
            <div
              className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm"
              role="status"
            >
              Loading your properties...
            </div>
          ) : !propertyError && approvedProperties.length === 0 ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-3">
                <Building2
                  className="mt-1 h-5 w-5 shrink-0 text-blue-600"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Room creation unlocks after lodge approval
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Create a lodge first, then wait for admin approval. You can
                    add rooms after its status changes to approved.
                  </p>
                </div>
              </div>

              {properties.length > 0 && (
                <ul className="mt-6 space-y-3 border-t border-slate-200 pt-5">
                  {properties.map((property) => (
                    <li
                      key={property._id}
                      className="flex min-w-0 flex-wrap items-center justify-between gap-3"
                    >
                      <span className="min-w-0 break-words text-sm text-slate-700">
                        {property.name}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] capitalize ${
                          propertyStatusStyles[property.status] ||
                          "border-slate-200 bg-slate-100 text-slate-700"
                        }`}
                      >
                        {property.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {properties.length === 0 && (
                <Link
                  to="/owner/add-property"
                  className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Create a lodge
                </Link>
              )}
            </section>
          ) : approvedProperties.length > 0 ? (
            <>
              <div className="mb-6 max-w-xl">
                <label
                  htmlFor="selected-lodge"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Approved lodge
                </label>
                <select
                  id="selected-lodge"
                  value={selectedLodgeId}
                  onChange={(event) => {
                    setSelectedLodgeId(event.target.value);
                    setRooms([]);
                    setSuccess("");
                  }}
                  className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                >
                  {approvedProperties.map((property) => (
                    <option key={property._id} value={property._id}>
                      {property.name} ·{" "}
                      {property.address?.city || "Location not set"}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <div
                  className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 break-words text-sm text-red-700 shadow-sm"
                  role="alert"
                >
                  {formError}
                </div>
              )}
              {success && (
                <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 shadow-sm">
                  {success}
                </div>
              )}

              <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <div className="mb-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Add a room
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Room details and monthly rent
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                      <div className="min-w-0">
                        <label
                          htmlFor="roomNumber"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Room number
                        </label>
                        <input
                          id="roomNumber"
                          name="roomNumber"
                          value={formData.roomNumber}
                          onChange={handleChange}
                          required
                          maxLength={30}
                          className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="min-w-0">
                        <label
                          htmlFor="roomType"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Room type
                        </label>
                        <select
                          id="roomType"
                          name="roomType"
                          value={formData.roomType}
                          onChange={handleChange}
                          className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm capitalize text-slate-900 outline-none focus:border-blue-500"
                        >
                          <option value="single">Single</option>
                          <option value="double">Double</option>
                          <option value="twin">Twin</option>
                        </select>
                      </div>

                      <div className="min-w-0">
                        <label
                          htmlFor="sharingType"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Sharing
                        </label>
                        <select
                          id="sharingType"
                          name="sharingType"
                          value={formData.sharingType}
                          onChange={handleChange}
                          className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm capitalize text-slate-900 outline-none focus:border-blue-500"
                        >
                          <option value="single">Single sharing</option>
                          <option value="double">Double sharing</option>
                          <option value="triple">Triple sharing</option>
                          <option value="four">Four sharing</option>
                        </select>
                      </div>

                      <div className="min-w-0">
                        <label
                          htmlFor="rentPerMonth"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Monthly rent (INR)
                        </label>
                        <input
                          id="rentPerMonth"
                          name="rentPerMonth"
                          type="number"
                          min="0"
                          step="1"
                          value={formData.rentPerMonth}
                          onChange={handleChange}
                          required
                          className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="min-w-0">
                        <label
                          htmlFor="capacity"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Capacity
                        </label>
                        <input
                          id="capacity"
                          name="capacity"
                          type="number"
                          min="1"
                          step="1"
                          value={formData.capacity}
                          onChange={handleChange}
                          required
                          className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="min-w-0">
                        <label
                          htmlFor="beds"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Number of beds
                        </label>
                        <input
                          id="beds"
                          name="beds"
                          type="number"
                          min="1"
                          step="1"
                          value={formData.beds}
                          onChange={handleChange}
                          required
                          className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="room-amenity"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Amenities
                      </label>
                      <div className="flex min-w-0 gap-2">
                        <input
                          id="room-amenity"
                          value={amenityInput}
                          onChange={(event) =>
                            setAmenityInput(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              addAmenity();
                            }
                          }}
                          className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={addAmenity}
                          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 transition hover:border-blue-200 hover:text-slate-900"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                          Add
                        </button>
                      </div>
                      {amenities.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {amenities.map((amenity, index) => (
                            <li
                              key={`${amenity}-${index}`}
                              className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700"
                            >
                              <span className="break-words">{amenity}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setAmenities((currentAmenities) =>
                                    currentAmenities.filter(
                                      (_, amenityIndex) =>
                                        amenityIndex !== index,
                                    ),
                                  )
                                }
                                aria-label={`Remove ${amenity}`}
                                className="text-slate-500 transition hover:text-red-600"
                              >
                                <Trash2
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="room-images"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Room photos{" "}
                        <span className="text-slate-500">
                          (optional, up to 6)
                        </span>
                      </label>
                      <input
                        id="room-images"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageChange}
                        className="block w-full min-w-0 text-sm text-slate-500 file:mr-3 file:min-h-10 file:rounded-xl file:border-0 file:bg-slate-100 file:px-3 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                      />
                      {roomImages.length > 0 && (
                        <p className="mt-2 break-words text-xs text-slate-500">
                          {roomImages.length}{" "}
                          {roomImages.length === 1 ? "photo" : "photos"}{" "}
                          selected
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !selectedProperty}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      {submitting ? "Adding room..." : "Add room"}
                    </button>
                  </form>
                </section>

                <section className="min-w-0">
                  <div className="mb-4 flex min-w-0 flex-wrap items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words text-lg font-semibold text-slate-900">
                        Rooms at {selectedProperty?.name}
                      </h2>
                      {selectedProperty?.address?.city && (
                        <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500">
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                          {selectedProperty.address.city}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-slate-500">
                      {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
                    </span>
                  </div>

                  {roomsError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 break-words text-sm text-red-700 shadow-sm">
                      {roomsError}
                    </div>
                  )}

                  {loadingRooms ? (
                    <div
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500 shadow-sm"
                      role="status"
                    >
                      Loading rooms...
                    </div>
                  ) : !roomsError && rooms.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center shadow-sm">
                      <BedDouble
                        className="mx-auto h-7 w-7 text-slate-400"
                        aria-hidden="true"
                      />
                      <p className="mt-3 text-sm font-medium text-slate-700">
                        No rooms added to this lodge yet
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Use the form to add its first room.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rooms.map((room) => {
                        const image = room.roomImage?.[0];
                        const imageUrl =
                          typeof image === "string" ? image : image?.url;
                        const roomStatus = room.status || "active";

                        return (
                          <article
                            key={room._id}
                            className="flex min-w-0 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4"
                          >
                            <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-32">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={`Room ${room.roomNumber}`}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-slate-400">
                                  <BedDouble
                                    className="h-6 w-6"
                                    aria-hidden="true"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                                <h3 className="min-w-0 break-words font-semibold text-slate-900">
                                  Room {room.roomNumber}
                                </h3>
                                <span
                                  className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] capitalize ${
                                    statusStyles[roomStatus] ||
                                    statusStyles.inactive
                                  }`}
                                >
                                  {roomStatus}
                                </span>
                              </div>
                              <p className="mt-1 break-words text-sm capitalize text-slate-600">
                                {room.roomType} · {room.sharingType} sharing
                              </p>
                              <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                                ₹{currencyFormatter.format(room.rentPerMonth)}
                                <span className="ml-1 font-normal text-slate-500">
                                  / month
                                </span>
                              </p>
                              <p className="mt-1 inline-flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <Users
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                Capacity {room.capacity} · {room.beds}{" "}
                                {room.beds === 1 ? "bed" : "beds"}
                              </p>
                              {roomStatus !== "inactive" && (
                                <button
                                  type="button"
                                  disabled={deactivationPending[room._id]}
                                  onClick={() => {
                                    setDeactivationRoom(room);
                                    setDeactivationReason("");
                                    setDeactivationError("");
                                  }}
                                  className="mt-3 inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {deactivationPending[room._id] ? "Request pending" : "Request deactivation"}
                                </button>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            </>
          ) : null}
        </div>
      </main>
      {deactivationRoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="deactivation-title" className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
            <h2 id="deactivation-title" className="text-lg font-semibold text-slate-900">Request room deactivation</h2>
            <p className="mt-1 text-sm text-slate-600">Room {deactivationRoom.roomNumber} at {selectedProperty?.name}</p>
            {deactivationError && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{deactivationError}</p>}
            <form onSubmit={submitDeactivationRequest} className="mt-4 space-y-4">
              <div>
                <label htmlFor="deactivation-reason" className="mb-2 block text-sm font-medium text-slate-700">Reason</label>
                <textarea id="deactivation-reason" value={deactivationReason} onChange={(event) => setDeactivationReason(event.target.value)} required maxLength={500} rows={4} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500" placeholder="Tell the admin why this room should be deactivated." />
                <p className="mt-1 text-right text-xs text-slate-500">{deactivationReason.length}/500</p>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setDeactivationRoom(null)} className="min-h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={deactivationSubmitting || !deactivationReason.trim()} className="min-h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{deactivationSubmitting ? "Submitting..." : "Submit request"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default OwnerRooms;
