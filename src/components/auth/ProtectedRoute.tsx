import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import LoadingSpinner from "../ui/LoadingSpinner";

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};