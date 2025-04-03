import React, { useState } from "react";
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

interface NavbarProps {
  title: string;
  userName: string;
  links: { path: string; label: string }[];
  logoutPath: string;
}

const Navbar: React.FC<NavbarProps> = ({
  title,
  userName,
  links,
  logoutPath,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate(logoutPath);
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
      <div className="navbar-content">
        <h1 className="navbar-title">{title}</h1>
        <FontAwesomeIcon
          icon={isOpen ? faAngleDoubleLeft : faBars}
          onClick={toggleMenu}
          className="navbar-icon"
        />
      </div>

      <div className={`menu-content ${isOpen ? "open" : ""}`}>
        <div className="user-info">
          <strong>Hola, {userName}.</strong>
          <NavLink to="/user/profile" className="edit-profile-link">
            (Editar Perfil)
          </NavLink>
        </div>

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
    </div>
  );
};

export default Navbar;
