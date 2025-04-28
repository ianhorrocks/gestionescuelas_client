import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../assets/images/LogoSmallPilotLog.png";
import defaultSchoolImage from "../assets/images/Logo-School-Profile.png"; // Foto por defecto
import EditSchoolProfileModal from "./EditSchoolProfileModal"; // Importar el modal
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
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [schoolImage, setSchoolImage] = useState<string>(defaultSchoolImage); // Estado para la foto de la escuela
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal
  const navigate = useNavigate();

  useEffect(() => {
    const profile = localStorage.getItem("profile");
    if (profile) {
      const parsedProfile = JSON.parse(profile);
      const assignedSchool = parsedProfile.assignedSchools?.[0]?.school;
      setSchoolName(assignedSchool?.name || "Escuela no asignada");
      setSchoolImage(assignedSchool?.photoUrl || defaultSchoolImage);
    }
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate(logoutPath);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const linkIcons: {
    [key: string]: import("@fortawesome/fontawesome-svg-core").IconDefinition;
  } = {
    "/admin/users": faUserGroup,
    "/admin/planes": faPlane,
    "/admin/flights": faClipboardList,
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

        {/* Nombre y foto de la escuela */}
        <div className="nav-admin-school-info" onClick={openModal}>
          <img src={schoolImage} alt="School" className="school-thumbnail" />
          <span className="school-name">{schoolName}</span>
        </div>

        <NavLink to="/" className="logout-button" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="logout-icon" />
          Cerrar Sesión
        </NavLink>
      </div>

      {/* Modal para editar el perfil de la escuela */}
      {isModalOpen && <EditSchoolProfileModal onClose={closeModal} />}
    </div>
  );
};

export default NavbarAdmin;
