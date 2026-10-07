import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BedDouble,
  Building2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings2,
  UserRound,
  X,
} from "lucide-react";
import api from "../api/api";
import { clearAuth } from "../auth";
import StudentStayMark from "./StudentStayMark";

const OwnerSideBar = ({ pageFlow = false }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const closeMobileMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    try {
      await api.post("/user/logout", {}, { withCredentials: true });
    } catch (error) {
      console.log("Owner logout request failed:", error);
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  const links = [
    { to: "/owner/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { to: "/owner/properties", label: "Properties", Icon: Building2 },
    { to: "/owner/rooms", label: "Rooms", Icon: BedDouble },
    { to: "/owner/room-management", label: "RoomManagement", Icon: Settings2 },
    { to: "/owner/bookings", label: "Bookings", Icon: CalendarDays },
    { to: "/owner/add-property", label: "Add Lodge", Icon: Plus },
    { to: "/owner/profile", label: "Profile", Icon: UserRound },
  ];

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur-sm lg:hidden">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            <span className="hidden lg:inline">
              Student<span className="text-blue-600">Stay</span>
            </span>
            <StudentStayMark className="h-7 w-7 text-blue-600 lg:hidden" />
          </h1>
          <p className="text-[10px] text-slate-500">Owner Panel</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open owner navigation"
          aria-expanded={isOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <button
          type="button"
          onClick={closeMobileMenu}
          aria-label="Close owner navigation"
          className="fixed inset-0 z-[60] bg-slate-900/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-[70] flex h-dvh w-64 flex-col border-r border-slate-200 bg-white shadow-sm transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          pageFlow
            ? "lg:static lg:h-auto lg:min-h-screen lg:shrink-0 lg:translate-x-0"
            : "lg:translate-x-0"
        }`}
      >
        <div className="border-b border-slate-200 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                <span className="hidden lg:inline">
                  Student<span className="text-blue-600">Stay</span>
                </span>
                <StudentStayMark className="h-7 w-7 text-blue-600 lg:hidden" />
              </h1>
              <p className="mt-1 text-xs text-slate-500">Owner Panel</p>
            </div>
            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close owner navigation"
              className="text-slate-500 hover:text-slate-800 lg:hidden"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <nav
          className={`flex-1 space-y-2 overflow-y-auto px-4 py-6 ${
            pageFlow ? "lg:overflow-visible" : ""
          }`}
        >
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={navClass}
              onClick={closeMobileMenu}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default OwnerSideBar;
