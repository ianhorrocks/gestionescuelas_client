import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/UserDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminPlanes from "./pages/AdminPlanes";
import AdminFlights from "./pages/AdminFlights";
import UserFlights from "./pages/UserFlights";
import UserProfile from "./pages/UserProfile";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/user/login" element={<Login />} />

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
          path="/user/profile"
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
