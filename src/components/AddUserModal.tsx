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
    <Modal show={show} onHide={onClose} className="fade">
      <Modal.Header closeButton>
        <Modal.Title>Asignar Usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formDni" className="mb-3">
            <Form.Label>DNI</Form.Label>
            <Form.Control
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="formRole" className="mb-1">
            <Form.Label>Rol</Form.Label>
            <Form.Control
              as="select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="custom-select"
            >
              <option value="Alumno">Alumno</option>
              <option value="Piloto">Piloto</option>
              <option value="Instructor">Instructor</option>
              <option value="Admin">Admin</option>
            </Form.Control>
          </Form.Group>
          <Button variant="primary" type="submit" className="modal-button mt-3">
            Asignar
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddUserModal;
