import React, { useState } from "react";
import { Flight } from "../types/types";
import { MdCheckCircle, MdCancel } from "react-icons/md";
import { Modal, Button } from "react-bootstrap";
import { updateFlightStatus } from "../services/flightService";

interface FlightValidationTableProps {
  flights: Flight[];
  onStatusChange?: (id: string, status: "confirmed" | "cancelled") => void;
  validationStep?: 1 | 2 | 3;
  showTemporaryMessage?: (
    type: "success" | "error" | "warning",
    message: string
  ) => void; // Nueva prop
}

const FlightValidationTable: React.FC<FlightValidationTableProps> = ({
  flights,
  onStatusChange,
  validationStep = 1,
  showTemporaryMessage,
}) => {
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    id: string;
    action: "confirm" | "cancel";
  }>({ show: false, id: "", action: "confirm" });

  const directAction = async (
    id: string,
    status: "confirmed" | "cancelled"
  ) => {
    try {
      await updateFlightStatus(id, status);
      onStatusChange?.(id, status);
      showTemporaryMessage?.(
        "success",
        status === "confirmed"
          ? "El vuelo ha sido confirmado"
          : "El vuelo ha sido cancelado"
      );
    } catch (error) {
      showTemporaryMessage?.(
        "error",
        "Ocurrió un error al actualizar el vuelo."
      );
    }
  };

  const handleAction = async () => {
    const { id, action } = confirmModal;
    setConfirmModal({ ...confirmModal, show: false });
    const status = action === "confirm" ? "confirmed" : "cancelled";
    try {
      await updateFlightStatus(id, status);
      onStatusChange?.(id, status);
      showTemporaryMessage?.(
        "success",
        status === "confirmed"
          ? "El vuelo ha sido confirmado"
          : "El vuelo ha sido cancelado"
      );
    } catch (error) {
      showTemporaryMessage?.(
        "error",
        "Ocurrió un error al actualizar el vuelo."
      );
    }
  };

  const onClickConfirm = (id: string, preValidated: boolean) => {
    if (preValidated) {
      directAction(id, "confirmed");
    } else {
      setConfirmModal({ show: true, id, action: "confirm" });
    }
  };
  const onClickCancel = (id: string, preValidated: boolean) => {
    if (preValidated) {
      directAction(id, "cancelled");
    } else {
      setConfirmModal({ show: true, id, action: "cancel" });
    }
  };

  if (flights.length === 0) {
    return (
      <div className="flight-validation-table-wrapper">
        <p className="no-flights">No hay vuelos pendientes a revisar.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flight-validation-table-wrapper">
        <table className="flight-validation-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Piloto</th>
              <th>Instructor</th>
              <th>Aeronave</th>
              <th>Ruta</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight) => (
              <tr
                key={flight._id}
                className={flight.preValidated ? "prevalidated" : ""}
              >
                <td>{new Date(flight.date).toLocaleDateString("es-ES")}</td>
                <td>
                  {new Date(flight.departureTime).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}{" "}
                  -{" "}
                  {new Date(flight.arrivalTime).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </td>
                <td>
                  {flight.pilot.name} {flight.pilot.lastname}
                </td>
                <td>
                  {flight.instructor
                    ? `${flight.instructor.name} ${flight.instructor.lastname}`
                    : "Sin Instructor"}
                </td>
                <td>
                  {flight.airplane
                    ? flight.airplane.registrationNumber
                    : "Sin Avión"}
                </td>
                <td>
                  {flight.origin} → {flight.destination}
                </td>
                <td className="actions-cell">
                  {validationStep >= 2 && (
                    <>
                      <button
                        className="icon-button"
                        onClick={() =>
                          onClickConfirm(flight._id, flight.preValidated)
                        }
                        aria-label="Confirmar vuelo"
                      >
                        <MdCheckCircle size={24} />
                      </button>
                      <button
                        className="icon-button"
                        onClick={() =>
                          onClickCancel(flight._id, flight.preValidated)
                        }
                        aria-label="Cancelar vuelo"
                      >
                        <MdCancel size={24} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        show={confirmModal.show}
        onHide={() => setConfirmModal({ ...confirmModal, show: false })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {confirmModal.action === "confirm" ? "Aviso" : "Aviso"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmModal.action === "confirm"
            ? "El vuelo no ha sido validado, ¿Deseas confirmarlo de todas formas?"
            : "El vuelo no ha sido validado, ¿Deseas cancelarlo de todas formas?"}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={confirmModal.action === "confirm" ? "success" : "danger"}
            onClick={handleAction}
          >
            {confirmModal.action === "confirm"
              ? "Confirmar Vuelo"
              : "Cancelar Vuelo"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FlightValidationTable;
