import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "layouts/Admin";
import Dashboard from "views/Dashboard";
import Websites from "views/Websites";
import SSL from "views/SSL";
import Servers from "views/Servers";
import FinancialList from "views/Finacial";
import Passwords from "views/Passwords";
import UserPage from "views/User";
import AuthPage from "views/auth/AuthPage";
import NotFound from "views/NotFound";

import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

import "bootstrap/dist/css/bootstrap.css";
import "assets/scss/paper-dashboard.scss?v=1.3.0";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import "font-awesome/css/font-awesome.min.css";

ReactDOM.render(
  <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Admin (Protected) */}
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="websites" element={<Websites />} />
            <Route path="ssl" element={<SSL />} />
            <Route path="servers" element={<Servers />} />
            <Route path="finacial" element={<FinancialList />} />
            <Route path="passwords" element={<Passwords />} />
            <Route path="profile" element={<UserPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* root */}
          <Route
            path="/"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          {/* public 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
  </AuthProvider>,
  document.getElementById("root")
);
