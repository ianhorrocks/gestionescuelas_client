import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import AdminLogin from "../pages/Admin";
//import Dashboard from '../pages/Dashboard';
//import AdminDashboard from "../pages/AdminDashboard";
import Users from "../pages/Users";

const App: React.FC = () => {
  return (
    <Router>
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <Link className="navbar-brand" to="/">
            PilotLog
          </Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  User Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin-login">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin/users" element={<Users />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
