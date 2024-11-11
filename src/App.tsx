import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/UserLogin";
import AdminLogin from "./pages/AdminLogin";
import Users from "./pages/AdminUsers";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import RegisterSchool from "./pages/RegisterSchool";
import School from "./pages/School";

const App: React.FC = () => {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user/login" element={<Login />} />
          <Route path="/user/dashboard" element={<Dashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/user/register" element={<Register />} />
          <Route path="/admin/register-school" element={<RegisterSchool />} />
          <Route path="/user/school" element={<School />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
