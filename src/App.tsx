import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/UserDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminPlanes from "./pages/AdminPlanes";
import AdminFlights from "./pages/AdminFlights";
import UserFlights from "./pages/UserFlights";
import Maintenance from "./pages/Maintenance";
import SuperAdminPanel from "./pages/SuperAdminPanel";

const maintenanceMode = false; // Cambiar a false cuando EC2 esté activa

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {maintenanceMode ? (
          <>
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="*" element={<Navigate to="/maintenance" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />

            <Route
              path="/user/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute>
                  <AdminUsers />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/planes"
              element={
                <PrivateRoute>
                  <AdminPlanes />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/flights"
              element={
                <PrivateRoute>
                  <AdminFlights />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/flights"
              element={
                <PrivateRoute>
                  <UserFlights />
                </PrivateRoute>
              }
            />
            <Route
              path="/superadmin"
              element={
                <PrivateRoute roles={["Super Admin"]}>
                  <SuperAdminPanel />
                </PrivateRoute>
              }
            />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
