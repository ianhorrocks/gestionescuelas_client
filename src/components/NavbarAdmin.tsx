import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../assets/images/LogoSmallPilotLog.png";
import defaultSchoolImage from "../assets/images/Logo-School-Profile.png";
import EditSchoolProfileModal from "./EditSchoolProfileModal";
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import Alert from "./Alert";
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
  const [schoolImage, setSchoolImage] = useState<string>(defaultSchoolImage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { message, showTemporaryMessage } = useTemporaryMessage();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const profile = localStorage.getItem("profile");
    if (profile) {
      const parsedProfile = JSON.parse(profile);
      const assignedSchool = parsedProfile.assignedSchools?.[0]?.school;
      setSchoolName(assignedSchool?.name || "Escuela no asignada");
      setSchoolImage(assignedSchool?.photoUrl || defaultSchoolImage);
    }
  }, []);

  const toggleMenu = () => setIsOpen((prev) => !prev);

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

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.addEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div className="navbar-admin">
      <div className="navbar-content">
        <h1 className="navbar-title">{title}</h1>
        <FontAwesomeIcon
          icon={isOpen ? faAngleDoubleLeft : faBars}
          ref={buttonRef}
          onClick={toggleMenu}
          className="navbar-icon"
        />
      </div>

      <div ref={menuRef} className={`menu-content ${isOpen ? "open" : ""}`}>
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

        <div className="nav-admin-school-info" onClick={openModal}>
          <img src={schoolImage} alt="School" className="school-thumbnail" />
          <span className="school-name">{schoolName}</span>
        </div>

        <NavLink to="/" className="logout-button" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="logout-icon" />
          Cerrar Sesión
        </NavLink>
      </div>

      {message && <Alert message={message.message} type={message.type} />}

      {isModalOpen && (
        <EditSchoolProfileModal
          onClose={closeModal}
          schoolName={schoolName}
          setSchoolName={setSchoolName}
          setSchoolImage={setSchoolImage}
          showTemporaryMessage={showTemporaryMessage}
        />
      )}
    </div>
  );
};

export default NavbarAdmin;
