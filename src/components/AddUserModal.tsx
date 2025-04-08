import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface AddUserModalProps {
  show: boolean;
  onClose: () => void;
  onAssignUser: (dni: string, role: string) => Promise<void>;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  show,
  onClose,
  onAssignUser,
}) => {
  const [dni, setDni] = useState("");
  const [role, setRole] = useState("Alumno");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAssignUser(dni, role);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} className="fade add-modal">
      <Modal.Header closeButton>
        <Modal.Title>Agregar Usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formDni" className="form-group">
            <Form.Control
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">DNI</Form.Label>
          </Form.Group>
          <Form.Group controlId="formRole" className="form-group">
            <Form.Control
              as="select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="floating-input"
            >
              <option value="Alumno">Alumno</option>
              <option value="Piloto">Piloto</option>
              <option value="Instructor">Instructor</option>
            </Form.Control>
            <Form.Label className="floating-label">Rol</Form.Label>
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

export default AddUserModal;
