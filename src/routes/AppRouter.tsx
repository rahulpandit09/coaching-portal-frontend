import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

// Existing pages
import Home from "./Home";
import Dashboard from "../components/Dashbard/Dashboard";
import NotFound from "./NotFound";
import Profile from "./Profile";
import Settings from "./Settings";
import SignOut from "./SignOut";
import Roles from "./Roles";
import Permissions from "./Permissions";

// Auth pages
import SignIn from "@/pages/signin";
import ForgotPassword from "@/pages/forgot-password";
import VerifyOtp from "@/pages/verify-otp";
import ResetPassword from "@/pages/reset-password";

// Access Wrapper
import AccessWrapper from "@/routes/AccessWrapper";

// User Management
import UserManagement from "../components/userManagement/userManagementDashboard/UserManagement";
import AddNewUserPage from "../components/userManagement/addNewUse/AddNewUser";

interface IAppRouterProps {
  isOpenMenu: boolean;
}

const AppRouter: React.FC<IAppRouterProps> = ({ isOpenMenu }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="transition-all duration-300 ease-in-out">
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================== */}

        <Route
          path="/signin"
          element={<SignIn />}
        />

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

        {/* =========================
            MAIN APP ROUTES
        ========================== */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Navigate to="/dashboard/overview" replace />}
        />

        <Route
          path="/dashboard/overview"
          element={<Dashboard />}
        />

        {/* =========================
            PROFILE
        ========================== */}

        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* =========================
            ROLES
        ========================== */}

        <Route
          path="/roles"
          element={<Roles />}
        />

        <Route
          path="/admin/roles"
          element={<Roles />}
        />

        {/* =========================
            PERMISSIONS
        ========================== */}

        <Route
          path="/permissions"
          element={<Permissions />}
        />

        <Route
          path="/admin/permissions"
          element={<Permissions />}
        />

        {/* =========================
            USER MANAGEMENT
        ========================== */}

        <Route
          path="/user-management"
          element={<Navigate to="/user-management/manage-user" replace />}
        />

        <Route
          path="/user-management/manage-user"
          element={
            // <AccessWrapper requireSubMenu="/user-management/manage-user">
            <UserManagement />
            // </AccessWrapper> 
          }
        />

        <Route
          path="/user-management/add-new-user"
          element={<AddNewUserPage />}
        />



        {/* =========================
            SETTINGS
        ========================== */}

        <Route
          path="/settings"
          element={<Settings />}
        />

        {/* =========================
            LOGOUT
        ========================== */}

        <Route
          path="/logout"
          element={<SignOut />}
        />

        <Route
          path="/signout"
          element={<SignOut />}
        />

        {/* =========================
            NOT FOUND
        ========================== */}

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