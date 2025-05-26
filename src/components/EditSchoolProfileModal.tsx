import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import defaultSchoolImage from "../assets/images/Logo-School-Profile.png";
import { updateSchool } from "../services/schoolService";
import { School, EditSchoolProfileInput } from "../types/types";
import "../styles/Modals/_EditSchoolProfileModal.scss";

interface EditSchoolProfileModalProps {
  onClose: () => void;
  schoolName: string | null;
  setSchoolName: (name: string) => void;
  setSchoolImage: (img: string) => void;
  showTemporaryMessage: (type: "success" | "error" | "warning", message: string) => void;
}

const EditSchoolProfileModal: React.FC<EditSchoolProfileModalProps> = ({
  onClose,
  setSchoolName,
  showTemporaryMessage,
}) => {
  const [formData, setFormData] = useState<EditSchoolProfileInput>({
    name: "",
    address: "",
    aerodrome: "",
    publicEmail: "",
    publicPhone: "",
  });
  const [school, setSchool] = useState<School | null>(null);

  useEffect(() => {
    // Solo leer una vez al montar
    const profile = JSON.parse(localStorage.getItem("profile") || "{}");
    const schoolData = profile?.assignedSchools?.[0]?.school;
    setSchool(schoolData);
    if (schoolData) {
      setFormData({
        name: schoolData.name || "",
        address: schoolData.address || "",
        aerodrome: schoolData.aerodrome || "",
        publicEmail: schoolData.publicEmail || "",
        publicPhone: schoolData.publicPhone || "",
        openingHours: schoolData.openingHours || undefined,
        country: schoolData.country || undefined,
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!school?._id) return;
    try {
      const updatedSchool = await updateSchool(school._id, formData);
      // Actualizar localStorage con los nuevos datos de la escuela
      const profile = JSON.parse(localStorage.getItem("profile") || "{}");
      if (profile?.assignedSchools?.[0]?.school) {
        profile.assignedSchools[0].school = {
          ...profile.assignedSchools[0].school,
          ...updatedSchool,
        };
        localStorage.setItem("profile", JSON.stringify(profile));
      }
      setSchoolName(updatedSchool.name);
      // Si en el futuro hay imagen, aquí: setSchoolImage(updatedSchool.photoUrl || defaultSchoolImage);
      showTemporaryMessage("success", "Escuela actualizada correctamente");
      onClose();
    } catch (error) {
      showTemporaryMessage("error", "Error al actualizar la escuela");
      onClose();
    }
  };

  return (
    <Modal show onHide={onClose} centered size="lg" className="school-edit-modal">
      <Modal.Header closeButton>
        <Modal.Title>Editar Perfil de la Escuela</Modal.Title>
      </Modal.Header>

      <Modal.Body className="edit-school-body">
        <div className="school-edit-header">
          <img
            src={defaultSchoolImage}
            alt="Logo Escuela"
            className="school-edit-photo"
          />
        </div>

        <div className="school-form">
          <label htmlFor="school-name">Nombre de la escuela</label>
          <input
            id="school-name"
            type="text"
            name="name"
            placeholder="Nombre de la escuela"
            value={formData.name}
            onChange={handleChange}
          />
          <label htmlFor="school-address">Dirección</label>
          <input
            id="school-address"
            type="text"
            name="address"
            placeholder="Dirección"
            value={formData.address}
            onChange={handleChange}
          />
          <label htmlFor="school-aerodrome">Aeródromo</label>
          <input
            id="school-aerodrome"
            type="text"
            name="aerodrome"
            placeholder="Aeródromo"
            value={formData.aerodrome}
            onChange={handleChange}
          />
          <label htmlFor="school-publicEmail">Email público</label>
          <input
            id="school-publicEmail"
            type="email"
            name="publicEmail"
            placeholder="Email público"
            value={formData.publicEmail}
            onChange={handleChange}
          />
          <label htmlFor="school-publicPhone">Teléfono</label>
          <input
            id="school-publicPhone"
            type="text"
            name="publicPhone"
            placeholder="Teléfono"
            value={formData.publicPhone}
            onChange={handleChange}
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditSchoolProfileModal;
