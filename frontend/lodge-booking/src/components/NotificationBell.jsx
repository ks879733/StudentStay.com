import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "./NotificationProvider";

const NotificationBell = ({ className = "" }) => {
  const [open, setOpen] = useState(false);
  const [mobilePosition, setMobilePosition] = useState(null);
  const bellRef = useRef(null);
  const { notifications, markRead } = useNotifications();
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const positionPopup = useCallback(() => {
    if (!window.matchMedia("(max-width: 639px)").matches) {
      setMobilePosition(null);
      return;
    }

    const bell = bellRef.current?.getBoundingClientRect();
    if (!bell) return;

    const top = Math.max(8, Math.min(bell.bottom + 8, window.innerHeight - 150));
    setMobilePosition({
      top,
      maxHeight: Math.max(120, window.innerHeight - top - 16),
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    window.addEventListener("resize", positionPopup);
    return () => window.removeEventListener("resize", positionPopup);
  }, [open, positionPopup]);

  const togglePopup = () => {
    if (open) {
      setOpen(false);
      return;
    }

    positionPopup();
    setOpen(true);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={bellRef}
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        onClick={togglePopup}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 cursor-pointer"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1 text-center text-xs font-semibold leading-5 text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      {open && (
        <section
          className="absolute right-0 top-12 z-[80] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-xl max-sm:fixed max-sm:left-4 max-sm:right-4 max-sm:top-auto max-sm:w-auto max-sm:max-w-none"
          aria-label="Notifications"
          style={mobilePosition ? { top: mobilePosition.top, maxHeight: mobilePosition.maxHeight } : undefined}
        >
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">Notifications</div>
          <div
            className="max-h-96 overflow-y-auto"
            style={mobilePosition ? { maxHeight: Math.max(64, mobilePosition.maxHeight - 48) } : undefined}
          >
            {notifications.length === 0 ? <p className="px-4 py-6 text-center text-sm text-slate-500">You’re all caught up.</p> : notifications.slice(0, 30).map((item, index) => (
              <button key={item._id || item.id || index} type="button" onClick={() => markRead(item)} className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${item.isRead ? "" : "bg-blue-50/60"}`}>
                <span className="block text-sm font-semibold text-slate-800">{item.title || "Notification"}</span>
                {item.message && <span className="mt-1 block text-xs leading-relaxed text-slate-600">{item.message}</span>}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default NotificationBell;
