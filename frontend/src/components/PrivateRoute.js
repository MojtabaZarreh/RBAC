import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import React from "react";

export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // if (roles && !roles.includes(user.role)) {
  //   return <Navigate to="/auth" replace />;
  // }

  return children;
}
