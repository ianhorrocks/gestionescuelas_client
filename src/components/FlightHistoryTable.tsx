// src/components/FlightHistoryTable.tsx
import React, { useState, useMemo } from "react";
import { Modal, Button } from "react-bootstrap";
import { updateFlightStatus } from "../services/flightService";
import { HistoryFlight } from "../types/types";
import FilterSelect from "./FilterSelect"; // Importa el componente FilterSelect
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

interface FlightHistoryTableProps {
  flights: HistoryFlight[];
  onStatusChange: (
    id: string,
    status: "pending" | "confirmed" | "cancelled"
  ) => void;
  showTemporaryMessage?: (
    type: "success" | "error" | "warning",
    message: string
  ) => void;
}

const statusMap = {
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

const FlightHistoryTable: React.FC<FlightHistoryTableProps> = ({
  flights,
  onStatusChange,
  showTemporaryMessage,
}) => {
  const [selectedFlights, setSelectedFlights] = useState<string[]>([]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [sortField, setSortField] = useState<
    "date" | "airplane" | "instructor" | "pilot" | "status" | "time"
  >("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

  const sortedFlights = useMemo(() => {
    return [...flights].sort((a, b) => {
      let compare = 0;
      if (sortField === "date") {
        compare = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === "airplane") {
        compare = (a.airplane?.registrationNumber || "").localeCompare(
          b.airplane?.registrationNumber || ""
        );
      } else if (sortField === "instructor") {
        compare = (a.instructor?.lastname || "").localeCompare(
          b.instructor?.lastname || ""
        );
      } else if (sortField === "pilot") {
        compare = a.pilot.lastname.localeCompare(b.pilot.lastname);
      } else if (sortField === "status") {
        compare = a.status.localeCompare(b.status);
      } else if (sortField === "time") {
        const timeA =
          new Date(a.arrivalTime).getTime() -
          new Date(a.departureTime).getTime();
        const timeB =
          new Date(b.arrivalTime).getTime() -
          new Date(b.departureTime).getTime();
        compare = timeA - timeB;
      }
      return sortOrder === "asc" ? compare : -compare;
    });
  }, [flights, sortField, sortOrder]);

  const paginatedFlights = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedFlights.slice(start, end);
  }, [sortedFlights, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedFlights.length / rowsPerPage);

  const bulkToPending = async () => {
    try {
      for (const id of selectedFlights) {
        await updateFlightStatus(id, "pending");
        if (onStatusChange) {
          onStatusChange(id, "pending");
        }
      }
      showTemporaryMessage?.(
        "success",
        "Vuelo/s devuelto/s a pendiente correctamente."
      );
      setSelectedFlights([]);
    } catch (error) {
      showTemporaryMessage?.(
        "error",
        "Ocurrió un error al devolver los vuelos a pendiente."
      );
    } finally {
      setConfirmModal(false);
    }
  };

  if (flights.length === 0) {
    return (
      <div className="flight-history-table-wrapper">
        <p className="no-flights">No hay vuelos para mostrar.</p>
      </div>
    );
  }

  return (
    <>
      <div className="tab-content history-tab">
        <div className="flight-history-header-wrapper">
          <div className="flight-history-header">
            <FilterSelect
              options={[
                { value: "date", label: "Fecha" },
                { value: "airplane", label: "Aeronave" },
                { value: "instructor", label: "Instructor" },
                { value: "pilot", label: "Piloto" },
                { value: "status", label: "Estado" },
                { value: "time", label: "Tiempo Volado" },
              ]}
              value={sortField}
              onChange={(value) => setSortField(value as typeof sortField)}
              placeholder="Ordenar por"
              keyboard
              autoClose
            />
            <button
              className="sort-order-button"
              onClick={() =>
                setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
              }
              title={
                sortOrder === "desc"
                  ? "Cambiar a ascendente"
                  : "Cambiar a descendente"
              }
            >
              {sortOrder === "desc" ? <FaArrowUp /> : <FaArrowDown />}
            </button>
          </div>
        </div>
        <div className="flight-history-container">
          <div className="flight-history-table-wrapper">
            <table className="flight-history-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Piloto</th>
                  <th>Instructor</th>
                  <th>Aeronave</th>
                  <th>Ruta</th>
                  <th>Estado</th>
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
                {paginatedFlights.map((flight) => (
                  <tr key={flight._id}>
                    <td>
                      {new Date(flight.date).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      {new Date(flight.departureTime).toLocaleTimeString(
                        "es-ES",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }
                      )}
                      {" - "}
                      {new Date(flight.arrivalTime).toLocaleTimeString(
                        "es-ES",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }
                      )}
                    </td>
                    <td>
                      {flight.pilot.name} {flight.pilot.lastname}
                    </td>
                    <td>
                      {flight.instructor
                        ? `${flight.instructor.name} ${flight.instructor.lastname}`
                        : "N/A"}
                    </td>
                    <td>
                      {flight.airplane
                        ? flight.airplane.registrationNumber
                        : "N/A"}
                    </td>
                    <td>
                      {flight.origin} → {flight.destination}
                    </td>
                    <td>
                      <span className={`badge ${flight.status}`}>
                        {statusMap[flight.status]}
                      </span>
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

            {/* Floating Button */}
            {selectedFlights.length > 0 && (
              <div className="floating-buttons">
                <button
                  className="floating-button to-pending"
                  onClick={() => setConfirmModal(true)}
                >
                  Volver a Pendiente
                </button>
              </div>
            )}
          </div>

          <div className="flight-table-pagination centered">
            <div className="rows-per-page">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </div>
            <div className="page-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              <span>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal de confirmación */}
      <Modal show={confirmModal} onHide={() => setConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas devolver los vuelos seleccionados a
          pendiente?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={bulkToPending}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FlightHistoryTable;
