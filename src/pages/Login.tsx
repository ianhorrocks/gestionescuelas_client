import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import { registerUser } from "../services/userService";
import { NewUser, NewSchool } from "../types/types";
import Alert from "../components/Alert";
import RegisterSchoolModal from "../components/RegisterSchoolModal";
import RegisterUserModal from "../components/RegisterUserModal";
import logo from "../assets/images/LogoSmallPilotLog.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import { useAuth } from "../context/useAuth";
import { registerSchool } from "../services/schoolService";
import Spinner from "../components/Spinner";

const Login: React.FC = () => {
  const { message, showTemporaryMessage } = useTemporaryMessage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterSchoolModal, setShowRegisterSchoolModal] = useState(false);
  const [showRegisterUserModal, setShowRegisterUserModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setLoggedIn, setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await loginUser(email, password);

      // Permitir acceso si es Super Admin aunque no tenga escuelas
      if (
        (!user.assignedSchools || user.assignedSchools.length === 0) &&
        !(user.roles && user.roles.includes("Super Admin")) &&
        !user.activeSys
      ) {
        showTemporaryMessage(
          "warning",
          "USUARIO NO PERTENECE A NINGUNA ESCUELA"
        );
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      setLoggedIn(true);
      setUser(user); // <-- Esto asegura que el contexto tenga el usuario actualizado
      showTemporaryMessage("success", "ACCESO EXITOSO");

      setTimeout(() => {
        // Si es superadmin, redirige al panel de superadmin
        if (user.roles && user.roles.includes("Super Admin")) {
          navigate("/superadmin");
        } else if (user.assignedSchools && user.assignedSchools.length > 0) {
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
        } else if (user.activeSys) {
          // Usuario activo pero sin escuelas asignadas
          navigate("/user/flights-readonly");
        } else {
          navigate("/");
        }
        setLoading(false);
      }, 2000);
    } catch (err) {
      setLoading(false);
      if (err instanceof Error) {
        if (err.message === "LA_ESCUELA_AUN_NO_FUE_APROBADA") {
          showTemporaryMessage(
            "warning",
            "ESCUELA NO FUE APROBADA. CONTACTE SOPORTE"
          );
        } else if (err.message === "LOGIN_INVALID") {
          showTemporaryMessage("error", "USUARIO O CONTRASEÑA INCORRECTOS");
        } else {
          showTemporaryMessage("error", "ERROR AL INICIAR SESIÓN");
        }
      }
    }
  };

  const handleRegisterSchool = async (schoolData: NewSchool) => {
    try {
      await registerSchool(schoolData);
      showTemporaryMessage(
        "success",
        "REGISTRO DE ESCUELA EXITOSO. NECESITA APROBACION"
      );
      setTimeout(() => {
        setShowRegisterSchoolModal(false);
      }, 2000);
    } catch (err) {
      if (err instanceof Error && err.message === "SCHOOL_ALREADY_EXISTS") {
        showTemporaryMessage("error", "YA EXISTE UNA ESCUELA CON ESE NOMBRE");
      } else {
        showTemporaryMessage(
          "error",
          "ERROR AL REGISTRAR ESCUELA. INTENTE NUEVAMENTE"
        );
      }
    }
  };

  const handleRegisterUser = async (userData: NewUser) => {
    try {
      await registerUser(userData);
      showTemporaryMessage(
        "success",
        "REGISTRO EXITOSO. COMUNIQUE SU DNI A LA ESCUELA"
      );
      setTimeout(() => {
        setShowRegisterUserModal(false);
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "EMAIL_ALREADY_REGISTERED") {
          showTemporaryMessage("error", "EL EMAIL YA ESTA REGISTRADO");
        } else if (err.message === "DNI_ALREADY_REGISTERED") {
          showTemporaryMessage("error", "EL DNI YA ESTA REGISTRADO");
        } else {
          showTemporaryMessage(
            "error",
            "ERROR AL REGISTRAR USUARIO. INTENTE NUEVAMENTE"
          );
        }
      }
    }
  };

  useEffect(() => {
    const sessionMessage = localStorage.getItem("sessionMessage");
    if (sessionMessage) {
      showTemporaryMessage("error", sessionMessage);
      localStorage.removeItem("sessionMessage");
    }
  }, [showTemporaryMessage]);

  return (
    <div className="login-page">
      <div className="login-container">
        <img src={logo} alt="Logo" className="login-logo" />
        <h1 className="login-title">PilotLog</h1>
        {message && <Alert message={message.message} type={message.type} />}
        <form onSubmit={handleSubmit} className="login-form">
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
            <a href="#" className="forgot-password-link text-end">
              Olvidé mi contraseña
            </a>
          </div>
          <button
            type="submit"
            className={`btn btn-primary mt-3${
              loading ? " btn-tertiary-loading" : ""
            }`}
            disabled={loading}
          >
            {loading ? <Spinner /> : "Ingresar"}
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
