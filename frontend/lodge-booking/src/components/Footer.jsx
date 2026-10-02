import { Link, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, Building2, Camera, Globe } from "lucide-react";
import api from "../api/api";
import { clearAuth, getRole } from "../auth";

const STUDENT_SECTIONS = [
  {
    title: "Quick Links",
    links: [
      { label: "Home / Dashboard", to: "/dashboard" },
      { label: "Explore Lodges", to: "/explore" },
      { label: "My Bookings", to: "/bookings" },
      { label: "Profile", to: "/profile" },
    ],
  },
  {
    title: "Accommodation",
    links: [
      { label: "Explore Lodges", to: "/explore" },
      { label: "Available Rooms", to: "/explore" },
      { label: "Booking", to: "/bookings" },
      { label: "Help / Support", subject: "Help and support" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Profile", to: "/profile" },
      { label: "My Bookings", to: "/bookings" },
      { label: "Login", to: "/login", signedOutOnly: true },
      { label: "Logout", action: "logout", signedInOnly: true },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", subject: "Contact StudentStay" },
      { label: "Help Center", subject: "StudentStay help center" },
      { label: "FAQ", subject: "StudentStay FAQ" },
    ],
  },
];

const OWNER_SECTIONS = [
  {
    title: "Owner",
    links: [
      { label: "Owner Dashboard", to: "/owner/dashboard" },
      { label: "My Properties", to: "/owner/properties" },
      { label: "Add Property", to: "/owner/add-property" },
      { label: "My Rooms", to: "/owner/rooms" },
      { label: "Bookings", to: "/owner/bookings" },
      { label: "Owner Profile", to: "/owner/profile" },
    ],
  },
  {
    title: "Property Management",
    links: [
      { label: "Add Lodge", to: "/owner/add-property" },
      { label: "Manage Rooms", to: "/owner/rooms" },
      { label: "Property Status", to: "/owner/properties" },
      { label: "Booking Management", to: "/owner/bookings" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", subject: "Owner help center" },
      { label: "Contact Support", subject: "Owner support" },
      { label: "Owner Guidelines", subject: "Owner guidelines" },
    ],
  },
];

const ADMIN_SECTIONS = [
  {
    title: "Admin",
    links: [
      { label: "Admin Dashboard", to: "/admin/dashboard" },
      { label: "Pending Lodges", to: "/admin/dashboard" },
      { label: "Approved Lodges", to: "/admin/dashboard" },
      { label: "Users", to: "/admin/dashboard" },
      { label: "Bookings", to: "/admin/dashboard" },
    ],
  },
  {
    title: "Management",
    links: [
      { label: "Lodge Management", to: "/admin/dashboard" },
      { label: "Owner Management", to: "/admin/dashboard" },
      { label: "User Management", to: "/admin/dashboard" },
      { label: "Booking Management", to: "/admin/dashboard" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Admin Help", subject: "Admin help" },
      { label: "Contact Support", subject: "Admin support" },
      { label: "System Information", to: "/admin/dashboard" },
    ],
  },
];

const getFooterRole = (pathname) => {
  if (pathname.startsWith("/owner")) return "owner";
  if (pathname.startsWith("/admin")) return "admin";

  const role = getRole();
  return role === "owner" || role === "admin" ? role : "student";
};

const Footer = ({ pathname }) => {
  const navigate = useNavigate();
  const role = getFooterRole(pathname);
  const isSignedIn = Boolean(localStorage.getItem("accessToken"));
  const sections =
    role === "owner"
      ? OWNER_SECTIONS
      : role === "admin"
        ? ADMIN_SECTIONS
        : STUDENT_SECTIONS;
  const desktopColumns =
    role === "student" ? "lg:grid-cols-5" : "lg:grid-cols-4";

  const handleLogout = async () => {
    try {
      await api.post("/user/logout", {}, { withCredentials: true });
    } catch (error) {
      console.log("Logout request failed:", error);
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 text-slate-700">
      <div
        className={`mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-9 px-4 py-10 sm:px-6 md:grid-cols-3 md:gap-x-8 md:py-12 ${desktopColumns} lg:px-8`}
      >
        <div className="col-span-2 min-w-0 md:col-span-3 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Building2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold text-slate-900">
              StudentStay
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-600">
            Find affordable and comfortable monthly accommodation for students.
          </p>
          <div className="mt-4 flex items-center gap-2">
            {[
              {
                label: "Facebook",
                Icon: Globe,
                href: "https://www.facebook.com/",
              },
              {
                label: "Instagram",
                Icon: Camera,
                href: "https://www.instagram.com/",
              },
              {
                label: "LinkedIn",
                Icon: BriefcaseBusiness,
                href: "https://www.linkedin.com/",
              },
            ].map(({ label, Icon, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-200 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {sections.map((section) => (
          <nav
            key={section.title}
            aria-label={section.title}
            className="min-w-0"
          >
            <h2 className="text-sm font-semibold text-slate-900">
              {section.title}
            </h2>
            <ul className="mt-3 space-y-2.5">
              {section.links
                .filter((link) => !link.signedInOnly || isSignedIn)
                .filter((link) => !link.signedOutOnly || !isSignedIn)
                .map((link) => (
                  <li key={link.label}>
                    {link.action === "logout" ? (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="text-left text-sm leading-5 text-slate-600 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        {link.label}
                      </button>
                    ) : link.to ? (
                      <Link
                        to={link.to}
                        className="text-sm leading-5 text-slate-600 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={`mailto:?subject=${encodeURIComponent(link.subject)}`}
                        className="text-sm leading-5 text-slate-600 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-xs text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} StudentStay. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span>Privacy Policy</span>
            <span>Terms &amp; Conditions</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
