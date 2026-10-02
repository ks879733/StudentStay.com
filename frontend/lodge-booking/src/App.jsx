import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import LodgeDetails from "./pages/LodgeDetails";
import RoomListing from "./pages/RoomListing";
import RoomDetails from "./pages/RoomDetails";
import BookingPage from "./pages/BookingPage";
import PaymentPage from "./pages/PaymentPage";
import BookingDetails from "./pages/BookingDetails";
import MyBookings from "./pages/MyBooking";
import Profile from "./pages/Profile";

import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerProperties from "./components/OwnerProperty";
import OwnerRooms from "./components/OwnerRooms";
import OwnerBookings from "./components/OwnerBookings";
import AddProperty from "./components/AddProperty";
import OwnerProfile from "./components/OwnerProfile";

import AdminDashboard from "./pages/AdminDashboard";
import { ProtectedRoute, RoleRedirect } from "./components/AuthRoute";
import { getDashboardPath } from "./auth";

const App = () => {
  const location = useLocation();

  const isOwnerRoute = location.pathname.startsWith("/owner");
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Check login
  const token = localStorage.getItem("accessToken");

  return (
    <>
      {!isOwnerRoute && !isAdminRoute && <Navbar />}

      <Routes>
        {/* ROOT */}
        <Route
          path="/"
          element={
            token ? (
              <Navigate to={getDashboardPath()} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* AUTH */}
        <Route element={<RoleRedirect />}>
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ADMIN */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* STUDENT */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="student">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/explore"
          element={
            <ProtectedRoute role="student">
              <Explore />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lodge/:lodgeId"
          element={
            <ProtectedRoute role="student">
              <LodgeDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lodge/:lodgeId/rooms"
          element={
            <ProtectedRoute role="student">
              <RoomListing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lodge/:lodgeId/rooms/:roomId"
          element={
            <ProtectedRoute role="student">
              <RoomDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking/:lodgeId/rooms/:roomId"
          element={
            <ProtectedRoute role="student">
              <BookingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking/:bookingId/payment"
          element={
            <ProtectedRoute role="student">
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute role="student">
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/:bookingId"
          element={
            <ProtectedRoute role="student">
              <BookingDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute role="student">
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* OWNER */}
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute role="owner">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/properties"
          element={
            <ProtectedRoute role="owner">
              <OwnerProperties />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/rooms"
          element={
            <ProtectedRoute role="owner">
              <OwnerRooms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/bookings"
          element={
            <ProtectedRoute role="owner">
              <OwnerBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/add-property"
          element={
            <ProtectedRoute role="owner">
              <AddProperty />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/profile"
          element={
            <ProtectedRoute role="owner">
              <OwnerProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer pathname={location.pathname} />
    </>
  );
};

export default App;
