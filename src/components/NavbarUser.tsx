import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faAngleDoubleLeft,
  faUser,
  faPlane,
  faTachometerAlt,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/images/LogoSmallPilotLog.png";
import defaultProfilePhoto from "../assets/images/LogoSmallUserProfilePhoto.png";
import EditUserProfileModal from "../components/EditUserProfileModal";
import { User, EditUserProfileInput } from "../types/types";
import { updateUserProfile } from "../services/userService";
import useTemporaryMessage from "../hooks/useTemporaryMessage"; // 👈 Importamos hook
import Alert from "../components/Alert"; // 👈 Importamos el componente de alerta

interface NavbarProps {
  title: string;
  links: { path: string; label: string }[];
  logoutPath: string;
}

const Navbar: React.FC<NavbarProps> = ({ title, links, logoutPath }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { message, showTemporaryMessage } = useTemporaryMessage(); // 👈 Usamos hook
  const navigate = useNavigate();

  useEffect(() => {
    const storedProfile = localStorage.getItem("profile");
    if (storedProfile) {
      const parsedProfile: User = JSON.parse(storedProfile);
      setProfile(parsedProfile);
    }
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate(logoutPath);
  };

  const handleSaveProfileChanges = async (
    updatedProfile: EditUserProfileInput
  ) => {
    try {
      if (!profile) return;
      await updateUserProfile(profile._id, updatedProfile);

      const updatedLocalProfile = { ...profile, ...updatedProfile };
      localStorage.setItem("profile", JSON.stringify(updatedLocalProfile));
      setProfile(updatedLocalProfile);
      setIsEditModalOpen(false);
      showTemporaryMessage("success", "Perfil actualizado correctamente");
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "DNI_DUPLICATED") {
          showTemporaryMessage("warning", "El DNI ya está en uso.");
        } else if (error.message === "EMAIL_DUPLICATED") {
          showTemporaryMessage("warning", "El Email ya está en uso.");
        } else {
          showTemporaryMessage("error", "Error al actualizar el perfil.");
        }
      } else {
        showTemporaryMessage("error", "Error inesperado.");
      }
    } finally {
      setIsEditModalOpen(false);
    }
  };

  const linkIcons: {
    [key: string]: import("@fortawesome/fontawesome-svg-core").IconDefinition;
  } = {
    "/user/dashboard": faTachometerAlt,
    "/user/profile": faUser,
    "/user/flights": faPlane,
  };

  return (
    <div className="navbar">
      {/* Alert para mensajes temporales */}
      {message && <Alert message={message.message} type={message.type} />}

      <div className="navbar-content">
        <div className="container-dashboard">
          <h1 className="navbar-title">{title}</h1>
        </div>
        <FontAwesomeIcon
          icon={isOpen ? faAngleDoubleLeft : faBars}
          onClick={toggleMenu}
          className="navbar-icon"
        />
      </div>

      <div className={`menu-content ${isOpen ? "open" : ""}`}>
        <div className="nav-user-header">
          <img src={logo} alt="Logo" className="nav-user-logo" />
          <h1 className="nav-user-title">PilotLog</h1>
        </div>

        {profile && (
          <div
            className="nav-user-info"
            onClick={() => setIsEditModalOpen(true)}
          >
            <img
              src={profile.photo || defaultProfilePhoto}
              alt="Foto de usuario"
              className="user-thumbnail"
            />
            <span className="user-name">
              Hola, {profile.name || "Usuario"}.
            </span>
          </div>
        )}

        {links
          .filter((link) => link.path !== "/user/profile")
          .map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                isActive ? "menu-link active" : "menu-link"
              }
              onClick={toggleMenu}
            >
              <div className="icon-container">
                <FontAwesomeIcon
                  icon={linkIcons[link.path]}
                  className="link-icon"
                />
              </div>
              {link.label}
            </NavLink>
          ))}

        <NavLink to="/" className="logout-button" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="logout-icon" />
          Cerrar Sesión
        </NavLink>
      </div>

      {isEditModalOpen && profile && (
        <EditUserProfileModal
          profile={profile}
          onClose={() => setIsEditModalOpen(false)}
          onSaveChanges={handleSaveProfileChanges}
        />
      )}
    </div>
  );
};

export default Navbar;
