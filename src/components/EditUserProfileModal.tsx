import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faIdCard,
  faUser,
  faMapMarkerAlt,
  faPlane,
} from "@fortawesome/free-solid-svg-icons";
import { User, EditUserProfileInput } from "../types/types";
import defaultProfilePhoto from "../assets/images/LogoSmallUserProfilePhoto.png";

interface EditUserProfileModalProps {
  profile: User;
  onClose: () => void;
  onSaveChanges: (updatedProfile: EditUserProfileInput) => void;
}

const EditUserProfileModal: React.FC<EditUserProfileModalProps> = ({
  profile,
  onClose,
  onSaveChanges,
}) => {
  const [formData, setFormData] = React.useState({
    email: profile.email,
    dni: profile.dni.toString(),
    name: profile.name,
    lastname: profile.lastname,
    flightLocation: profile.flightLocation,
    license: profile.license,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "fullName") {
      const [namePart, ...lastnameParts] = value.split(" ");
      setFormData((prev) => ({
        ...prev,
        name: namePart,
        lastname: lastnameParts.join(" "),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    onSaveChanges({
      name: formData.name,
      lastname: formData.lastname,
      email: formData.email,
      dni: Number(formData.dni),
      flightLocation: formData.flightLocation,
      license: formData.license,
    });
  };

  return (
    <Modal
      show
      onHide={onClose}
      centered
      size="lg"
      className="modal-overlay-edit-user"
      contentClassName="modal-content-edit-user"
    >
      <Modal.Header closeButton className="edit-user-modal-header">
        <Modal.Title className="modal-title">Mi Perfil</Modal.Title>
        <div className="user-profile">
          <div className="user-photo-container">
            <img
              src={profile.photo || defaultProfilePhoto}
              alt="Foto de usuario"
              className="user-photo"
            />
          </div>
          <div className="user-info">
            <h3 className="user-name">
              {profile.name} {profile.lastname}
            </h3>
            <p className="user-dni">{profile.dni}</p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="edit-user-modal-body">
        <div className="user-details">
          <div className="input-group">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <FontAwesomeIcon icon={faIdCard} className="input-icon" />
            <input
              type="text"
              name="dni"
              placeholder="DNI"
              value={formData.dni}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, ""); // elimina todo lo que no sea número
                setFormData((prev) => ({ ...prev, dni: onlyNumbers }));
              }}
              maxLength={9}
            />
          </div>

          <div className="input-group double-input">
            <FontAwesomeIcon icon={faUser} className="input-icon" />

            <div className="name-lastname-container">
              <input
                type="text"
                name="name"
                placeholder="Nombre"
                value={formData.name}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="lastname"
                placeholder="Apellido"
                value={formData.lastname}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="input-group">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" />
            <input
              type="text"
              name="flightLocation"
              placeholder="Ubicación de vuelo"
              value={formData.flightLocation}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group" style={{ alignItems: "center" }}>
            <FontAwesomeIcon icon={faPlane} className="input-icon" />
            <input
              type="text"
              name="license"
              placeholder="Licencia Aeronautica"
              value={formData.license}
              onChange={handleInputChange}
              style={{ marginTop: "0" }}
            />
          </div>
        </div>

        <div className="assigned-schools">
          <h4>Escuelas Asignadas</h4>

          <div className="school-scroll-container">
            {profile.assignedSchools.map((schoolAssign, index) => (
              <div className="school-item" key={index}>
                <p>
                  <strong>Escuela:</strong> {schoolAssign.school.name}
                </p>
                <p>
                  <strong>Rol:</strong> {schoolAssign.role}
                </p>
                <p>
                  <strong>Aeródromo:</strong> {schoolAssign.school.aerodrome}
                </p>
                <p>
                  <strong>Tag:</strong>{" "}
                  <span style={{ color: schoolAssign.tag ? "inherit" : "red" }}>
                    {schoolAssign.tag || "Sin Asignar"}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="edit-user-modal-footer">
        <Button className="btn-save" onClick={handleSave}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditUserProfileModal;
