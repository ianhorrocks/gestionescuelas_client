// src/components/FlightHistoryTable.tsx
import React, { useState, useMemo } from "react";
import { Modal, Button, FormControl } from "react-bootstrap";
import {
  updateFlightStatus,
  deleteFlight,
  getFlight,
} from "../services/flightService";
import { HistoryFlight, SimplifiedFlight } from "../types/types";
import FilterSelect from "./FilterSelect";
import {
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaSearch,
  FaCalendarAlt,
} from "react-icons/fa";
import FlightAdminDetailModal from "./FlightAdminDetailModal";
import DatePickerBase, { DatePickerProps } from "react-datepicker";
const DatePicker = DatePickerBase as unknown as React.FC<DatePickerProps>;
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import prevalidatedTrue from "../assets/images/verified.png";
import prevalidatedFalse from "../assets/images/not-verified.png";

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
  cancelled: "Rechazado",
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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<SimplifiedFlight | null>(
    null
  );
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [exitingRows, setExitingRows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const askToPending = (ids: string[]) => {
    setPendingIds(ids);
    setConfirmModal(true);
  };

  const confirmToPending = async () => {
    try {
      setExitingRows(pendingIds); // Marcar filas para animación
      await new Promise((resolve) => setTimeout(resolve, 500)); // Esperar animación
      await Promise.all(
        pendingIds.map((id) => updateFlightStatus(id, "pending"))
      );
      showTemporaryMessage?.(
        "success",
        pendingIds.length > 1
          ? "Vuelos devueltos a pendiente correctamente"
          : "Vuelo devuelto a pendiente correctamente"
      );
      setSelectedFlights([]);
      setShowDetailModal(false);
      if (onStatusChange) {
        pendingIds.forEach((id) => onStatusChange(id, "pending"));
      }
    } catch (error) {
      showTemporaryMessage?.("error", "Ocurrió un error");
    } finally {
      setConfirmModal(false);
      setPendingIds([]);
      setExitingRows([]);
    }
  };

  // Filtrado por búsqueda y fecha
  const filteredFlights = useMemo(() => {
    let filtered = paginatedFlights;
    if (dateFilter) {
      const selected = dateFilter;
      filtered = filtered.filter((flight) => {
        const flightDate = new Date(flight.date);
        return (
          flightDate.getFullYear() === selected.getFullYear() &&
          flightDate.getMonth() === selected.getMonth() &&
          flightDate.getDate() === selected.getDate()
        );
      });
    }
    if (!searchTerm) return filtered;
    const lower = searchTerm.toLowerCase();
    return filtered.filter((flight) => {
      // Soluciona el error de typescript para airplane
      let airplaneStr = "";
      if (typeof flight.airplane === "string") {
        airplaneStr = flight.airplane;
      } else if (
        flight.airplane &&
        typeof flight.airplane === "object" &&
        "registrationNumber" in flight.airplane
      ) {
        airplaneStr = flight.airplane.registrationNumber;
      }
      return (
        (typeof flight.pilot === "string"
          ? flight.pilot
          : `${flight.pilot.name} ${flight.pilot.lastname}`
        )
          .toLowerCase()
          .includes(lower) ||
        (typeof flight.instructor === "string"
          ? flight.instructor
          : flight.instructor
          ? `${flight.instructor.name} ${flight.instructor.lastname}`
          : ""
        )
          .toLowerCase()
          .includes(lower) ||
        airplaneStr.toLowerCase().includes(lower) ||
        (flight.origin || "").toLowerCase().includes(lower) ||
        (flight.destination || "").toLowerCase().includes(lower) ||
        (flight.status || "").toLowerCase().includes(lower)
      );
    });
  }, [paginatedFlights, searchTerm, dateFilter]);

  // Utilidad para resaltar coincidencias en texto
  function highlightMatch(text: string, search: string) {
    if (!search) return text;
    const regex = new RegExp(
      `(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <strong key={i} style={{ fontWeight: 700, background: "#ffeeba" }}>
          {part}
        </strong>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    );
  }

  if (flights.length === 0) {
    return (
      <div className="flight-history-table-wrapper">
        <p className="no-flights-history">No hay vuelos para mostrar</p>
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
                { value: "airplane", label: "Matrícula " },
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
              style={{ marginLeft: 0 }}
            >
              {sortOrder === "desc" ? <FaArrowUp /> : <FaArrowDown />}
            </button>
            <div className="search-box">
              <FaSearch className="search-icon" />
              <FormControl
                type="text"
                placeholder="Buscar vuelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flight-history-container">
          <div className="flight-history-table-wrapper">
            <table className="flight-history-table">
              <thead>
                <tr>
                  <th>
                    {/* FECHA */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        Fecha
                        <button
                          type="button"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            marginLeft: 4,
                            padding: 0,
                          }}
                          onClick={() => setShowDatePicker((v) => !v)}
                          aria-label="Filtrar por fecha"
                        >
                          <FaCalendarAlt
                            color={dateFilter ? "#007bff" : "#888"}
                            size={18}
                          />
                        </button>
                        {dateFilter && (
                          <button
                            type="button"
                            style={{
                              background: "#f0f0f0",
                              border: "1px solid #ccc",
                              borderRadius: 4,
                              color: "#555",
                              fontSize: 13,
                              marginLeft: 6,
                              padding: "2px 10px",
                              cursor: "pointer",
                              transition: "background 0.2s, color 0.2s",
                            }}
                            onClick={() => {
                              setDateFilter(null);
                              setShowDatePicker(false);
                              setCurrentPage(1);
                            }}
                            aria-label="Limpiar filtro de fecha"
                            title="Limpiar filtro de fecha"
                          >
                            Limpiar
                          </button>
                        )}
                      </span>
                      {showDatePicker && (
                        <div
                          style={{
                            position: "absolute",
                            top: 30,
                            left: 120,
                            zIndex: 9999,
                          }}
                        >
                          <DatePicker
                            selected={dateFilter}
                            onChange={(date: Date | null) => {
                              setDateFilter(date);
                              setShowDatePicker(false);
                              setCurrentPage(1);
                            }}
                            locale={es}
                            dateFormat="dd/MM/yyyy"
                            isClearable
                            inline
                            maxDate={new Date()}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                  <th>Piloto</th>
                  <th>Tipo</th>
                  <th>Instructor</th>
                  <th>Matrícula</th>
                  <th>Hora</th>
                  <th>Ruta</th>
                  <th>Pre-Validado</th>
                  <th>Estado</th>
                  <th>VER</th>
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
                {filteredFlights.map((flight) => (
                  <tr
                    key={flight._id}
                    className={
                      exitingRows.includes(flight._id) ? "row-exit" : ""
                    }
                  >
                    {/* FECHA */}
                    <td>
                      {highlightMatch(
                        new Date(flight.date).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }),
                        searchTerm
                      )}
                    </td>
                    {/* PILOTO */}
                    <td>
                      {highlightMatch(
                        `${flight.pilot.name} ${flight.pilot.lastname}`,
                        searchTerm
                      )}
                    </td>
                    {/* TIPO */}
                    <td>
                      {highlightMatch(flight.flightType || "-", searchTerm)}
                    </td>
                    {/* INSTRUCTOR */}
                    <td>
                      {highlightMatch(
                        flight.instructor
                          ? `${flight.instructor.name} ${flight.instructor.lastname}`
                          : "-",
                        searchTerm
                      )}
                    </td>
                    {/* MATRÍCULA */}
                    <td>
                      {highlightMatch(
                        flight.airplane
                          ? flight.airplane.registrationNumber
                          : "N/A",
                        searchTerm
                      )}
                    </td>
                    {/* HORA */}
                    <td>
                      {highlightMatch(
                        `${new Date(flight.departureTime).toLocaleTimeString(
                          "es-ES",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          }
                        )} - ${new Date(flight.arrivalTime).toLocaleTimeString(
                          "es-ES",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          }
                        )}`,
                        searchTerm
                      )}
                    </td>
                    {/* RUTA */}
                    <td>
                      {highlightMatch(
                        `${flight.origin} → ${flight.destination}`,
                        searchTerm
                      )}
                    </td>
                    {/* PRE-VALIDADO */}
                    <td>
                      <img
                        src={
                          flight.preValidated
                            ? prevalidatedTrue
                            : prevalidatedFalse
                        }
                        alt={
                          flight.preValidated ? "Prevalidado" : "No prevalidado"
                        }
                        title={
                          flight.preValidated ? "Prevalidado" : "No prevalidado"
                        }
                        style={{
                          width: 24,
                          height: 24,
                          verticalAlign: "middle",
                        }}
                      />
                    </td>
                    {/* ESTADO */}
                    <td>
                      <span className={`badge ${flight.status}`}>
                        {highlightMatch(statusMap[flight.status], searchTerm)}
                      </span>
                    </td>
                    {/* VER */}
                    <td>
                      <button
                        className="eye-icon-btn"
                        title="Ver detalles del vuelo"
                        onClick={async () => {
                          try {
                            const flightData = await getFlight(flight._id);
                            setSelectedFlight({
                              _id: flightData._id,
                              date: flightData.date,
                              departureTime: flightData.departureTime,
                              arrivalTime: flightData.arrivalTime,
                              pilot: `${flightData.pilot.name} ${flightData.pilot.lastname}`,
                              instructor: flightData.instructor
                                ? `${flightData.instructor.name} ${flightData.instructor.lastname}`
                                : "Sin Instructor",
                              origin: flightData.origin,
                              destination: flightData.destination,
                              status: flightData.status,
                              airplane: flightData.airplane
                                ? flightData.airplane.registrationNumber
                                : "N/A",
                              totalFlightTime: flightData.totalFlightTime,
                              school: flightData.school?.name || "N/A",
                              landings: flightData.landings,
                              oil: flightData.oil,
                              oilUnit: flightData.oilUnit,
                              charge: flightData.charge,
                              chargeUnit: flightData.chargeUnit,
                              comment: flightData.comment,
                              preValidated: flightData.preValidated,
                              flightType: flightData.flightType,
                            });
                            setShowDetailModal(true);
                          } catch (e) {
                            showTemporaryMessage?.(
                              "error",
                              "No se pudo cargar el vuelo actualizado"
                            );
                          }
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

            {/* Floating Button */}
            {selectedFlights.length > 0 && (
              <div className="floating-buttons">
                <button
                  className="floating-button to-pending"
                  onClick={() => askToPending(selectedFlights)}
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
                <option value={12}>12</option>
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
          <Modal.Title>Aviso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pendingIds.length > 1
            ? "¿Estás seguro de que deseas devolver los vuelos seleccionados a pendiente?"
            : "¿Estás seguro de que deseas devolver este vuelo a pendiente?"}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={confirmToPending}>
            {pendingIds.length > 1 ? "Confirmar vuelos" : "Confirmar vuelo"}
          </Button>
        </Modal.Footer>
      </Modal>
      <FlightAdminDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        flight={selectedFlight}
        showTemporaryMessage={showTemporaryMessage || (() => {})}
        onDelete={async () => {
          if (!selectedFlight) return;
          try {
            await deleteFlight(selectedFlight._id);
            setShowDetailModal(false);
            showTemporaryMessage?.("success", "Vuelo eliminado correctamente");
            // Aquí podrías refrescar la tabla si lo deseas
          } catch (e) {
            showTemporaryMessage?.("error", "Error al eliminar el vuelo");
          }
        }}
        onToPending={async () => {
          if (!selectedFlight) return;
          askToPending([selectedFlight._id]);
        }}
      />
    </>
  );
};

export default FlightHistoryTable;
