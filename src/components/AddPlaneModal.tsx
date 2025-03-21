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
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Avión</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formRegistrationNumber" className="mb-3">
            <Form.Label>Matricula</Form.Label>
            <Form.Control
              type="text"
              name="registrationNumber"
              value={planeData.registrationNumber}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formCountry" className="mb-3">
            <Form.Label>País</Form.Label>
            <Form.Control
              as="select"
              name="country"
              value={planeData.country}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="Argentina">🇦🇷 Argentina</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="formBrand" className="mb-3">
            <Form.Label>Marca</Form.Label>
            <Form.Control
              type="text"
              name="brand"
              value={planeData.brand}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formModel" className="mb-3">
            <Form.Label>Modelo</Form.Label>
            <Form.Control
              type="text"
              name="model"
              value={planeData.model}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formTotalHours" className="mb-3">
            <Form.Label>
              Horas Totales{" "}
              <small>
                <strong>(Odometro Actual)</strong>
              </small>
            </Form.Label>
            <Form.Control
              type="number"
              name="totalHours"
              value={planeData.totalHours}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formLastMaintenance" className="mb-3">
            <Form.Label>Último Mantenimiento</Form.Label>
            <Form.Control
              type="date"
              name="lastMaintenance"
              value={planeData.lastMaintenance}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formBaseAerodrome" className="mb-3">
            <Form.Label>Aeródromo Base</Form.Label>
            <Form.Control
              type="text"
              name="baseAerodrome"
              value={planeData.baseAerodrome}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="modal-button mt-3">
            Agregar
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddPlaneModal;
