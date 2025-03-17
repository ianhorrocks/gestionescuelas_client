import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface RegisterSchoolModalProps {
  show: boolean;
  onClose: () => void;
  onRegisterSchool: (schoolData: {
    type: string;
    name: string;
    country: string;
    aerodrome: string;
    address: string;
    openingHours: string;
    publicPhone: string;
    publicEmail: string;
    adminEmail: string;
    adminPassword: string;
  }) => Promise<void>;
}

const RegisterSchoolModal: React.FC<RegisterSchoolModalProps> = ({
  show,
  onClose,
  onRegisterSchool,
}) => {
  const [step, setStep] = useState(1);
  const [useSameEmail, setUseSameEmail] = useState(false);
  const [schoolData, setSchoolData] = useState({
    type: "Escuela de vuelo",
    name: "",
    country: "🇦🇷 Argentina",
    aerodrome: "",
    address: "",
    openingHours: "",
    publicPhone: "",
    publicEmail: "",
    adminEmail: "",
    adminPassword: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setSchoolData({ ...schoolData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRegisterSchool(schoolData);
    onClose();
  };

  const handleUseSameEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUseSameEmail(e.target.checked);
    if (e.target.checked) {
      setSchoolData({ ...schoolData, adminEmail: schoolData.publicEmail });
    } else {
      setSchoolData({ ...schoolData, adminEmail: "" });
    }
  };

  return (
    <Modal show={show} onHide={onClose} className="fade">
      <Modal.Header closeButton>
        <Modal.Title>Registrar mi escuela</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? "active" : ""}`}>
            <div className="step-number">1</div>
            <div className="step-label">Información de escuela</div>
          </div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>
            <div className="step-number">2</div>
            <div className="step-label">Datos de contacto</div>
          </div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>
            <div className="step-number">3</div>
            <div className="step-label">Cuenta</div>
          </div>
        </div>
        {step === 1 && (
          <Form>
            <Form.Group controlId="formType" className="mb-3">
              <Form.Label>Tipo de entidad</Form.Label>
              <Form.Control
                as="select"
                name="type"
                value={schoolData.type}
                onChange={handleChange}
                required
                className="custom-select"
              >
                <option value="Aeroclub">Aeroclub</option>
                <option value="Escuela de vuelo">Escuela de vuelo</option>
                <option value="Club de planeadores">Club de planeadores</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Nombre de la entidad</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={schoolData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formCountry" className="mb-3">
              <Form.Label>País</Form.Label>
              <Form.Control
                as="select"
                name="country"
                value={schoolData.country}
                onChange={handleChange}
                required
                className="custom-select"
              >
                <option value="Argentina">🇦🇷 Argentina</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formAerodrome" className="mb-3">
              <Form.Label>Aeródromo base</Form.Label>
              <Form.Control
                type="text"
                name="aerodrome"
                value={schoolData.aerodrome}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={handleNext}
              className="modal-button"
            >
              Continuar
            </Button>
          </Form>
        )}
        {step === 2 && (
          <Form>
            <Form.Group controlId="formAddress" className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={schoolData.address}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formOpeningHours" className="mb-3">
              <Form.Label>Horarios de apertura</Form.Label>
              <Form.Control
                type="text"
                name="openingHours"
                value={schoolData.openingHours}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formPublicPhone" className="mb-3">
              <Form.Label>Teléfono público</Form.Label>
              <Form.Control
                type="text"
                name="publicPhone"
                value={schoolData.publicPhone}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formPublicEmail" className="mb-3">
              <Form.Label>Email público</Form.Label>
              <Form.Control
                type="email"
                name="publicEmail"
                value={schoolData.publicEmail}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={handleBack}>
                Atrás
              </Button>
              <Button variant="primary" onClick={handleNext}>
                Continuar
              </Button>
            </div>
          </Form>
        )}
        {step === 3 && (
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formAdminEmail" className="mb-3">
              <Form.Label>Email del administrador</Form.Label>
              <Form.Control
                type="email"
                name="adminEmail"
                value={schoolData.adminEmail}
                onChange={handleChange}
                required
              />
              <Form.Check
                type="checkbox"
                label="Usar mismo email público"
                checked={useSameEmail}
                onChange={handleUseSameEmailChange}
              />
            </Form.Group>
            <Form.Group controlId="formAdminPassword" className="mb-3">
              <Form.Label>Contraseña del administrador</Form.Label>
              <Form.Control
                type="password"
                name="adminPassword"
                value={schoolData.adminPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={handleBack}>
                Atrás
              </Button>
              <Button variant="primary" type="submit">
                Registrar
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default RegisterSchoolModal;
