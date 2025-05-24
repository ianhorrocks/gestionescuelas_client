import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { SimplifiedFlight } from "../types/types";
import { timeStringToCentesimal } from "../utils/time";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface FlightAdminDetailModalProps {
  show: boolean;
  onHide: () => void;
  flight: SimplifiedFlight | null;
  showTemporaryMessage: (
    type: "success" | "error" | "warning",
    message: string
  ) => void;
  onSave?: (updated: Partial<SimplifiedFlight>) => void;
  onDelete?: () => void;
  onToPending?: () => void;
  onConfirm?: () => void;
  onReject?: () => void;
}

const statusLabels: Record<SimplifiedFlight["status"], string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Rechazado",
};

const FlightAdminDetailModal: React.FC<FlightAdminDetailModalProps> = ({
  show,
  onHide,
  flight,
  onDelete,
  onToPending,
  onConfirm,
  onReject,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  if (!flight) return null;
  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        centered
        dialogClassName="flight-admin-detail-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontWeight: 400, fontSize: "1.5rem" }}>
            Ficha de Vuelo del{" "}
            {flight ? new Date(flight.date).toLocaleDateString("es-AR") : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 style={{ fontWeight: 700, marginBottom: "1.2rem" }}>
            Detalles de vuelo
          </h6>
          <div className="admin-detail-modal-body">
            <div className="main-col">
              <p>
                <strong>Estado:</strong>{" "}
                <span className={`badge ${flight.status}`}>
                  {statusLabels[flight.status]}
                </span>
              </p>
              <p className="prevalidated-row">
                <strong>Prevalidado:</strong>{" "}
                {flight.preValidated ? (
                  <FaCheckCircle color="#27ae60" title="Prevalidado" />
                ) : (
                  <FaTimesCircle color="#c0392b" title="No prevalidado" />
                )}
              </p>
              <p>
                <strong>Piloto:</strong> {flight.pilot}
              </p>
              <p>
                <strong>Instructor:</strong> {flight.instructor}
              </p>
              <p>
                <strong>Aeronave:</strong> {flight.airplane}
              </p>
              <p>
                <strong>Origen:</strong> {flight.origin}
              </p>
            </div>
            <div className="num-col">
              <p>
                <strong>Horario:</strong>{" "}
                {flight.departureTime
                  ? new Date(flight.departureTime).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : "--:--"}{" "}
                a{" "}
                {flight.arrivalTime
                  ? new Date(flight.arrivalTime).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : "--:--"}
              </p>
              <p>
                <strong>Duración:</strong> {flight.totalFlightTime ?? "N/A"} Hs{" "}
                {flight.totalFlightTime && (
                  <>
                    ({timeStringToCentesimal(flight.totalFlightTime).toFixed(1)}
                    )
                  </>
                )}
              </p>
              <p>
                <strong>Aterrizajes:</strong> {flight.landings ?? "N/A"}
              </p>
              <p>
                <strong>Aceite:</strong>{" "}
                {flight.oil
                  ? `${flight.oil} ${
                      typeof flight.oilUnit === "string"
                        ? flight.oilUnit === "lt"
                          ? "L"
                          : "Qt"
                        : ""
                    }`
                  : "N/A"}
              </p>
              <p>
                <strong>Combustible:</strong>{" "}
                {flight.charge
                  ? `${flight.charge} ${
                      flight.chargeUnit === "lt" ? "L" : "Gal"
                    }`
                  : "N/A"}
              </p>

              <p>
                <strong>Destino:</strong> {flight.destination}
              </p>
              {flight.comment && (
                <p>
                  <strong>Comentario:</strong> {flight.comment}
                </p>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="admin-detail-actions">
          <h6 className="actions-title">Acciones</h6>
          <div className="btn-row">
            {flight.status === "pending" && (
              <div className="confirm-reject-row">
                <button className="action-btn confirm-btn" onClick={onConfirm}>
                  Confirmar Vuelo
                </button>
                <button className="action-btn reject-btn" onClick={onReject}>
                  Rechazar Vuelo
                </button>
              </div>
            )}
            {flight.status === "pending" && (
              <div className="delete-row">
                <button
                  className="action-btn delete-btn"
                  onClick={() => setShowConfirm(true)}
                >
                  Eliminar de la escuela
                </button>
              </div>
            )}
            {flight.status !== "pending" && onToPending && (
              <button
                className="action-btn to-pending-btn"
                onClick={onToPending}
              >
                Volver a pendientes
              </button>
            )}
            {flight.status !== "pending" && (
              <button
                className="action-btn delete-btn"
                onClick={() => setShowConfirm(true)}
              >
                Eliminar de la escuela
              </button>
            )}
          </div>
        </Modal.Footer>
      </Modal>
      {/* Confirmación de eliminación */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Aviso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Desea eliminar este vuelo? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => {
              setShowConfirm(false);
              onDelete && onDelete();
            }}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FlightAdminDetailModal;
