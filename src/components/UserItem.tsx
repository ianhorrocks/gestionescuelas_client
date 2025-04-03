import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

interface User {
  _id: string;
  name: string;
  lastname: string;
  assignedSchools: {
    school: string;
    role: string;
    createdAt: string; // Asegurarse de que el campo createdAt esté presente
  }[];
  photo?: string | null;
  email: string;
  dni: string;
}

interface UserItemProps {
  user: User;
  onDelete: (id: string) => void;
  schoolId: string; // Añadir schoolId para identificar la escuela en cuestión
}

const UserItem: React.FC<UserItemProps> = ({ user, onDelete, schoolId }) => {
  const [showModal, setShowModal] = useState(false);
  const defaultPhoto = "/src/assets/images/LogoSmallUserProfilePhoto.png";
  const userPhoto = user.photo || defaultPhoto;

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const assignedSchool = user.assignedSchools.find(
    (s) => s.school.toString() === schoolId.toString()
  );

  const userRole = assignedSchool ? assignedSchool.role : "";
  const assignedDate = assignedSchool
    ? new Date(assignedSchool.createdAt).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  return (
    <>
      <li
        className="list-group-item-users d-flex align-items-center"
        onClick={handleShowModal}
      >
        <div className="user-photo-container">
          <img src={userPhoto} alt="User" className="user-photo" />
        </div>
        <div className="flex-grow-1">
          <h5 className="mb-1">
            {user.name} {user.lastname}
          </h5>
          <p className="mb-0">Rol: {userRole}</p>
        </div>
      </li>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Ficha de usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="user-profile d-flex align-items-center mb-3">
            <div className="user-photo-container">
              <img src={userPhoto} alt="User" className="user-photo" />
            </div>
            <div className="user-info d-flex flex-column">
              <h5 className="mb-1">
                {user.name} {user.lastname}
              </h5>
              <p className="user-role mb-0">Rol: {userRole}</p>
            </div>
          </div>

          <h5 className="section-title">Perfil del usuario:</h5>
          <p className="subtitle">
            Email: <strong>{user.email}</strong>
          </p>
          <p className="subtitle">
            DNI: <strong>{user.dni}</strong>
          </p>
          <h5 className="section-title mt-4">Relación con la escuela:</h5>
          <p className="subtitle">
            Fecha de asignación: <strong>{assignedDate}</strong>
          </p>
          <h5 className="section-title mt-4">Acciones:</h5>
          <Button
            variant="danger"
            onClick={() => {
              onDelete(user._id);
              handleCloseModal();
            }}
            className="mt-3"
          >
            Eliminar de la escuela
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default UserItem;
