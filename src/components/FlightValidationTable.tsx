import React, { useEffect, useState } from "react";
import { Flight } from "../types/types";
import { Modal, Button } from "react-bootstrap";
import { updateFlightStatus, deleteFlight } from "../services/flightService";
import { FaEye } from "react-icons/fa";
import FlightAdminDetailModal from "./FlightAdminDetailModal";
import { isValid } from "date-fns";

interface FlightValidationTableProps {
  flights: Flight[];
  onStatusChange?: (id: string, status: "confirmed" | "cancelled") => void;
  validationStep?: 1 | 2 | 3;
  setValidationStep?: (step: 1 | 2 | 3) => void;
  showTemporaryMessage?: (
    type: "success" | "error" | "warning",
    message: string
  ) => void;
  onBulkSelectedChange?: (selected: boolean) => void;
  forceConfirmModal?: {
    show: boolean;
    ids: string[];
    action: "confirm" | "cancel";
    preValidated: boolean;
    onClose: () => void;
    onConfirmed?: () => void;
  };
}

const FlightValidationTable: React.FC<FlightValidationTableProps> = ({
  flights,
  onStatusChange,
  validationStep,
  setValidationStep,
  showTemporaryMessage,
  onBulkSelectedChange,
  forceConfirmModal,
}) => {
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    ids: string[];
    action: "confirm" | "cancel";
    preValidated: boolean;
  }>({ show: false, ids: [], action: "confirm", preValidated: false });

  // Estado exclusivo para el modal de "Confirmar Válidos"
  const [showConfirmValidosModal, setShowConfirmValidosModal] = useState(false);
  const [confirmValidosIds, setConfirmValidosIds] = useState<string[]>([]);

  const [selectedFlights, setSelectedFlights] = useState<string[]>([]);
  const [showAdminDetailModal, setShowAdminDetailModal] = useState(false);
  const [adminDetailFlight, setAdminDetailFlight] = useState<Flight | null>(
    null
  );
  const [exitingRows, setExitingRows] = useState<string[]>([]);

  useEffect(() => {
    if (flights.length === 0 && validationStep !== 3) {
      setValidationStep?.(3);
    }
  }, [flights, validationStep, setValidationStep]);

  useEffect(() => {
    if (onBulkSelectedChange) {
      onBulkSelectedChange(selectedFlights.length > 0);
    }
  }, [selectedFlights, onBulkSelectedChange]);

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

  // Bulk action para confirm/reject (NO para válidos)
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

  // Acción para el botón "Confirmar Válidos"
  const openConfirmValidosModal = (ids: string[]) => {
    setConfirmValidosIds(ids);
    setShowConfirmValidosModal(true);
  };

  const handleConfirmValidos = async () => {
    const ids = confirmValidosIds;
    try {
      setExitingRows(ids);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await Promise.all(ids.map((id) => updateFlightStatus(id, "confirmed")));
      showTemporaryMessage?.(
        "success",
        ids.length === 1
          ? "Vuelo confirmado. Movido a historial."
          : "Vuelos confirmados. Movidos a historial."
      );
      setSelectedFlights([]);
      setShowConfirmValidosModal(false);
      if (onStatusChange) {
        ids.forEach((id) => onStatusChange(id, "confirmed"));
      }
    } catch (error) {
      showTemporaryMessage?.(
        "error",
        "Ocurrió un error al confirmar los vuelos validados."
      );
    } finally {
      setShowConfirmValidosModal(false);
      setExitingRows([]);
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
    // Si es confirmación masiva de válidos (forceConfirmModal y todos preValidated)
    if (
      forceConfirmModal &&
      forceConfirmModal.show &&
      action === "confirm" &&
      preValidated
    ) {
      if (count === 1) {
        return (
          <>El vuelo ha sido validado correctamente, ¿Deseas confirmarlo?</>
        );
      } else {
        return (
          <>
            {count} vuelos han sido validados correctamente, ¿Deseas
            confirmarlos?
          </>
        );
      }
    }
    // Mensaje estándar para bulk y modal individual
    const actionText =
      action === "confirm"
        ? count > 1
          ? "confirmar los vuelos"
          : "confirmar el vuelo"
        : count > 1
        ? "rechazar los vuelos"
        : "rechazar el vuelo";

    if (preValidated) {
      return <>¿Estás seguro que deseas {actionText}?</>;
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

  // Parsea una fecha en formato DD/MM/YYYY o YYYY-MM-DD a objeto Date
  function parseFlightDate(dateStr: string) {
    // Intenta YYYY-MM-DD
    let d = new Date(dateStr);
    if (isValid(d)) return d;
    // Intenta DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split("/");
      d = new Date(`${year}-${month}-${day}`);
    } else {
      d = new Date(dateStr);
    }
    if (isValid(d)) return d;
    return new Date(NaN); // Fecha inválida
  }

  // Ordenar vuelos por fecha (descendente) y hora de salida (descendente)
  const sortedFlights = [...flights].sort((a, b) => {
    const dateA = parseFlightDate(a.date);
    const dateB = parseFlightDate(b.date);
    // Si las fechas son iguales, comparar hora
    if (dateB.getTime() === dateA.getTime()) {
      return (b.departureTime || "00:00").localeCompare(
        a.departureTime || "00:00"
      );
    }
    return dateB.getTime() - dateA.getTime();
  });

  // Vuelos prevalidados y pendientes
  const prevalidatedFlights: Flight[] = flights.filter(
    (flight) => flight.preValidated && flight.status === "pending"
  );

  // Mostrar botón flotante solo en paso 2, si hay prevalidados y no hay selección bulk
  const showFloatingValidos =
    validationStep === 2 &&
    prevalidatedFlights.length > 0 &&
    selectedFlights.length === 0;

  if (flights.length === 0) {
    return (
      <div className="flight-validation-table-wrapper">
        <p className="no-flights-validation">
          No hay vuelos pendientes a revisar
        </p>
      </div>
    );
  }

  // Handler para el modal estándar (bulk/individual)
  const handleModalConfirmed = async () => {
    const ids = confirmModal.ids;
    const status =
      confirmModal.action === "confirm" ? "confirmed" : "cancelled";
    try {
      setExitingRows(ids);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await Promise.all(ids.map((id) => updateFlightStatus(id, status)));
      showTemporaryMessage?.(
        "success",
        status === "confirmed"
          ? "Vuelo/s Confirmado. Movido a historial."
          : "Vuelo/s Rechazado. Movido a historial."
      );
      setSelectedFlights([]);
      setShowAdminDetailModal(false);
      if (onStatusChange) {
        ids.forEach((id) => onStatusChange(id, status));
      }
    } catch (error) {
      showTemporaryMessage?.(
        "error",
        "Ocurrió un error al actualizar los vuelos seleccionados."
      );
    } finally {
      setConfirmModal({ ...confirmModal, show: false });
      setExitingRows([]);
    }
  };

  return (
    <>
      <div className="flight-validation-table-wrapper">
        <table className="flight-validation-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Piloto</th>
              <th>Tipo</th>
              <th>Instructor</th>
              <th>Matrícula</th>
              <th>Hora</th>
              <th>Ruta</th>
              <th>Estado</th>
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
            {sortedFlights.map((flight) => (
              <tr
                key={flight._id}
                className={`${flight.preValidated ? "prevalidated" : ""} ${
                  exitingRows.includes(flight._id) ? "row-exit" : ""
                }`.trim()}
              >
                {/* FECHA */}
                <td>
                  {parseFlightDate(flight.date).toLocaleDateString("es-ES")}
                </td>
                {/* PILOTO */}
                <td>
                  {flight.pilot.name} {flight.pilot.lastname}
                </td>
                {/* TIPO */}
                <td>{flight.flightType || "-"}</td>
                {/* INSTRUCTOR */}
                <td>
                  {flight.instructor
                    ? `${flight.instructor.name} ${flight.instructor.lastname}`
                    : "Sin Instructor"}
                </td>
                {/* MATRÍCULA */}
                <td>
                  {flight.airplane
                    ? flight.airplane.registrationNumber
                    : "Sin Avión"}
                </td>
                {/* HORA */}
                <td>
                  {flight.departureTime
                    ? new Date(flight.departureTime).toLocaleTimeString(
                        "es-ES",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }
                      )
                    : "--:--"}
                  {" a "}
                  {flight.arrivalTime
                    ? new Date(flight.arrivalTime).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : "--:--"}
                </td>
                {/* RUTA */}
                <td>
                  {flight.origin} → {flight.destination}
                </td>
                {/* ESTADO */}
                <td>
                  <span className={`badge ${flight.status}`}>
                    {flight.status === "pending" ? "Pendiente" : flight.status}
                  </span>
                </td>
                {/* VER */}
                <td>
                  <button
                    className="eye-icon-btn"
                    title="Ver detalles del vuelo"
                    onClick={() => {
                      setAdminDetailFlight(flight);
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
                {/* BULK */}
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

        {/* Render floating button para "Confirmar Válidos" (solo si no hay selección bulk y hay prevalidados) */}
        {showFloatingValidos && (
          <div className="floating-buttons">
            <button
              className="floating-button validated-bulk"
              onClick={() =>
                openConfirmValidosModal(prevalidatedFlights.map((f) => f._id))
              }
            >
              Confirmar Válidos
            </button>
          </div>
        )}
        {/* Render floating buttons para bulk solo si hay selección */}
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

      {/* Modal exclusivo para Confirmar Válidos */}
      <Modal
        show={showConfirmValidosModal}
        onHide={() => setShowConfirmValidosModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Aviso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmValidosIds.length === 1 ? (
            <>El vuelo ha sido validado correctamente, ¿Deseas confirmarlo?</>
          ) : (
            <>
              {confirmValidosIds.length} vuelos han sido validados
              correctamente, ¿Deseas confirmarlos?
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleConfirmValidos}>
            {confirmValidosIds.length === 1
              ? "Confirmar Vuelo"
              : "Confirmar Vuelos"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal estándar para bulk/individual */}
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
            onClick={handleModalConfirmed}
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
