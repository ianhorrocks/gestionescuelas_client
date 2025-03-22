import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface AddPlaneModalProps {
  show: boolean;
  onClose: () => void;
  onAddPlane: (planeData: {
    registrationNumber: string;
    country: string;
    brand: string;
    model: string;
    totalHours: number;
    lastMaintenance?: Date; // Opcional
    baseAerodrome: string;
  }) => void;
}

const AddPlaneModal: React.FC<AddPlaneModalProps> = ({
  show,
  onClose,
  onAddPlane,
}) => {
  const [planeData, setPlaneData] = useState({
    registrationNumber: "",
    country: "Argentina",
    brand: "",
    model: "",
    totalHours: 0,
    lastMaintenance: "", // Inicializar como cadena vacía
    baseAerodrome: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "lastMaintenance") {
      setPlaneData({ ...planeData, [name]: value }); // Mantener como cadena
    } else if (name === "totalHours") {
      setPlaneData({ ...planeData, [name]: parseFloat(value) }); // Convertir a número
    } else {
      setPlaneData({ ...planeData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPlaneData = {
      ...planeData,
      lastMaintenance: planeData.lastMaintenance
        ? new Date(planeData.lastMaintenance)
        : undefined, // Convertir a Date si no está vacío
    };
    onAddPlane(formattedPlaneData);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} className="fade add-plane-modal">
      <Modal.Header closeButton>
        <Modal.Title>Agregar Avión</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formRegistrationNumber" className="form-group">
            <Form.Control
              type="text"
              name="registrationNumber"
              value={planeData.registrationNumber}
              onChange={handleChange}
              required
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">Matrícula</Form.Label>
          </Form.Group>

          <Form.Group controlId="formCountry" className="form-group">
            <Form.Control
              as="select"
              name="country"
              value={planeData.country}
              onChange={handleChange}
              required
              className="floating-input"
            >
              <option value="Argentina">🇦🇷 Argentina</option>
            </Form.Control>
            <Form.Label className="floating-label">País</Form.Label>
          </Form.Group>

          <Form.Group controlId="formBrand" className="form-group">
            <Form.Control
              type="text"
              name="brand"
              value={planeData.brand}
              onChange={handleChange}
              required
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">Marca</Form.Label>
          </Form.Group>

          <Form.Group controlId="formModel" className="form-group">
            <Form.Control
              type="text"
              name="model"
              value={planeData.model}
              onChange={handleChange}
              required
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">Modelo</Form.Label>
          </Form.Group>

          <Form.Group controlId="formTotalHours" className="form-group">
            <Form.Control
              type="number"
              name="totalHours"
              value={planeData.totalHours}
              onChange={handleChange}
              required
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">Horas Totales</Form.Label>
          </Form.Group>

          <Form.Group controlId="formLastMaintenance" className="form-group">
            <Form.Control
              type="date"
              name="lastMaintenance"
              value={planeData.lastMaintenance}
              onChange={handleChange}
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">
              Último Mantenimiento
            </Form.Label>
          </Form.Group>

          <Form.Group controlId="formBaseAerodrome" className="form-group">
            <Form.Control
              type="text"
              name="baseAerodrome"
              value={planeData.baseAerodrome}
              onChange={handleChange}
              required
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">Aeródromo Base</Form.Label>
          </Form.Group>
          <div className="text-end">
            <Button
              variant="primary"
              type="submit"
              className="modal-button mt-3"
            >
              Agregar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddPlaneModal;
