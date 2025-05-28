import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { SimplifiedFlight, HistoryFlight, Flight } from "../types/types";
import { timeStringToCentesimal } from "../utils/time";
import prevalidatedTrue from "../assets/images/verified.png";
import prevalidatedFalse from "../assets/images/not-verified.png";

interface FlightAdminDetailModalProps {
  show: boolean;
  onHide: () => void;
  flight: HistoryFlight | SimplifiedFlight | Flight | null;
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
                <img
                  src={
                    flight.preValidated ? prevalidatedTrue : prevalidatedFalse
                  }
                  alt={flight.preValidated ? "Prevalidado" : "No prevalidado"}
                  title={flight.preValidated ? "Prevalidado" : "No prevalidado"}
                  style={{
                    width: 24,
                    height: 24,
                    verticalAlign: "middle",
                    marginLeft: 6,
                  }}
                />
              </p>
              <p>
                <strong>Tipo:</strong> {flight.flightType}
              </p>
              <p>
                <strong>Piloto:</strong>{" "}
                {typeof flight.pilot === "string"
                  ? flight.pilot
                  : flight.pilot
                  ? `${flight.pilot.name} ${flight.pilot.lastname}`
                  : "-"}
              </p>
              <p>
                <strong>Instructor:</strong>{" "}
                {typeof flight.instructor === "string"
                  ? flight.instructor
                  : flight.instructor
                  ? `${flight.instructor.name} ${flight.instructor.lastname}`
                  : "Sin Instructor"}
              </p>
              <p>
                <strong>Matrícula :</strong>{" "}
                {typeof flight.airplane === "string"
                  ? flight.airplane
                  : flight.airplane && "registrationNumber" in flight.airplane
                  ? flight.airplane.registrationNumber
                  : "Sin Avión"}
              </p>
              <p>
                <strong>Origen:</strong> {flight.origin}
              </p>
              <p>
                <strong>Destino:</strong> {flight.destination}
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
              <>
                <button className="action-btn confirm-btn" onClick={onConfirm}>
                  Confirmar Vuelo
                </button>
                <button className="action-btn reject-btn" onClick={onReject}>
                  Rechazar Vuelo
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => setShowConfirm(true)}
                >
                  Eliminar de la escuela
                </button>
              </>
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
