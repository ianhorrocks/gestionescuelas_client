import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="card-container">
      <h2>Soy:</h2>
      <div className="card-row">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Piloto</h5>
            <Link to="/login" className="btn btn-primary">
              User Login
            </Link>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Administrador</h5>
            <Link to="/admin-login" className="btn btn-primary">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
