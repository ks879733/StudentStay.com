import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/api";
import { clearAuth } from "../auth";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("accessToken");

  const navClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-blue-50 text-blue-600"
        : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
    }`;

  const handleLogout = async () => {
    try {
      await api.post("/user/logout", {}, { withCredentials: true });
    } catch (error) {
      console.log("Logout request failed:", error);
    } finally {
      clearAuth();
      setMenuOpen(false);
      navigate("/login");
    }
  };

  const handleNavigate = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm rounded-b-xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <NavLink
            to="/dashboard"
            className="shrink-0 text-xl font-black tracking-tight text-blue-600"
          >
            StudentStay
          </NavLink>

          <div className="hidden items-center gap-2 md:flex md:gap-5">
            <NavLink to="/dashboard" className={navClass}>
              Home
            </NavLink>
            <NavLink to="/explore" className={navClass}>
              Explore Lodges
            </NavLink>
            <NavLink to="/bookings" className={navClass}>
              My Bookings
            </NavLink>
            <NavLink to="/profile" className={navClass}>
              Profile
            </NavLink>

            {token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="cursor-pointer rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="cursor-pointer rounded-full bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Login
              </button>
            )}
          </div>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 md:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="mt-3 space-y-2 border-t border-slate-200 pt-3 md:hidden">
            <NavLink
              to="/dashboard"
              className={navClass}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/explore"
              className={navClass}
              onClick={() => setMenuOpen(false)}
            >
              Explore Lodges
            </NavLink>
            <NavLink
              to="/bookings"
              className={navClass}
              onClick={() => setMenuOpen(false)}
            >
              My Bookings
            </NavLink>
            <NavLink
              to="/profile"
              className={navClass}
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </NavLink>

            {token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left text-sm font-medium text-red-600"
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNavigate("/login")}
                className="mt-2 w-full rounded-lg bg-blue-600 px-3 py-2 text-left text-sm font-medium text-white"
              >
                Login
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
