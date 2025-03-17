import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/UserDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminPlanes from "./pages/AdminPlanes";
import AdminFlights from "./pages/AdminFlights";
import UserFlights from "./pages/UserFlights";
import UserProfile from "./pages/UserProfile";
import UserSchool from "./pages/UserSchool";

const App: React.FC = () => {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/user/login" element={<Login />} />
          <Route path="/user/dashboard" element={<Dashboard />} />
          <Route path="/user/school/:id" element={<UserSchool />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/planes" element={<AdminPlanes />} />
          <Route path="/admin/flights" element={<AdminFlights />} />
          <Route path="/user/flights" element={<UserFlights />} />
          <Route path="/user/profile" element={<UserProfile />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
