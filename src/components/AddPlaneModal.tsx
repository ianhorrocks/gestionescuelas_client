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
  const [focusedFields, setFocusedFields] = useState<{
    [key: string]: boolean;
  }>({});

  const handleFocus = (field: string) =>
    setFocusedFields((prev) => ({ ...prev, [field]: true }));

  const handleBlur = (field: string) =>
    setFocusedFields((prev) => ({ ...prev, [field]: false }));

  const placeholders: { [key: string]: string } = {
    registrationNumber: "Ej: LV-S007",
    totalHours: "0",
    model: "Ej: P202",
    brand: "Ej: Cessna",
    baseAerodrome: "Ej: La Carlota",
  };

  const [planeData, setPlaneData] = useState({
    registrationNumber: "",
    country: "Argentina",
    brand: "",
    model: "",
    totalHours: "",
    lastMaintenance: "",
    baseAerodrome: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setPlaneData({ ...planeData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedPlaneData = {
      ...planeData,
      totalHours:
        planeData.totalHours === "" ? 0 : parseFloat(planeData.totalHours),
      lastMaintenance: planeData.lastMaintenance
        ? new Date(planeData.lastMaintenance)
        : undefined,
    };

    onAddPlane(formattedPlaneData);
    onClose();
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal show={show} onHide={onClose} className="fade add-modal">
      <Modal.Header closeButton>
        <Modal.Title>Agregar Avión</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formRegistrationNumber" className="form-group">
            <Form.Control
              type="text"
              name="registrationNumber"
              value={planeData.registrationNumber}
              onChange={handleChange}
              onFocus={() => handleFocus("registrationNumber")}
              onBlur={() => handleBlur("registrationNumber")}
              required
              className="floating-input"
              placeholder={
                focusedFields["registrationNumber"]
                  ? placeholders["registrationNumber"]
                  : " "
              }
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
              onFocus={() => handleFocus("brand")}
              onBlur={() => handleBlur("brand")}
              required
              className="floating-input"
              placeholder={focusedFields["brand"] ? placeholders["brand"] : " "}
            />
            <Form.Label className="floating-label">Marca</Form.Label>
          </Form.Group>

          <Form.Group controlId="formModel" className="form-group">
            <Form.Control
              type="text"
              name="model"
              value={planeData.model}
              onChange={handleChange}
              onFocus={() => handleFocus("model")}
              onBlur={() => handleBlur("model")}
              required
              className="floating-input"
              placeholder={focusedFields["model"] ? placeholders["model"] : " "}
            />
            <Form.Label className="floating-label">Modelo</Form.Label>
          </Form.Group>

          <Form.Group controlId="formTotalHours" className="form-group">
            <Form.Control
              type="number"
              name="totalHours"
              value={planeData.totalHours}
              onChange={handleChange}
              onFocus={() => handleFocus("totalHours")}
              onBlur={() => handleBlur("totalHours")}
              required
              className="floating-input"
              placeholder={
                focusedFields["totalHours"] ? placeholders["totalHours"] : " "
              }
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
              max={today}
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
              onFocus={() => handleFocus("baseAerodrome")}
              onBlur={() => handleBlur("baseAerodrome")}
              required
              className="floating-input"
              placeholder={
                focusedFields["baseAerodrome"]
                  ? placeholders["baseAerodrome"]
                  : " "
              }
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
