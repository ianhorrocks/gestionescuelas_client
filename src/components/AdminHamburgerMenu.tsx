import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
// import "../styles/AdminHamburgerMenu.css"; // Asegúrate de crear este archivo CSS

interface AdminHamburgerMenuProps {
  userName: string;
}

const AdminHamburgerMenu: React.FC<AdminHamburgerMenuProps> = ({
  userName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="admin-hamburger-menu">
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
          <Link to="/admin/users" onClick={toggleMenu}>
            Usuarios
          </Link>
          <Link to="/admin/planes" onClick={toggleMenu}>
            Aeronaves
          </Link>
          <Link to="/admin/flights" onClick={toggleMenu}>
            Vuelos
          </Link>
          <button className="logout-button" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminHamburgerMenu;
