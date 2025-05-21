import React from "react";
import { Modal } from "react-bootstrap";
import { SimplifiedFlight } from "../types/types";

interface Props {
  show: boolean;
  onHide: () => void;
  flight: SimplifiedFlight | null;
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

const FlightDetailModal: React.FC<Props> = ({ show, onHide, flight }) => {
  if (!flight) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Ficha de Vuelo del {new Date(flight.date).toLocaleDateString("es-AR")}
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
          <strong>Volado en:</strong> {flight.school || "No disponible"}
        </p>
        <p>
          <strong>Aeronave:</strong> {flight.airplane || "N/A"}
        </p>
        <p>
          <strong>Duración: </strong>
          {formatDurationSexagesimal(flight.totalFlightTime)} Hs (
          {formatDurationDecimal(flight.totalFlightTime)})
        </p>

        <p>
          <strong>Origen:</strong> {flight.origin}
        </p>
        <p>
          <strong>Destino:</strong> {flight.destination}
        </p>
      </Modal.Body>
    </Modal>
  );
};

export default FlightDetailModal;
