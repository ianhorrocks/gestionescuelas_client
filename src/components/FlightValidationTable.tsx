import React, { useEffect, useState } from "react";
import { Flight } from "../types/types";
import { Modal, Button } from "react-bootstrap";
import { updateFlightStatus } from "../services/flightService";

interface FlightValidationTableProps {
  flights: Flight[];
  onStatusChange?: (id: string, status: "confirmed" | "cancelled") => void;
  validationStep?: 1 | 2 | 3;
  setValidationStep?: (step: 1 | 2 | 3) => void; // Agregamos esta prop para actualizar el paso
  showTemporaryMessage?: (
    type: "success" | "error" | "warning",
    message: string
  ) => void;
}

const FlightValidationTable: React.FC<FlightValidationTableProps> = ({
  flights,
  onStatusChange,
  validationStep,
  setValidationStep,
  showTemporaryMessage,
}) => {
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    id: string;
    action: "confirm" | "cancel";
  }>({ show: false, id: "", action: "confirm" });

  const [selectedFlights, setSelectedFlights] = useState<string[]>([]);

  useEffect(() => {
    // Si no hay vuelos pendientes y el paso actual no es "Finalizado", actualizamos el paso
    if (flights.length === 0 && validationStep !== 3) {
      setValidationStep?.(3); // Notifica al componente padre que debe avanzar al paso "Finalizado"
    }
  }, [flights, validationStep, setValidationStep]);

  const toggleSelectAll = () => {
    if (selectedFlights.length === flights.length) {
      setSelectedFlights([]);
    } else {
      setSelectedFlights(flights.map((flight) => flight._id));
    }
  };

  const toggleSelectFlight = (id: string) => {
    setSelectedFlights((prev) =>
      prev.includes(id)
        ? prev.filter((flightId) => flightId !== id)
        : [...prev, id]
    );
  };

  const bulkAction = async (status: "confirmed" | "cancelled") => {
    const unvalidatedFlights = flights.filter(
      (flight) => selectedFlights.includes(flight._id) && !flight.preValidated
    );

    if (unvalidatedFlights.length > 0) {
      // Mostrar el modal de confirmación si hay vuelos no validados
      setConfirmModal({
        show: true,
        id: "", // No necesitamos un ID específico para el bulk
        action: status === "confirmed" ? "confirm" : "cancel",
      });
      return;
    }

    // Si todos los vuelos están validados, proceder directamente
    try {
      for (const id of selectedFlights) {
        await updateFlightStatus(id, status);
        onStatusChange?.(id, status);
      }
      showTemporaryMessage?.(
        "success",
        status === "confirmed"
          ? "Vuelo/s Confirmado. Movido a historial."
          : "Vuelo/s Rechazado. Movido a historial."
      );
      setSelectedFlights([]);
    } catch (error) {
      showTemporaryMessage?.(
        "error",
        "Ocurrió un error al actualizar los vuelos seleccionados."
      );
    }
  };

  const handleBulkActionConfirmation = async () => {
    const status =
      confirmModal.action === "confirm" ? "confirmed" : "cancelled";
    try {
      for (const id of selectedFlights) {
        await updateFlightStatus(id, status);
        onStatusChange?.(id, status);
      }
      showTemporaryMessage?.(
        "success",
        status === "confirmed"
          ? "Vuelo/s Confirmado. Movido a historial."
          : "Vuelo/s Rechazado. Movido a historial."
      );
      setSelectedFlights([]);
    } catch (error) {
      showTemporaryMessage?.(
        "error",
        "Ocurrió un error al actualizar los vuelos seleccionados."
      );
    } finally {
      setConfirmModal({ ...confirmModal, show: false });
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
              <th>
                <label
                  className="custom-checkbox"
                  title="Seleccionar todos los vuelos"
                >
                  <input
                    type="checkbox"
                    checked={selectedFlights.length === flights.length}
                    onChange={toggleSelectAll}
                  />
                  <span className="checkmark" />
                </label>
              </th>
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
                <td>
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedFlights.includes(flight._id)}
                      onChange={() => toggleSelectFlight(flight._id)}
                    />
                    <span className="checkmark" />
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Botones flotantes */}
        {selectedFlights.length > 0 && (
          <div className="floating-buttons">
            <button
              className="floating-button confirm"
              onClick={() => bulkAction("confirmed")}
            >
              Confirmar
            </button>
            <button
              className="floating-button cancel"
              onClick={() => bulkAction("cancelled")}
            >
              Rechazar
            </button>
          </div>
        )}
      </div>

      <Modal
        show={confirmModal.show}
        onHide={() => setConfirmModal({ ...confirmModal, show: false })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Aviso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmModal.id
            ? confirmModal.action === "confirm"
              ? "El vuelo no ha sido validado, ¿Deseas confirmarlo de todas formas?"
              : "El vuelo no ha sido validado, ¿Deseas cancelarlo de todas formas?"
            : confirmModal.action === "confirm"
            ? "Los/El vuelo/s seleccionado no ha sido validado, ¿Deseas confirmarlos de todas formas?"
            : "Los/El vuelo/s seleccionado no ha sido validado, ¿Deseas rechazarlos de todas formas?"}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={confirmModal.action === "confirm" ? "success" : "danger"}
            onClick={
              confirmModal.id ? handleAction : handleBulkActionConfirmation
            }
          >
            {confirmModal.action === "confirm"
              ? confirmModal.id
                ? "Confirmar Vuelo"
                : "Confirmar Vuelos"
              : confirmModal.id
              ? "Rechazar Vuelo"
              : "Rechazar Vuelos"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FlightValidationTable;
