import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faAngleDoubleLeft } from "@fortawesome/free-solid-svg-icons"; // Cambiado el icono de cerrar
import "../styles/NavBar/_Navbar.scss";

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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate(logoutPath);
  };

  return (
    <div className="navbar">
      <div className="navbar-content">
        <div className="navbar-title-container">
          <h1 className="navbar-title">{title}</h1>
        </div>
        <div className="menu-icon-container">
          <FontAwesomeIcon
            icon={isOpen ? faAngleDoubleLeft : faBars} // Cambiado el icono de cerrar
            onClick={toggleMenu}
            className="menu-icon"
          />
        </div>
      </div>
      <div className={`menu-content ${isOpen ? "open" : ""}`}>
        <div className="user-info">
          <span>
            <strong>{userName}</strong>
          </span>
        </div>
        {links.map((link) => (
          <Link key={link.path} to={link.path} onClick={toggleMenu}>
            {link.label}
          </Link>
        ))}
        <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Navbar;
