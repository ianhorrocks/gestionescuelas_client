import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import "../styles/HamburgerMenu.css"; // Asegúrate de crear este archivo CSS

interface HamburgerMenuProps {
  userName: string;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/user/login");
  };

  return (
    <div className="hamburger-menu">
      <FontAwesomeIcon
        icon={isOpen ? faTimes : faBars}
        onClick={toggleMenu}
        className="menu-icon"
      />
      {isOpen && (
        <div className="menu-content">
          <div className="user-info">
            <span>
              <strong>{userName}</strong>
            </span>
          </div>
          <Link to="/user/dashboard" onClick={toggleMenu}>
            Dashboard
          </Link>
          <Link to="/user/profile" onClick={toggleMenu}>
            Mi Perfil
          </Link>
          <Link to="/user/flights" onClick={toggleMenu}>
            Mis Vuelos
          </Link>
          <button className="logout-button" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
