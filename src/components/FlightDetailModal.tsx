import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { SimplifiedFlight } from "../types/types";
import { deleteFlight } from "../services/flightService"; // <-- Importa el servicio

interface Props {
  show: boolean;
  onHide: () => void;
  flight: SimplifiedFlight | null;
  showTemporaryMessage: (
    type: "success" | "error" | "warning",
    message: string
  ) => void;
  onFlightDeleted?: () => void; // <-- Add this prop
}

const statusLabels: Record<SimplifiedFlight["status"], string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Rechazado", // ✅ cambio de texto
};

const statusClass: Record<SimplifiedFlight["status"], string> = {
  pending: "badge pending",
  confirmed: "badge confirmed",
  cancelled: "badge cancelled",
};

const formatHora = (dateStr: string): string =>
  new Date(dateStr).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const formatDurationSexagesimal = (decimalStr?: string): string => {
  if (!decimalStr) return "N/A";
  const decimal = parseFloat(decimalStr);
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
};

const formatDurationDecimal = (decimalStr?: string): string => {
  if (!decimalStr) return "N/A";
  const value = parseFloat(decimalStr);
  return isNaN(value) ? "N/A" : value.toFixed(1);
};

const FlightDetailModal: React.FC<Props> = ({
  show,
  onHide,
  flight,
  showTemporaryMessage,
  onFlightDeleted, // <-- Destructure the new prop
}) => {
  const [loading, setLoading] = useState(false);
  const [showDoubleConfirmModal, setShowDoubleConfirmModal] = useState(false);

  const handleDelete = async () => {
    if (!flight) return;
    if (flight.status !== "pending") return; // Solo si está pendiente
    setLoading(true);
    try {
      await deleteFlight(flight._id); // Asegúrate que flight tiene _id
      onHide();
      showTemporaryMessage("success", "Vuelo eliminado"); // Mensaje de éxito
      if (onFlightDeleted) onFlightDeleted(); // <-- Call the callback
    } catch (error) {
      // Opcional: muestra un mensaje de error
      console.error("Error eliminando vuelo:", error);
      showTemporaryMessage("error", "Error eliminando vuelo."); // Mensaje de error
    } finally {
      setLoading(false);
    }
  };

  if (!flight) return null;

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        centered
        dialogClassName="custom-flight-modal-width"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Ficha de Vuelo del{" "}
            {flight ? new Date(flight.date).toLocaleDateString("es-AR") : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Estado:</strong>{" "}
            <span className={statusClass[flight.status]}>
              {statusLabels[flight.status]}
            </span>
          </p>
          <p>
            <strong>Piloto:</strong> {flight.pilot}
          </p>
          <p>
            <strong>Instructor:</strong> {flight.instructor}
          </p>

          <p>
            <strong>Horario:</strong> {formatHora(flight.departureTime)} a{" "}
            {formatHora(flight.arrivalTime)} Hs
          </p>
          <p>
            <strong>Duración: </strong>
            {formatDurationSexagesimal(flight.totalFlightTime)} Hs (
            {formatDurationDecimal(flight.totalFlightTime)})
          </p>
          <p>
            <strong>Escuela:</strong> {flight.school || "-"}
          </p>
          <p>
            <strong>Matrícula :</strong> {flight.airplane || "-"}
          </p>

          <p>
            <strong>Origen:</strong> {flight.origin}
          </p>
          <p>
            <strong>Destino:</strong> {flight.destination}
          </p>
          <p>
            <strong>Aterrizajes:</strong> {flight.landings ?? "-"}
          </p>
          <p>
            <strong>Aceite:</strong>{" "}
            {flight.oil
              ? `${flight.oil} ${flight.oilUnit === "lt" ? "L" : "Qt"}`
              : "-"}
          </p>
          <p>
            <strong>Combustible:</strong>{" "}
            {flight.charge
              ? `${flight.charge} ${flight.chargeUnit === "lt" ? "L" : "Gal"}`
              : "-"}
          </p>
          {flight.comment && (
            <p>
              <strong>Comentario:</strong> {flight.comment}
            </p>
          )}
        </Modal.Body>
        {flight && flight.status === "pending" && (
          <Modal.Footer>
            <div
              style={{
                marginTop: 32,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  marginBottom: 4,
                }}
              >
                Acciones:
              </span>
              <Button
                variant="link"
                style={{
                  color: "#c0392b",
                  fontWeight: 600,
                  fontSize: 16,
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 0",
                  textDecoration: "none",
                }}
                onClick={() => setShowDoubleConfirmModal(true)}
              >
                Eliminar
              </Button>
            </div>
          </Modal.Footer>
        )}
      </Modal>

      <Modal
        show={showDoubleConfirmModal}
        onHide={() => setShowDoubleConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Aviso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Esta acción eliminará el registro de vuelo de forma permanente.
          <br />
          ¿Deseas continuar?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            disabled={loading}
            onClick={() => {
              setShowDoubleConfirmModal(false);
              handleDelete();
            }}
          >
            {loading ? "Eliminando..." : "Confirmar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FlightDetailModal;
