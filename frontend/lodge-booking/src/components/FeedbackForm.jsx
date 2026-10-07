import { useState } from "react";
import { CheckCircle2, MessageSquareText, Send } from "lucide-react";
import api from "../api/api";

const INITIAL_FORM = { name: "", email: "", message: "" };

const FeedbackForm = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setNotice({ type: "", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const values = {
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    };
    const nextErrors = {};

    if (!values.name) nextErrors.name = "Please enter your name.";
    else if (values.name.length > 20) {
      nextErrors.name = "Name must be 20 characters or fewer.";
    }

    if (!values.email) nextErrors.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!values.message) nextErrors.message = "Please enter your feedback.";
    else if (values.message.length < 10) {
      nextErrors.message = "Message must be at least 10 characters.";
    } else if (values.message.length > 1000) {
      nextErrors.message = "Message must be 1000 characters or fewer.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setNotice({ type: "", message: "" });

    try {
      const response = await api.post("/feedback/suggestion", values);
      setForm(INITIAL_FORM);
      setErrors({});
      setNotice({
        type: "success",
        message: response.data?.message || "Thanks for sharing your feedback!",
      });
    } catch (requestError) {
      setNotice({
        type: "error",
        message:
          requestError.response?.data?.message ||
          "We could not send your feedback. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="grid min-w-0 gap-6 overflow-hidden rounded-[28px] border border-amber-200 bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10 lg:p-10">
        <div className="min-w-0">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
            <MessageSquareText className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Your feedback matters
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Help us improve
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Have a suggestion or feedback? Let us know. Your ideas help us make
            finding a student stay easier.
          </p>
        </div>

        <form className="grid min-w-0 gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label
                htmlFor="feedback-name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Name
              </label>
              <input
                id="feedback-name"
                name="name"
                type="text"
                autoComplete="name"
                maxLength={20}
                required
                value={form.name}
                onChange={updateField}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "feedback-name-error" : undefined}
                className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                placeholder="Your name"
              />
              {errors.name && (
                <p id="feedback-name-error" className="mt-1 text-xs text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="min-w-0">
              <label
                htmlFor="feedback-email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="feedback-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                value={form.email}
                onChange={updateField}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "feedback-email-error" : undefined}
                className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p id="feedback-email-error" className="mt-1 text-xs text-red-600">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label
                htmlFor="feedback-message"
                className="block text-sm font-medium text-slate-700"
              >
                Message
              </label>
              <span className="shrink-0 text-xs text-slate-400">
                {form.message.length}/1000
              </span>
            </div>
            <textarea
              id="feedback-message"
              name="message"
              rows={4}
              minLength={10}
              maxLength={1000}
              required
              value={form.message}
              onChange={updateField}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={
                errors.message ? "feedback-message-error" : undefined
              }
              className="w-full min-w-0 resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              placeholder="Tell us what is working well or what we could do better..."
            />
            {errors.message && (
              <p id="feedback-message-error" className="mt-1 text-xs text-red-600">
                {errors.message}
              </p>
            )}
          </div>

          <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {submitting ? "Sending..." : "Send feedback"}
            </button>

            {notice.message && (
              <p
                role={notice.type === "error" ? "alert" : "status"}
                className={`flex min-w-0 items-start gap-2 text-sm leading-5 ${
                  notice.type === "error" ? "text-red-700" : "text-emerald-700"
                }`}
              >
                {notice.type === "success" && (
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span className="break-words">{notice.message}</span>
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};

export default FeedbackForm;
