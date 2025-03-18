import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "../styles/ValidateFlightsModal.css"; // Asegúrate de crear este archivo CSS

interface ValidateFlightsModalProps {
  show: boolean;
  onHide: () => void;
  onUpload: (file: File) => void;
}

const ValidateFlightsModal: React.FC<ValidateFlightsModalProps> = ({
  show,
  onHide,
  onUpload,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Validar Vuelos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="upload-zone">
          <Form.Control
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="upload-input"
          />
          <div className="upload-placeholder">
            <span>+</span>
            <p>Arrastra archivos aquí o haz clic para subirlos</p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onHide}>
          Cargar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ValidateFlightsModal;
