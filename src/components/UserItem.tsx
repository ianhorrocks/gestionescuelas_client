import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { assignTagToUser, removeTagFromUser } from "../services/userService";
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import Alert from "./Alert";
import { TrashFill } from "react-bootstrap-icons";
import "../styles/GeneralComponents/Items/_UserItem.scss";
import { FlatUser} from "../types/types"; // Importamos el tipo User
import defaultPhoto from "../assets/images/LogoSmallUserProfilePhoto.png";

interface UserItemProps {
  user: FlatUser;
  onDelete: (id: string) => void;
  schoolId: string;
  onTagAssigned: (updatedUser: FlatUser) => void;

}

const UserItem: React.FC<UserItemProps> = ({
  user,
  onDelete,
  schoolId,
  onTagAssigned,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(false);
  const { message, showTemporaryMessage } = useTemporaryMessage();

  const userPhoto = user.photo || defaultPhoto;

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
  };

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

  const [currentTagState, setCurrentTagState] = useState(
    assignedSchool?.tag || ""
  );

  const handleAssignTag = async () => {
    setLoading(true);
    try {
      const upperTag = tag.toUpperCase();
      await assignTagToUser(user._id, schoolId, upperTag);
      const updatedUser = {
        ...user,
        assignedSchools: user.assignedSchools.map((a) =>
          a.school === schoolId ? { ...a, tag: upperTag } : a
        ),
      };
      setCurrentTagState(upperTag);
      showTemporaryMessage("success", "Tag asignado exitosamente");
      setTag("");
      onTagAssigned(updatedUser); // 🔥 actualiza el UserItemList sin recargar
    } catch (error) {
      console.error("Error asignando tag:", error);
      showTemporaryMessage("error", "Error al asignar el tag");
    } finally {
      setLoading(false);
    }
  };
  

  const handleRemoveTag = async () => {
    setLoading(true);
    try {
      await removeTagFromUser(user._id, schoolId);
      const updatedUser = {
        ...user,
        assignedSchools: user.assignedSchools.map((a) =>
          a.school === schoolId ? { ...a, tag: undefined } : a
        ),
      };
      setCurrentTagState("");
      showTemporaryMessage("success", "Tag eliminado");
  
      onTagAssigned(updatedUser); // 🔥 actualiza el UserItemList sin recargar
    } catch (error) {
      console.error("Error eliminando tag:", error);
      showTemporaryMessage("error", "Error al eliminar el tag");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <>
      <li className="user-item-list" onClick={handleShowModal}>
        <div className="user-photo-container">
          <img src={userPhoto} alt="User" className="user-photo" />
        </div>
        <div className="user-details">
          <h5>
            {user.name} {user.lastname}
          </h5>
          <p>Rol: {userRole}</p>
          <p className="tag-label">
            Tag:{" "}
            <strong className={assignedSchool?.tag ? "" : "tag-unassigned"}>
              {assignedSchool?.tag || "Sin asignar"}
            </strong>
          </p>
        </div>
      </li>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        keyboard={true}
        className="user-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Ficha de usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body className="user-modal-body">
          <div className="user-profile">
            <div className="user-photo-container">
              <img src={userPhoto} alt="User" className="user-photo" />
            </div>
            <div className="user-info">
              <div className="user-main-line">
                <h5 className="user-name">
                  {user.name} {user.lastname}
                </h5>
                
              </div>
              <p className="user-role">Rol: {userRole}</p>
            </div>
          </div>

          <h5 className="section-title">Perfil del usuario:</h5>
          <p className="subtitle">
            Email: <strong>{user.email}</strong>
          </p>
          <p className="subtitle">
            DNI: <strong>{user.dni}</strong>
          </p>
          <p className="subtitle">
            Licencia: <strong>{user.license || "-"}</strong>
          </p>

          <h5 className="section-title">Relación con la escuela:</h5>
          <p className="subtitle">
            Agregado el: <strong>{assignedDate}</strong>
          </p>

          <div className="user-tag-row">
            <h5 className="section-title mt-4" style={{ marginBottom: 0 }}>
              Tag Tarjeta:
            </h5>
            <strong
              className={`mt-4 ${currentTagState ? "id-assigned" : "id-unassigned"}`}
              style={{ marginLeft: "0.5rem" }}
            >
              {currentTagState || "Sin asignar"}
            </strong>
          </div>

          <div className="tag-assignment-container">
            <input
              type="text"
              className="form-control"
              placeholder="Ingresa el tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
            <div className="tag-action-buttons">
              <button
                className="btn btn-assign"
                disabled={loading || !tag}
                onClick={handleAssignTag}
              >
                {loading ? "..." : "Asignar"}
              </button>
              <Button className="btn-delete-tag" onClick={handleRemoveTag}>
                <TrashFill />
              </Button>
            </div>
          </div>

          {message && <Alert message={message.message} type={message.type} />}

          <h5 className="section-title">Acciones:</h5>
          <Button
            onClick={() => {
              onDelete(user._id);
              handleCloseModal();
            }}
            className="btn-delete-school mt-3 d-block"
          >
            Eliminar de la escuela
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default UserItem;
