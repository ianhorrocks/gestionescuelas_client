import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { NewUser } from "../types/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface RegisterUserModalProps {
  show: boolean;
  onClose: () => void;
  onRegisterUser: (userData: NewUser) => void;
}

const RegisterUserModal: React.FC<RegisterUserModalProps> = ({
  show,
  onClose,
  onRegisterUser,
}) => {
  const [userData, setUserData] = useState<
    NewUser & { confirmPassword: string }
  >({
    dni: "",
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [dniError, setDniError] = useState("");
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const [showDniRequirements, setShowDniRequirements] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const maxLength = 15;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (password.length < minLength || password.length > maxLength) {
      return `La contraseña debe tener entre ${minLength} y ${maxLength} caracteres.`;
    }
    if (!hasUpperCase) {
      return "La contraseña debe tener al menos una letra mayúscula.";
    }
    if (!hasLowerCase) {
      return "La contraseña debe tener al menos una letra minúscula.";
    }
    if (!hasNumber) {
      return "La contraseña debe tener al menos un número.";
    }
    return "";
  };

  const validateDni = (dni: string) => {
    const dniLength = dni.length;
    if (dniLength < 7 || dniLength > 8) {
      return "DNI debe ser numérico y tener 7 u 8 dígitos.";
    }
    if (!/^\d+$/.test(dni)) {
      return "DNI debe ser numérico.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordValidationError = validatePassword(userData.password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    if (userData.password !== userData.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }
    const dniValidationError = validateDni(userData.dni);
    if (dniValidationError) {
      setDniError(dniValidationError);
      return;
    }
    await onRegisterUser(userData);
    onClose();
  };

  const renderValidationIcon = (isValid: boolean) => {
    return isValid ? (
      <FontAwesomeIcon icon={faCheck} className="text-success" />
    ) : (
      <FontAwesomeIcon icon={faTimes} className="text-danger" />
    );
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      className="fade register-user-modal"
      size="sm"
    >
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.2rem" }}>Crea tu cuenta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className="register-user-form">
          <Form.Group controlId="formDni" className="form-group">
            <Form.Control
              type="text"
              name="dni"
              value={userData.dni}
              onChange={handleChange}
              required
              className="floating-input"
              placeholder=" "
              onFocus={() => setShowDniRequirements(true)}
              onBlur={() => setShowDniRequirements(false)}
            />
            <Form.Label className="floating-label">DNI</Form.Label>
            {dniError && <div className="text-danger">{dniError}</div>}
            {showDniRequirements && (
              <div className="validation-requirements">
                <div>
                  {renderValidationIcon(
                    userData.dni.length >= 7 && userData.dni.length <= 8
                  )}
                  <span> Longitud entre 7 y 8 dígitos</span>
                </div>
              </div>
            )}
          </Form.Group>
          <div className="d-flex justify-content-between">
            <Form.Group
              controlId="formName"
              className="form-group me-1"
              style={{ flex: 1 }}
            >
              <Form.Control
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
                required
                className="floating-input"
                placeholder=" "
              />
              <Form.Label className="floating-label">Nombre</Form.Label>
            </Form.Group>
            <Form.Group
              controlId="formLastname"
              className="form-group ms-1"
              style={{ flex: 1 }}
            >
              <Form.Control
                type="text"
                name="lastname"
                value={userData.lastname}
                onChange={handleChange}
                required
                className="floating-input"
                placeholder=" "
              />
              <Form.Label className="floating-label">Apellido</Form.Label>
            </Form.Group>
          </div>
          <Form.Group controlId="formEmail" className="form-group">
            <Form.Control
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">Email</Form.Label>
          </Form.Group>
          <Form.Group controlId="formPassword" className="form-group">
            <div className="password-input-container">
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                value={userData.password}
                onChange={handleChange}
                required
                className="floating-input"
                placeholder=" "
                onFocus={() => setShowPasswordRequirements(true)}
                onBlur={() => setShowPasswordRequirements(false)}
              />
              <Form.Label className="floating-label">Contraseña</Form.Label>
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-icon"
              />
            </div>
            {showPasswordRequirements && (
              <div className="validation-requirements">
                <div>
                  {renderValidationIcon(
                    userData.password.length >= 8 &&
                      userData.password.length <= 15
                  )}
                  <span> Longitud entre 8 y 15 caracteres</span>
                </div>
                <div>
                  {renderValidationIcon(/[A-Z]/.test(userData.password))}
                  <span> Al menos una letra mayúscula</span>
                </div>
                <div>
                  {renderValidationIcon(/[a-z]/.test(userData.password))}
                  <span> Al menos una letra minúscula</span>
                </div>
                <div>
                  {renderValidationIcon(/[0-9]/.test(userData.password))}
                  <span> Al menos un número</span>
                </div>
              </div>
            )}
          </Form.Group>
          <Form.Group controlId="formConfirmPassword" className="form-group">
            <div className="password-input-container">
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
                required
                className="floating-input"
                placeholder=" "
              />
              <Form.Label className="floating-label">
                Repetir Contraseña
              </Form.Label>
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEyeSlash : faEye}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle-icon"
              />
            </div>
          </Form.Group>
          {passwordError && <div className="text-danger">{passwordError}</div>}
          <div className="d-flex justify-content-between ">
            <Button
              variant="primary"
              className="btn btn-primary text-end"
              type="submit"
              style={{ fontSize: "0.9rem" }}
            >
              Registrar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RegisterUserModal;
