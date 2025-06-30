import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
  userRole: string | null;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  userRole,
  children,
}) => {
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
