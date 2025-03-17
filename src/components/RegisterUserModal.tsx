import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

interface RegisterUserModalProps {
  show: boolean;
  onClose: () => void;
  onRegisterUser: (userData: {
    dni: string;
    name: string;
    lastname: string;
    email: string;
    password: string;
  }) => void;
}

const RegisterUserModal: React.FC<RegisterUserModalProps> = ({
  show,
  onClose,
  onRegisterUser,
}) => {
  const [userData, setUserData] = useState({
    dni: "",
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userData.password !== userData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    onRegisterUser(userData);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} className="fade" size="sm">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.2rem" }}>
          Crea tu cuenta en PilotLog
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formDni" className="mb-2">
            <Form.Label style={{ fontSize: "0.9rem" }}>DNI</Form.Label>
            <Form.Control
              type="text"
              name="dni"
              value={userData.dni}
              onChange={handleChange}
              required
              style={{ fontSize: "0.9rem" }}
            />
          </Form.Group>
          <div className="d-flex justify-content-between">
            <Form.Group
              controlId="formName"
              className="mb-2 me-1"
              style={{ flex: 1 }}
            >
              <Form.Label style={{ fontSize: "0.9rem" }}>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
                required
                style={{ fontSize: "0.9rem" }}
              />
            </Form.Group>
            <Form.Group
              controlId="formLastname"
              className="mb-2 ms-1"
              style={{ flex: 1 }}
            >
              <Form.Label style={{ fontSize: "0.9rem" }}>Apellido</Form.Label>
              <Form.Control
                type="text"
                name="lastname"
                value={userData.lastname}
                onChange={handleChange}
                required
                style={{ fontSize: "0.9rem" }}
              />
            </Form.Group>
          </div>
          <Form.Group controlId="formEmail" className="mb-2">
            <Form.Label style={{ fontSize: "0.9rem" }}>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
              style={{ fontSize: "0.9rem" }}
            />
          </Form.Group>
          <Form.Group controlId="formPassword" className="mb-2">
            <Form.Label style={{ fontSize: "0.9rem" }}>Contraseña</Form.Label>
            <div className="password-input-container">
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                value={userData.password}
                onChange={handleChange}
                required
                style={{ fontSize: "0.9rem" }}
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-icon"
              />
            </div>
          </Form.Group>
          <Form.Group controlId="formConfirmPassword" className="mb-2">
            <Form.Label style={{ fontSize: "0.9rem" }}>
              Repetir Contraseña
            </Form.Label>
            <div className="password-input-container">
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
                required
                style={{ fontSize: "0.9rem" }}
              />
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEyeSlash : faEye}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle-icon"
              />
            </div>
          </Form.Group>
          <div className="d-flex justify-content-between">
            <Button
              variant="secondary"
              onClick={onClose}
              style={{ fontSize: "0.9rem" }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
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
