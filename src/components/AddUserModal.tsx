import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assignUserToSchool } from "../services/userService";
import Alert from "./Alert";

interface AddUserModalProps {
  show: boolean;
  onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ show, onClose }) => {
  const [dni, setDni] = useState("");
  const [role, setRole] = useState("Alumno");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assignUserToSchool({ dni, role });
      setSuccess("User assigned successfully");
      setTimeout(() => {
        onClose();
        navigate(0); // Refresh the page
      }, 2000);
    } catch (err) {
      setError("Failed to assign user");
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Agregar Usuario</h2>
        {error && <Alert message={error} type="error" />}
        {success && <Alert message={success} type="success" />}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="dni">DNI</label>
            <input
              type="text"
              className="form-control"
              id="dni"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Rol</label>
            <select
              className="form-control"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="Alumno">Alumno</option>
              <option value="Piloto">Piloto</option>
              <option value="Instructor">Instructor</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary mt-3">
            Asignar Usuario
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
