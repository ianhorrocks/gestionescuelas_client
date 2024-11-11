import React, { useState } from "react";
import { loginUser } from "../services/auth";
import Alert from "../components/Alert";
import { useNavigate, Link } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      setSuccess("Access OK");
      setTimeout(() => {
        navigate("/user/dashboard");
      }, 2000);
    } catch (err) {
      setError("Datos Incorrectos.");
    }
  };

  return (
    <div className="centered-form">
      <div>
        <Link to="/" className="back-link">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-arrow-left"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M15 8a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 7.5H14.5A.5.5 0 0 1 15 8z"
            />
          </svg>
          Back
        </Link>
        <h1>Login</h1>
        {error && <p className="text-danger">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Link to="/forgot-password" className="d-block mb-3">
            Olvidé mi contraseña
          </Link>
          <button type="submit" className="btn btn-primary mt-3">
            Login
          </button>
        </form>
        <Link to="/register" className="d-block mt-3">
          ¿Sos nuevo?
        </Link>
        {success && <Alert message={success} type="success" />}
      </div>
    </div>
  );
};

export default Login;
