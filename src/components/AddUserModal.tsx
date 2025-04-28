import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import CustomSelect from "./CustomSelect";
import axios from "axios";

interface AddUserModalProps {
  show: boolean;
  onClose: () => void;
  onAssignUser: (dni: string, role: string) => Promise<void>;
  showTemporaryMessage: (
    type: "success" | "error" | "warning",
    message: string
  ) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  show,
  onClose,
  onAssignUser,
  showTemporaryMessage,
}) => {
  const [dni, setDni] = useState("");
  const [role, setRole] = useState("Alumno");

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      // Solo permite números
      setDni(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar longitud del DNI
    if (dni.length < 7 || dni.length > 8) {
      showTemporaryMessage("error", "El DNI debe tener entre 7 y 8 dígitos.");
      return;
    }

    try {
      await onAssignUser(dni, role);
      showTemporaryMessage("success", "Usuario asignado exitosamente.");
      onClose();
    } catch (error) {
      console.log("Error del servidor:", error); // Log para depurar
      if (axios.isAxiosError(error)) {
        if (
          error.response?.status === 404 &&
          error.response?.data?.message === "USER_NOT_FOUND"
        ) {
          showTemporaryMessage("error", "El usuario no se encontró.");
        } else if (error.response?.status === 400) {
          showTemporaryMessage(
            "error",
            "El usuario ya está asignado a la escuela."
          );
        } else {
          showTemporaryMessage(
            "error",
            "Ocurrió un error al asignar el usuario."
          );
        }
      } else {
        showTemporaryMessage("error", "Ocurrió un error inesperado.");
      }
    }
  };

  const roleOptions = [
    { value: "Alumno", label: "Alumno" },
    { value: "Piloto", label: "Piloto" },
    { value: "Instructor", label: "Instructor" },
  ];

  return (
    <Modal
      show={show}
      onHide={onClose}
      className="fade add-modal add-user-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Agregar Usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formDni" className="form-group">
            <Form.Control
              type="text"
              value={dni}
              onChange={handleDniChange}
              required
              className="floating-input"
              placeholder=" "
              maxLength={8} // Limita el número máximo de caracteres
            />
            <Form.Label className="floating-label">DNI</Form.Label>
          </Form.Group>
          <Form.Group controlId="formRole" className="form-group">
            <CustomSelect
              options={roleOptions}
              value={role}
              onChange={(value) => setRole(value)}
              placeholder="Rol"
            />
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
