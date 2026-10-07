import { useState } from "react";
import {
  Building2,
  ImageUp,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { clearAuth } from "../auth";
import OwnerSidebar from "./OwnerSideBar";
import OwnerBackButton from "./OwnerBackButton";

const AddProperty = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "lodge",
    description: "",
    street: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    contactPhone: "",
  });

  const [amenityInput, setAmenityInput] = useState("");
  const [ruleInput, setRuleInput] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [rules, setRules] = useState([]);
  const [image, setImage] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const addAmenity = () => {
    const value = amenityInput.trim();
    if (!value) return;
    setAmenities((previous) => [...previous, value]);
    setAmenityInput("");
  };

  const removeAmenity = (index) => {
    setAmenities((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const addRule = () => {
    const value = ruleInput.trim();
    if (!value) return;
    setRules((previous) => [...previous, value]);
    setRuleInput("");
  };

  const removeRule = (index) => {
    setRules((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!image) {
      setError("Please select a lodge image to continue.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const data = new FormData();
      data.append("name", formData.name);
      data.append("type", formData.type);
      data.append("description", formData.description);
      data.append("contactPhone", formData.contactPhone);
      data.append(
        "address",
        JSON.stringify({
          street: formData.street,
          area: formData.area,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        }),
      );
      data.append("amenities", JSON.stringify(amenities));
      data.append("rules", JSON.stringify(rules));
      data.append("images", image);

      await api.post("/owner/property-owner", data, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setSuccess("Lodge created successfully. Waiting for admin approval.");
      setFormData({
        name: "",
        type: "lodge",
        description: "",
        street: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        contactPhone: "",
      });
      setAmenities([]);
      setRules([]);
      setImage(null);
      const imageInput = document.getElementById("lodge-image");
      if (imageInput) imageInput.value = "";
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        clearAuth();
        setError("Your session has expired. Please log in again.");
      } else if (requestError.response?.status === 403) {
        setError(
          requestError.response.data?.message ||
            "Only owner accounts can add a lodge.",
        );
      } else if (requestError.response) {
        setError(
          requestError.response.data?.message || "Failed to create lodge.",
        );
      } else {
        setError("Server connection failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <OwnerSidebar />

      <main className="min-h-screen px-4 pb-8 pt-20 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <OwnerBackButton />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Owner panel
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Add a new lodge
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Create a student-friendly property listing with photos, amenities,
              and local details.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            Ready for approval
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 pb-8">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Basic information
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Lodge name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Student Comfort Lodge"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Property type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                >
                  <option value="lodge">Lodge</option>
                  <option value="hostel">Hostel</option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your accommodation, nearby landmarks, and the student experience."
                className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-sky-50 p-2 text-sky-600">
                <MapPin className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Location details
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Street
                </label>
                <input
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Street / House No."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Area
                </label>
                <input
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="Area / Locality"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  City
                </label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  State
                </label>
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Pincode
                </label>
                <input
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Country
                </label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                <Phone className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Contact information
              </h2>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Owner contact number
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="Owner contact number"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Amenities & house rules
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Amenities
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    value={amenityInput}
                    onChange={(event) => setAmenityInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addAmenity();
                      }
                    }}
                    placeholder="e.g. WiFi"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-3 text-white transition hover:bg-blue-700"
                    aria-label="Add amenity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {amenities.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No amenities added yet.
                    </p>
                  ) : (
                    amenities.map((amenity, index) => (
                      <span
                        key={`${amenity}-${index}`}
                        className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(index)}
                          className="text-blue-500 hover:text-red-600"
                          aria-label={`Remove ${amenity}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  House rules
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    value={ruleInput}
                    onChange={(event) => setRuleInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addRule();
                      }
                    }}
                    placeholder="e.g. No smoking"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={addRule}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-3 text-white transition hover:bg-blue-700"
                    aria-label="Add rule"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {rules.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No rules added yet.
                    </p>
                  ) : (
                    rules.map((rule, index) => (
                      <div
                        key={`${rule}-${index}`}
                        className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700"
                      >
                        <span className="min-w-0 break-words">{rule}</span>
                        <button
                          type="button"
                          onClick={() => removeRule(index)}
                          className="shrink-0 text-slate-400 transition hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <ImageUp className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Property image
              </h2>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:p-6">
              <input
                id="lodge-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white file:transition hover:file:bg-blue-700"
              />

              {image && (
                <p className="mt-3 text-sm text-emerald-700">
                  Selected file: {image.name}
                </p>
              )}
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating lodge..." : "Create lodge"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddProperty;
