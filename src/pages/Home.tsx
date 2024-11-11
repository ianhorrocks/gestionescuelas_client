import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/LogoSmallPilotLog.png";

const Home: React.FC = () => {
  return (
    <div className="card-container">
      <div className="logo-container">
        <Link className="navbar-brand" to="/">
          <img src={logo} alt="PilotLog Logo" className="logo-image-home" />
          <span className="logo-title-home">PilotLog</span>
        </Link>
      </div>
      <h2>Soy:</h2>
      <div className="card-row">
        <div className="card">
          <Link className="card-body" to="/user/login">
            Usuario
          </Link>
        </div>
        <div className="card">
          <Link className="card-body" to="/admin/login">
            Escuela
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
