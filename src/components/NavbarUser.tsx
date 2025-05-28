import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import Alert from "../components/Alert";

interface NavbarProps {
  title: string;
  links: { path: string; label: string }[];
  logoutPath: string;
}

const Navbar: React.FC<NavbarProps> = ({ title, links, logoutPath }) => {
  const [isOpen, setIsOpen] = useState(false);
  const storedProfile = localStorage.getItem("profile");
  const initialProfile = storedProfile ? JSON.parse(storedProfile) : null;
  const [profile, setProfile] = useState<User | null>(initialProfile);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { message, showTemporaryMessage } = useTemporaryMessage();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<SVGSVGElement>(null);

  const toggleMenu = () => setIsOpen((prev) => !prev);

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

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div className="navbar">
      {message && <Alert message={message.message} type={message.type} />}

      <div className="navbar-content">
        <div className="container-dashboard">
          <h1 className="navbar-title">{title}</h1>
        </div>
        <FontAwesomeIcon
          icon={isOpen ? faAngleDoubleLeft : faBars}
          ref={buttonRef}
          onClick={toggleMenu}
          className="navbar-icon"
        />
      </div>

      <div ref={menuRef} className={`menu-content ${isOpen ? "open" : ""}`}>
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
