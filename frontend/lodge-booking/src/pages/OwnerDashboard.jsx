import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OwnerSidebar from "../components/OwnerSideBar";
import { clearAuth } from "../auth";
import NotificationBell from "../components/NotificationBell";

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const getMyProperties = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/owner/my-properties`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProperties(response.data.properties || []);
    } catch (error) {
      console.log("Owner verification failed:", error);

      if (error.response?.status === 401) {
        clearAuth();
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        navigate("/dashboard");
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyProperties();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 mt-4">Verifying owner account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <OwnerSidebar pageFlow />

      <main className="min-h-screen min-w-0 px-4 pb-8 pt-20 sm:px-6 lg:ml-0 lg:flex-1 lg:px-8 lg:py-8">
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-1 py-4 shadow-sm sm:px-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Owner Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your student accommodations
            </p>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />

            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold text-white">
              O
            </div>
          </div>
        </header>

        <section className="py-6 sm:py-8">
          <div className="mb-8">
            <p className="text-blue-600 text-xs font-semibold tracking-[0.2em]">
              OVERVIEW
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Welcome back, Owner
            </h2>
            <p className="text-slate-600 mt-2">
              Here's what's happening with your properties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-slate-500 text-sm">Total Properties</p>
              <h3 className="text-4xl font-bold mt-3 text-slate-900">
                {properties.length}
              </h3>
              <p className="text-slate-500 text-sm mt-2">Lodges & hostels</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-slate-500 text-sm">Approved</p>
              <h3 className="text-4xl font-bold mt-3 text-emerald-600">
                {
                  properties.filter(
                    (property) => property.status === "approved",
                  ).length
                }
              </h3>
              <p className="text-slate-500 text-sm mt-2">Currently live</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-slate-500 text-sm">Pending</p>
              <h3 className="text-4xl font-bold mt-3 text-amber-600">
                {
                  properties.filter((property) => property.status === "pending")
                    .length
                }
              </h3>
              <p className="text-slate-500 text-sm mt-2">
                Waiting for approval
              </p>
            </div>
          </div>

          <div className="mt-10">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-blue-600 text-xs font-semibold tracking-widest">
                    MANAGEMENT
                  </p>
                  <h3 className="text-2xl font-semibold mt-2 text-slate-900">
                    Property Management
                  </h3>
                  <p className="text-slate-600 mt-2">
                    Manage your lodges, rooms and student bookings from your
                    owner panel.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/owner/room-management")}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    RoomManagement
                  </button>
                </div>

                <div className="hidden md:flex w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 items-center justify-center text-blue-600 text-xl">
                  ✓
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OwnerDashboard;
