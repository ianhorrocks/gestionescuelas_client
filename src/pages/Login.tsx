import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import Alert from "../components/Alert";
import RegisterSchoolModal from "../components/RegisterSchoolModal";
import RegisterUserModal from "../components/RegisterUserModal";
import logo from "../assets/images/LogoSmallPilotLog.png"; // Importa el logo
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import useTemporaryMessage from "../hooks/useTemporaryMessage";

const Login: React.FC = () => {
  const { message, showTemporaryMessage } = useTemporaryMessage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterSchoolModal, setShowRegisterSchoolModal] = useState(false);
  const [showRegisterUserModal, setShowRegisterUserModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token, user } = await loginUser(email, password);
      if (!user.assignedSchools || user.assignedSchools.length === 0) {
        showTemporaryMessage(
          "warning",
          "Usuario no pertenece a ninguna escuela."
        );
        return;
      }

      localStorage.setItem("token", token);
      showTemporaryMessage("success", "Access OK");
      setTimeout(() => {
        const school = user.assignedSchools[0];
        if (
          school.role.includes("Alumno") ||
          school.role.includes("Piloto") ||
          school.role.includes("Instructor")
        ) {
          navigate("/user/dashboard");
        } else if (school.role.includes("Admin")) {
          navigate("/admin/users");
        } else {
          navigate("/");
        }
      }, 2000);
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === "LA_ESCUELA_AUN_NO_FUE_APROBADA"
      ) {
        showTemporaryMessage(
          "error",
          "La escuela aún no fue aprobada. Espere aprobación del Super Admin."
        );
      } else {
        showTemporaryMessage("error", "Usuario o Contraseña incorrectos.");
      }
    }
  };

  interface SchoolData {
    type: string;
    name: string;
    country: string;
    aerodrome: string;
    address: string;
    openingHours: string;
    publicPhone: string;
    publicEmail: string;
    adminEmail: string;
    adminPassword: string;
    [key: string]: string | number; // Adjust the type based on expected additional fields
  }

  const handleRegisterSchool = async (schoolData: SchoolData) => {
    try {
      const response = await fetch("http://localhost:3001/api/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(schoolData),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      showTemporaryMessage("success", "School registration successful");
      setTimeout(() => {
        setShowRegisterSchoolModal(false);
      }, 2000);
    } catch (err) {
      showTemporaryMessage("error", "Registration failed. Please try again.");
    }
  };

  const handleRegisterUser = async (userData: {
    dni: string;
    name: string;
    lastname: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      showTemporaryMessage("success", "User registration successful");
      setTimeout(() => {
        setShowRegisterUserModal(false);
      }, 2000);
    } catch (err) {
      showTemporaryMessage("error", "Registration failed. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <img src={logo} alt="Logo" className="login-logo" />
        <h1 className="login-title">PilotLog</h1>
        {message && <Alert message={message.message} type={message.type} />}
        <form onSubmit={handleSubmit}>
          <div className="form-group floating-label-group">
            <input
              type="email"
              className="form-control floating-input"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder=" " // Añadir un espacio para que el placeholder funcione correctamente
            />
            <label htmlFor="email" className="floating-label">
              Email
            </label>
          </div>
          <div className="form-group floating-label-group">
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control floating-input"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=" " // Añadir un espacio para que el placeholder funcione correctamente
              />
              <label htmlFor="password" className="floating-label">
                Contraseña
              </label>
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-icon"
              />
            </div>
          </div>
          <div className="forgot-password-container">
            <a href="#" className="forgot-password-link">
              Olvidé la contraseña
            </a>
          </div>
          <button type="submit" className="btn btn-primary mt-4">
            Ingresar
          </button>
        </form>
        <div className="register-buttons-container">
          <div className="new-user-container">
            <p className="new-user-text">¿Sos nuevo?</p>
            <button
              className="btn btn-secondary btn-register-user"
              onClick={() => setShowRegisterUserModal(true)}
            >
              Crear Cuenta
            </button>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => setShowRegisterSchoolModal(true)}
          >
            Registrar mi escuela
          </button>
        </div>
      </div>
      <RegisterUserModal
        show={showRegisterUserModal}
        onClose={() => setShowRegisterUserModal(false)}
        onRegisterUser={handleRegisterUser}
      />
      <RegisterSchoolModal
        show={showRegisterSchoolModal}
        onClose={() => setShowRegisterSchoolModal(false)}
        onRegisterSchool={handleRegisterSchool}
      />
    </div>
  );
};

export default Login;
