import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/api";

const NotificationContext = createContext(null);

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const getNotificationId = (notification) => notification?._id || notification?.id;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(() => {
    const user = readUser();
    return user?._id || user?.id || user?.userId || "";
  });
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const syncAuth = () => {
      const user = readUser();
      setUserId(user?._id || user?.id || user?.userId || "");
      setNotifications([]);
    };
    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-changed", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-changed", syncAuth);
    };
  }, []);

  useEffect(() => {
    if (!token || !userId) {
      setNotifications([]);
      return undefined;
    }

    let active = true;
    api.get("/notifications").then(({ data }) => {
      if (!active) return;
      const list = Array.isArray(data) ? data : data?.notifications || [];
      setNotifications(list);
    }).catch(() => {});

    let socket;
    try {
      const socketUrl = new URL(api.defaults.baseURL || window.location.origin, window.location.origin).origin;
      socket = io(socketUrl, { withCredentials: true, auth: { token } });
      socket.on("notification", (notification) => {
        if (!active || !notification) return;
        setNotifications((current) => {
          const id = getNotificationId(notification);
          if (id && current.some((item) => getNotificationId(item) === id)) return current;
          return [notification, ...current];
        });
        toast(`${notification.title || "New notification"}${notification.message ? `: ${notification.message}` : ""}`, { duration: 5000 });
      });
    } catch {
      // The saved notification history remains available if realtime connection is unavailable.
    }

    return () => {
      active = false;
      socket?.disconnect();
    };
  }, [token, userId]);

  const markRead = async (notification) => {
    if (!notification?._id || notification.isRead) return;
    try {
      await api.patch(`/notifications/${notification._id}/read`);
      setNotifications((current) => current.map((item) =>
        getNotificationId(item) === notification._id ? { ...item, isRead: true } : item,
      ));
    } catch {
      toast.error("Could not update notification. Please try again.");
    }
  };

  const value = useMemo(() => ({ notifications, markRead }), [notifications]);
  return (
    <NotificationContext.Provider value={value}>
      <Toaster position="top-right" toastOptions={{ className: "!max-w-sm !text-sm" }} />
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext) || { notifications: [], markRead: async () => {} };
