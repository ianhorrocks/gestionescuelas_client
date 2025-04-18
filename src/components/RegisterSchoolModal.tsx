import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { NewSchool } from "../types/types";

interface RegisterSchoolModalProps {
  show: boolean;
  onClose: () => void;
  onRegisterSchool: (schoolData: NewSchool) => Promise<void>;
}

const RegisterSchoolModal: React.FC<RegisterSchoolModalProps> = ({
  show,
  onClose,
  onRegisterSchool,
}) => {
  const [step, setStep] = useState(1);
  const [useSameEmail, setUseSameEmail] = useState(false);
  const [schoolData, setSchoolData] = useState<NewSchool>({
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

  const [showPassword, setShowPassword] = useState(false);

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
    <Modal show={show} onHide={onClose} className="fade register-school-modal">
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
          <Form className="form-register-school">
            <Form.Group controlId="formType" className="form-group">
              <Form.Control
                as="select"
                name="type"
                value={schoolData.type}
                onChange={handleChange}
                required
                className="form-select floating-input"
                placeholder=" "
              >
                <option value="Aeroclub">Aeroclub</option>
                <option value="Escuela de vuelo">Escuela de vuelo</option>
                <option value="Club de planeadores">Club de planeadores</option>
              </Form.Control>
              <Form.Label className="floating-label">
                Tipo de entidad
              </Form.Label>
            </Form.Group>
            <Form.Group controlId="formName" className="form-group">
              <Form.Control
                type="text"
                name="name"
                value={schoolData.name}
                onChange={handleChange}
                required
                className="floating-input"
                placeholder=" "
              />
              <Form.Label className="floating-label">
                Nombre de la entidad
              </Form.Label>
            </Form.Group>
            <Form.Group controlId="formCountry" className="form-group">
              <Form.Control
                as="select"
                name="country"
                value={schoolData.country}
                onChange={handleChange}
                required
                className="form-select floating-input"
                placeholder=" "
              >
                <option value="Argentina">🇦🇷 Argentina</option>
              </Form.Control>
              <Form.Label className="floating-label">País</Form.Label>
            </Form.Group>
            <Form.Group controlId="formAerodrome" className="form-group">
              <Form.Control
                type="text"
                name="aerodrome"
                value={schoolData.aerodrome}
                onChange={handleChange}
                required
                className="floating-input"
                placeholder=" "
              />
              <Form.Label className="floating-label">Aeródromo base</Form.Label>
            </Form.Group>
            <div className="text-end">
              <Button
                variant="primary"
                onClick={handleNext}
                className="modal-button"
              >
                Continuar
              </Button>
            </div>
          </Form>
        )}
        {step === 2 && (
          <Form className="form-register-school">
            <Form.Group controlId="formAddress" className="form-group">
              <Form.Control
                type="text"
                name="address"
                value={schoolData.address}
                onChange={handleChange}
                required
                className="floating-input"
                placeholder=" "
              />
              <Form.Label className="floating-label">Dirección</Form.Label>
            </Form.Group>
            <Form.Group controlId="formOpeningHours" className="form-group">
              <Form.Control
                type="text"
                name="openingHours"
                value={schoolData.openingHours}
                onChange={handleChange}
                required
                className="floating-input"
                placeholder=" "
              />
              <Form.Label className="floating-label">
                Horarios de apertura
              </Form.Label>
            </Form.Group>
            <Form.Group controlId="formPublicPhone" className="form-group">
              <Form.Control
                type="text"
                name="publicPhone"
                value={schoolData.publicPhone}
                onChange={handleChange}
                required
                className="floating-input"
                placeholder=" "
              />
              <Form.Label className="floating-label">
                Teléfono público
              </Form.Label>
            </Form.Group>
            <Form.Group controlId="formPublicEmail" className="form-group">
              <Form.Control
                type="email"
                name="publicEmail"
                value={schoolData.publicEmail}
                onChange={handleChange}
                required
                className="floating-input"
                placeholder=" "
              />
              <Form.Label className="floating-label">Email público</Form.Label>
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
          <Form onSubmit={handleSubmit} className="form-register-school">
            <Form.Group controlId="formAdminEmail" className="form-group">
              <Form.Control
                type="email"
                name="adminEmail"
                value={schoolData.adminEmail}
                onChange={handleChange}
                required
                className="floating-input text-muted"
                placeholder=" "
                style={{ fontSize: "0.875rem" }} // Reduce font size by 1 point
              />
              <Form.Label
                className="floating-label text-muted"
                style={{ fontSize: "0.875rem" }} // Reduce font size by 1 point
              >
                Email del administrador
              </Form.Label>
              <Form.Check
                type="checkbox"
                label="Usar mismo email público"
                checked={useSameEmail}
                onChange={handleUseSameEmailChange}
                className="mt-2 text-muted"
                style={{ fontSize: "0.875rem" }} // Reduce font size by 1 point
              />
            </Form.Group>
            <Form.Group controlId="formAdminPassword" className="form-group">
              <div className="password-input-container">
                <Form.Control
                  type="password"
                  name="adminPassword"
                  value={schoolData.adminPassword}
                  onChange={handleChange}
                  required
                  className="floating-input"
                  placeholder=" "
                />
                <Form.Label className="floating-label">
                  Contraseña del administrador
                </Form.Label>
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-icon"
                />
              </div>
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
