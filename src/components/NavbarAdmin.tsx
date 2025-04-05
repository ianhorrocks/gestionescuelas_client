import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../assets/images/LogoSmallPilotLog.png";
import {
  faBars,
  faAngleDoubleLeft,
  faUserGroup,
  faPlane,
  faClipboardList,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

interface NavbarAdminProps {
  title: string;
  links: { path: string; label: string }[];
  logoutPath: string;
}

const NavbarAdmin: React.FC<NavbarAdminProps> = ({
  title,
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
    "/admin/users": faUserGroup, // Icono de dos personas para usuarios
    "/admin/planes": faPlane, // Icono de avión para aeronaves
    "/admin/flights": faClipboardList, // Icono de lista para vuelos
  };

  return (
    <div className="navbar-admin">
      <div className="navbar-content">
        <h1 className="navbar-title">{title}</h1>
        <FontAwesomeIcon
          icon={isOpen ? faAngleDoubleLeft : faBars}
          onClick={toggleMenu}
          className="navbar-icon"
        />
      </div>

      <div className={`menu-content ${isOpen ? "open" : ""}`}>
        <div className="nav-admin-header">
          <img src={logo} alt="Logo" className="nav-admin-logo" />
          <h1 className="nav-admin-title">PilotLog</h1>
          <div className="nav-log-min-title">
            <p>E S C U E L A S</p>
          </div>
        </div>

        {links.map((link) => (
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

export default NavbarAdmin;
