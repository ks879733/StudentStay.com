import {
  ArrowRight,
  Building2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import StudentStayMark from "../components/StudentStayMark";

const features = [
  {
    icon: MapPin,
    title: "Prime student locations",
    description:
      "Discover homes close to campus, metro lines, and everyday essentials.",
  },
  {
    icon: Users,
    title: "Verified living spaces",
    description:
      "Browse trusted lodges and hostels with clear room details and host profiles.",
  },
  {
    icon: ShieldCheck,
    title: "Easy, secure booking",
    description: "Book, pay, and track your stay in a few simple steps.",
  },
];

const Auth = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <Building2 className="hidden h-5 w-5 md:block" />
              <StudentStayMark className="h-8 w-8 text-white md:hidden" />
            </div>
            <div>
              <p className="hidden text-2xl font-bold text-blue-600 md:block">
                StudentStay
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              to="/login"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        </header>

        <main className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Better student living
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Find a stay that actually feels like home.
              </h1>
              <p className="max-w-xl text-base text-slate-600 sm:text-lg">
                StudentStay helps students discover verified rooms, shared
                lodges, and hostels that match their budget, location, and
                comfort needs.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
              >
                Sign in
              </Link>
            </div>

            <div className="grid gap-4 pt-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <p className="text-2xl font-bold text-slate-900">300+</p>
                <p className="mt-1 text-sm text-slate-600">
                  Verified properties
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <p className="text-2xl font-bold text-slate-900">24/7</p>
                <p className="mt-1 text-sm text-slate-600">Booking support</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <p className="text-2xl font-bold text-slate-900">4.8/5</p>
                <p className="mt-1 text-sm text-slate-600">Average rating</p>
              </div>
            </div>
          </section>

          <aside className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-4 shadow-xl shadow-sky-100/70 sm:p-6">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Why students choose us
              </p>
              <div className="mt-5 space-y-4">
                {features.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-slate-900">
                        {title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default Auth;
