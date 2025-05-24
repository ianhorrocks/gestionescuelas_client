import React, { useEffect, useState } from "react";
import { Flight, SimplifiedFlight } from "../types/types";
import { Modal, Button } from "react-bootstrap";
import { updateFlightStatus, deleteFlight } from "../services/flightService";
import { FaEye } from "react-icons/fa";
import FlightAdminDetailModal from "./FlightAdminDetailModal";

interface FlightValidationTableProps {
  flights: Flight[];
  onStatusChange?: (id: string, status: "confirmed" | "cancelled") => void;
  validationStep?: 1 | 2 | 3;
  setValidationStep?: (step: 1 | 2 | 3) => void;
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
    ids: string[];
    action: "confirm" | "cancel";
    preValidated: boolean;
  }>({ show: false, ids: [], action: "confirm", preValidated: false });

  const [selectedFlights, setSelectedFlights] = useState<string[]>([]);
  const [showAdminDetailModal, setShowAdminDetailModal] = useState(false);
  const [adminDetailFlight, setAdminDetailFlight] =
    useState<SimplifiedFlight | null>(null);

  useEffect(() => {
    if (flights.length === 0 && validationStep !== 3) {
      setValidationStep?.(3);
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

  // Bulk action for confirm/reject
  const bulkAction = async (status: "confirmed" | "cancelled") => {
    const selected = flights.filter((f) => selectedFlights.includes(f._id));
    const allPreValidated = selected.every((f) => f.preValidated);

    setConfirmModal({
      show: true,
      ids: selectedFlights,
      action: status === "confirmed" ? "confirm" : "cancel",
      preValidated: allPreValidated,
    });
  };

  // Confirm action for both bulk and modal
  const confirmAction = async () => {
    const { ids, action } = confirmModal;
    const status = action === "confirm" ? "confirmed" : "cancelled";
    try {
      for (const id of ids) {
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
      setShowAdminDetailModal(false);
    } catch (error) {
      showTemporaryMessage?.(
        "error",
        "Ocurrió un error al actualizar los vuelos seleccionados."
      );
    } finally {
      setConfirmModal({ ...confirmModal, show: false });
    }
  };

  // Open confirm modal for modal actions
  const handleModalAction = (action: "confirm" | "cancel") => {
    if (!adminDetailFlight) return;
    const preValidated = !!adminDetailFlight?.preValidated;
    setConfirmModal({
      show: true,
      ids: [adminDetailFlight._id],
      action,
      preValidated,
    });
  };

  function getConfirmMessage(
    action: "confirm" | "cancel",
    preValidated: boolean,
    count: number
  ) {
    const actionText =
      action === "confirm"
        ? count > 1
          ? "confirmar los vuelos"
          : "confirmar el vuelo"
        : count > 1
        ? "rechazar los vuelos"
        : "rechazar el vuelo";

    if (preValidated) {
      return (
        <>
          ¿Estás seguro que deseas <strong>{actionText}</strong>?
        </>
      );
    } else {
      if (count > 1) {
        // Bulk
        return (
          <>
            En la seleccion hay vuelos que{" "}
            <strong>no han sido validados</strong>. ¿Deseas {actionText} de
            todas formas?
          </>
        );
      } else {
        // Modal individual
        return (
          <>
            El vuelo <strong>no ha sido validado</strong>. ¿Deseas {actionText}{" "}
            de todas formas?
          </>
        );
      }
    }
  }

  if (flights.length === 0) {
    return (
      <div className="flight-validation-table-wrapper">
        <p className="no-flights-validation">
          No hay vuelos pendientes a revisar
        </p>
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
              <th>Ver</th>
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
                  <button
                    className="eye-icon-btn"
                    title="Ver detalles del vuelo"
                    onClick={() => {
                      setAdminDetailFlight({
                        _id: flight._id,
                        date: flight.date,
                        departureTime: flight.departureTime,
                        arrivalTime: flight.arrivalTime,
                        pilot: `${flight.pilot.name} ${flight.pilot.lastname}`,
                        instructor: flight.instructor
                          ? `${flight.instructor.name} ${flight.instructor.lastname}`
                          : "Sin Instructor",
                        origin: flight.origin,
                        destination: flight.destination,
                        status: flight.status,
                        airplane: flight.airplane
                          ? flight.airplane.registrationNumber
                          : "Sin Avión",
                        totalFlightTime: flight.totalFlightTime,
                        school: flight.school?.name || "N/A",
                        landings: flight.landings,
                        oil: flight.oil,
                        oilUnit: flight.oilUnit,
                        charge: flight.charge,
                        chargeUnit: flight.chargeUnit,
                        comment: flight.comment,
                        preValidated: flight.preValidated,
                      });
                      setShowAdminDetailModal(true);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <FaEye size={18} color="#555" />
                  </button>
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
          {getConfirmMessage(
            confirmModal.action,
            confirmModal.preValidated,
            confirmModal.ids.length
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={confirmModal.action === "confirm" ? "success" : "danger"}
            onClick={confirmAction}
          >
            {confirmModal.action === "confirm"
              ? confirmModal.ids.length > 1
                ? "Confirmar Vuelos"
                : "Confirmar Vuelo"
              : confirmModal.ids.length > 1
              ? "Rechazar Vuelos"
              : "Rechazar Vuelo"}
          </Button>
        </Modal.Footer>
      </Modal>

      <FlightAdminDetailModal
        show={showAdminDetailModal}
        onHide={() => setShowAdminDetailModal(false)}
        flight={adminDetailFlight}
        showTemporaryMessage={showTemporaryMessage || (() => {})}
        onDelete={async () => {
          if (!adminDetailFlight) return;
          try {
            await deleteFlight(adminDetailFlight._id);
            setShowAdminDetailModal(false);
            showTemporaryMessage?.("success", "Vuelo eliminado correctamente");
          } catch (e) {
            showTemporaryMessage?.("error", "Error al eliminar el vuelo");
          }
        }}
        onConfirm={() => handleModalAction("confirm")}
        onReject={() => handleModalAction("cancel")}
      />
    </>
  );
};

export default FlightValidationTable;
