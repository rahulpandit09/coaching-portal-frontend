import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

// Existing pages
import Home from "./Home";
import NotFound from "./NotFound";
import Profile from "./Profile";
import Settings from "./Settings";
import SignOut from "./SignOut";
import SignIn from "@/pages/signin";
import ForgotPassword from "@/pages/forgot-password";
import VerifyOtp from "@/pages/verify-otp";
import ResetPassword from "@/pages/reset-password";

// Auth pages


interface IAppRouterProps {
  isOpenMenu: boolean;
}

const AppRouter: React.FC<IAppRouterProps> = ({ isOpenMenu }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="transition-all duration-300 ease-in-out">
      <Routes>

        {/* Public Routes */}
        <Route path="/signin" element={<SignIn />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOtp />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Main App Routes */}
        <Route path="/" element={<Home />} />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="/logout"
          element={<SignOut />}
        />

        <Route
          path="/signout"
          element={<SignOut />}
        />

        {/* Fallback */}
        <Route
          path="/not-found"
          element={<NotFound />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/not-found"
              replace
            />
          }
        />

      </Routes>
    </div>
  );
};

export default AppRouter;