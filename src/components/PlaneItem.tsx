import React, { useState } from "react";
import { Card, Modal, Button } from "react-bootstrap";
import { TrashFill } from "react-bootstrap-icons";
import defaultPlane from "../assets/images/default-plane.jpg";
import "../styles/GeneralComponents/Items/_UserItem.scss";
import {
  assignEmbeddedIdToPlane,
  removeEmbeddedIdFromPlane,
} from "../services/planeService";
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import Alert from "./Alert";
import { Plane } from "../types/types";

interface PlaneItemProps {
  plane: Plane;
  onDelete: (id: string) => void;
  onUpdatePhoto: (id: string, formData: FormData) => Promise<void>;
  onIdAssigned: (updatedPlane: Plane) => void;
}

const PlaneItem: React.FC<PlaneItemProps> = ({
  plane,
  onDelete,
  onIdAssigned,
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [idInput, setIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { message, showTemporaryMessage } = useTemporaryMessage();

  const planePhoto = plane.photoUrl || defaultPlane;

  const handleShowModal = () => setShowDetailModal(true);
  const handleCloseModal = () => {
    onIdAssigned(plane);
    setShowDetailModal(false);
  };

  const [currentIdEmbebbedState, setCurrentEmbebbedState] = useState(
    plane?.idEmbebbed || ""
  );

  const handleAssignId = async () => {
    setLoading(true);
    try {
      const upperId = idInput.toUpperCase();
      await assignEmbeddedIdToPlane(plane._id, upperId);
      setCurrentEmbebbedState(upperId);
      showTemporaryMessage("success", "ID Escaner asignado correctamente");
      setIdInput("");
      onIdAssigned({ ...plane, idEmbebbed: upperId });
    } catch (err) {
      console.error("FAILED TO ASSIGN EMBEDDED ID:", err);
      showTemporaryMessage("error", "Error al asignar el ID Escaner");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveId = async () => {
    setLoading(true);
    try {
      await removeEmbeddedIdFromPlane(plane._id);
      setCurrentEmbebbedState("");
      showTemporaryMessage("success", "ID Escaner eliminado correctamente");
      onIdAssigned({ ...plane, idEmbebbed: "" });
    } catch (err) {
      console.error("Error eliminando ID Escaner");
      showTemporaryMessage("error", "Error al eliminar el ID Escaner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="plane-item" onClick={handleShowModal}>
        <Card.Img
          variant="top"
          src={planePhoto}
          alt={plane.registrationNumber}
        />
        <Card.Body>
          <Card.Title className="plane-registration">
            {plane.registrationNumber}
          </Card.Title>
          <Card.Text className="plane-details">
            {plane.brand} - {plane.model}
          </Card.Text>
          <Card.Text>
            ID Escaner:{" "}
            <strong
              className={`plane-id ${!plane.idEmbebbed ? "text-danger" : ""}`}
            >
              {plane.idEmbebbed || "Sin asignar"}
            </strong>
          </Card.Text>
        </Card.Body>
      </Card>

      <Modal show={showDetailModal} onHide={handleCloseModal} keyboard={true}>
        <Modal.Header closeButton>
          <Modal.Title>Ficha de aeronave</Modal.Title>
        </Modal.Header>
        <Modal.Body className="plane-modal-body">
          <div className="plane-photo-container">
            <img
              src={planePhoto}
              alt={plane.model}
              className="plane-photo img-fluid mb-3"
            />
          </div>

          <h5 className="section-title">Detalles de la aeronave:</h5>
          <p className="subtitle">
            Aeródromo base: <strong>{plane.baseAerodrome}</strong>
          </p>
          <p className="subtitle">
            Marca: <strong>{plane.brand}</strong>
          </p>
          <p className="subtitle">
            Modelo: <strong>{plane.model}</strong>
          </p>
          <p className="subtitle">
            Matrícula: <strong>{plane.registrationNumber}</strong>
          </p>

          <h5 className="section-title mt-4">Relación con la escuela:</h5>
          <p className="subtitle">
            Agregado el: <strong>{plane.addedDate || "-"}</strong>
          </p>

          <div className="plane-id-row">
            <h5 className="section-title mt-4" style={{ marginBottom: 0 }}>
              ID Escaner:
            </h5>
            <strong
              className={`mt-4 ${
                currentIdEmbebbedState ? "id-assigned" : "id-unassigned"
              }`}
              style={{ marginLeft: "0.5rem" }}
            >
              {currentIdEmbebbedState || "Sin asignar"}
            </strong>
          </div>

          <div
            className="tag-assignment-container"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              width: "100%",
            }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="Ingresa el ID"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && idInput && !loading) {
                  handleAssignId();
                }
              }}
              style={{
                flex: 1,
                minWidth: 120,
                maxWidth: 300,
                padding: "0.375rem 0.75rem",
                borderRadius: "0.25rem",
                border: "1px solid #ced4da",
                backgroundColor: "#fff",
                fontSize: "1rem",
                lineHeight: 1.5,
                color: "#495057",
                transition:
                  "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
              }}
            />
            <button
              className="btn btn-assign"
              disabled={loading || !idInput}
              onClick={handleAssignId}
              style={{
                minWidth: 40,
                padding: "0 12px",
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.25rem",
                border: "1px solid transparent",
                backgroundColor: "#007bff",
                color: "#fff",
                fontSize: "1rem",
                lineHeight: 1.5,
                textAlign: "center",
                textDecoration: "none",
                transition:
                  "background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
              }}
            >
              {loading ? "..." : "Asignar"}
            </button>
            <button
              className="btn btn-delete-tag"
              onClick={handleRemoveId}
              disabled={loading}
              style={{
                minWidth: 40,
                padding: "0 12px",
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.25rem",
                border: "1px solid transparent",
                backgroundColor: "#dc3545",
                color: "#fff",
                fontSize: "1rem",
                lineHeight: 1.5,
                textAlign: "center",
                textDecoration: "none",
                transition:
                  "background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
              }}
            >
              <TrashFill />
            </button>
          </div>

          {message && <Alert message={message.message} type={message.type} />}

          <h5 className="section-title">Acciones:</h5>
          <Button
            onClick={() => {
              onDelete(plane._id);
              handleCloseModal();
            }}
            className="btn-delete-school mt-3 d-block"
          >
            Eliminar de la escuela
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PlaneItem;
