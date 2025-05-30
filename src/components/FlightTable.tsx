import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FaArrowUp,
  FaArrowDown,
  FaRoute,
  FaPlane,
  FaUser,
  FaUserTie,
  FaClock,
} from "react-icons/fa";
import FilterSelect from "./FilterSelect";
import FlightDetailModal from "./FlightDetailModal";
import { SimplifiedFlight } from "../types/types";

interface FlightTableProps {
  flights: SimplifiedFlight[];
  selectedStatus: string;
  onFilterChange: (status: string) => void;
  onRowClick?: (flight: SimplifiedFlight) => void;
  allFlights: SimplifiedFlight[];
  scrollRef?: React.RefObject<HTMLDivElement>;
  showTemporaryMessage?: (
    type: "success" | "error" | "warning",
    message: string,
    duration?: number
  ) => void;
  onHeaderHideChange?: (hide: boolean) => void;
  onFlightDeleted?: () => void; // <-- Add this prop
}

const FlightTable: React.FC<FlightTableProps> = ({
  flights,
  selectedStatus,
  onFilterChange,
  allFlights,
  scrollRef,
  showTemporaryMessage,
  onHeaderHideChange,
  onFlightDeleted, // <-- Destructure the new prop
}) => {
  const [sortField, setSortField] = useState<
    "date" | "origin" | "airplane" | "time"
  >("date");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<SimplifiedFlight | null>(
    null
  );
  const [hideHeader, setHideHeader] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollBtnActive, setScrollBtnActive] = useState(false);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const node = scrollRef?.current;
    if (!node) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScroll = node.scrollTop;
          const isHiding =
            currentScroll > lastScrollTop.current && currentScroll > 20;
          setHideHeader(isHiding);
          if (onHeaderHideChange) onHeaderHideChange(isHiding);
          lastScrollTop.current = currentScroll;
          ticking = false;
        });
        ticking = true;
      }
    };

    node.addEventListener("scroll", handleScroll);
    return () => node.removeEventListener("scroll", handleScroll);
  }, [scrollRef, onHeaderHideChange]);

  // Mostrar el botón scroll-to-top cuando se scrollea hacia abajo
  useEffect(() => {
    const node = scrollRef?.current;
    if (!node) return;
    const handleScrollBtn = () => {
      setShowScrollTop(node.scrollTop > 0);
    };
    node.addEventListener("scroll", handleScrollBtn);
    handleScrollBtn();
    return () => node.removeEventListener("scroll", handleScrollBtn);
  }, [scrollRef]);

  const handleStatusChange = (status: string) => {
    onFilterChange(status);
    setCurrentPage(1); // <-- Esto asegura que siempre vuelvas a la página 1 al cambiar filtro
  };

  const handleShowFlightModal = (flight: SimplifiedFlight) => {
    setSelectedFlight(flight);
    setShowDetailModal(true);
  };

  const handleCloseFlightModal = () => {
    setShowDetailModal(false);
    setSelectedFlight(null);
  };

  const handleScrollTopClick = () => {
    setScrollBtnActive(true);
    scrollRef?.current?.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setScrollBtnActive(false), 300);
  };

  const countByStatus = useMemo(() => {
    return allFlights.reduce(
      (acc, flight) => {
        acc.all++;
        acc[flight.status]++;
        return acc;
      },
      { all: 0, pending: 0, confirmed: 0, cancelled: 0 }
    );
  }, [allFlights]);

  const statusOptions = [
    { value: "all", label: `Todos (${countByStatus.all})` },
    { value: "pending", label: `Pendientes (${countByStatus.pending})` },
    { value: "confirmed", label: `Confirmados (${countByStatus.confirmed})` },
    { value: "cancelled", label: `Rechazados (${countByStatus.cancelled})` },
  ];

  const sortOptions = [
    { value: "date", label: "Fecha" },
    { value: "origin", label: "Escuela" },
    { value: "airplane", label: "Aeronave" },
    { value: "time", label: "Tiempo Vuelo" },
  ];

  const handleSortChange = (field: string) => {
    setSortField(field as "date" | "origin" | "airplane" | "time");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const filteredFlights = useMemo(() => {
    if (selectedStatus === "all") return flights;
    return flights.filter((flight) => flight.status === selectedStatus);
  }, [flights, selectedStatus]);

  const sortedFlights = useMemo(() => {
    return [...filteredFlights].sort((a, b) => {
      let compare = 0;
      if (sortField === "date") {
        // Ordenar por fecha y hora de salida
        compare =
          new Date(a.departureTime).getTime() -
          new Date(b.departureTime).getTime();
      } else if (sortField === "origin") {
        compare = (a.origin || "").localeCompare(b.origin || "");
      } else if (sortField === "airplane") {
        compare = (a.airplane || "").localeCompare(b.airplane || "");
      } else if (sortField === "time") {
        compare =
          parseFloat(a.totalFlightTime || "0") -
          parseFloat(b.totalFlightTime || "0");
      }
      return sortOrder === "asc" ? compare : -compare;
    });
  }, [filteredFlights, sortField, sortOrder]);

  const paginatedFlights = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedFlights.slice(start, end);
  }, [sortedFlights, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedFlights.length / rowsPerPage);

  const statusMap = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    cancelled: "Rechazado",
  };

  return (
    <div className="flight-table-container">
      <div className={`flight-table-fixed-header${hideHeader ? " hide" : ""}`}>
        <div className="flight-table-filters">
          <FilterSelect
            options={statusOptions}
            value={selectedStatus}
            onChange={handleStatusChange}
            placeholder="Filtrar estado"
            keyboard
            autoClose
          />
          <div className="sort-filter-group">
            <FilterSelect
              options={sortOptions}
              value={sortField}
              onChange={(value) => handleSortChange(value)}
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
        {/* Botón scroll-to-top justo debajo del header sticky */}
        <button
          className={`scroll-top-button ${showScrollTop ? "visible" : ""} ${
            scrollBtnActive ? "active" : ""
          } ${hideHeader ? "below-navbar" : "below-header"}`}
          onClick={handleScrollTopClick}
          aria-label="Subir arriba"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <FaArrowUp />
        </button>
      </div>
      <div className="flights-scrollable-body" ref={scrollRef}>
        <div className="flight-table-wrapper">
          <table className="flight-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Piloto</th>
                <th>Instructor</th>
                <th>Aeronave</th>
                <th>Ruta</th>
                <th>Horario</th>
                <th>Tiempo Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFlights.map((flight) => (
                <tr
                  key={flight._id}
                  onClick={() => handleShowFlightModal(flight)}
                >
                  <td>
                    {new Date(flight.date).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td>{flight.pilot}</td>
                  <td>{flight.instructor}</td>
                  <td>{flight.airplane || "-"}</td>
                  <td>
                    {flight.origin} → {flight.destination}
                  </td>
                  <td>
                    {new Date(flight.departureTime).toLocaleTimeString(
                      "es-ES",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }
                    )}{" "}
                    -{" "}
                    {new Date(flight.arrivalTime).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}{" "}
                    Hs
                  </td>
                  <td>
                    {flight.totalFlightTime
                      ? `${parseFloat(flight.totalFlightTime).toFixed(1)} h`
                      : "N/A"}
                  </td>
                  <td>
                    <span className={`badge ${flight.status}`}>
                      {statusMap[flight.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flight-cards-mobile">
          {paginatedFlights.map((flight) => (
            <div
              key={flight._id}
              className={`mobile-card ${flight.status}`}
              onClick={() => handleShowFlightModal(flight)}
            >
              <div className="mobile-card-header">
                <span className="date">
                  {new Date(flight.date).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
                <span className="time">
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
                  })}{" "}
                  Hs
                </span>
              </div>

              <div className="mobile-card-row">
                <div className="icon-value">
                  <FaRoute className="icon" />
                  <span className="value">
                    {flight.origin} → {flight.destination}
                  </span>
                </div>
                {flight.airplane && (
                  <div className="icon-value">
                    <FaPlane className="icon" />
                    <span className="value">{flight.airplane}</span>
                  </div>
                )}
              </div>

              <div className="mobile-card-row">
                <div className="pilot-instructor-block">
                  <div className="icon-value">
                    <FaUser className="icon" />
                    <span className="value">{flight.pilot}</span>
                  </div>
                  <div className="icon-value instructor-subtle">
                    <FaUserTie className="icon" />
                    <span className="value">{flight.instructor}</span>
                  </div>
                </div>
                <div className="icon-value">
                  <FaClock className="icon" />
                  <span className="value">
                    {flight.totalFlightTime
                      ? `${parseFloat(flight.totalFlightTime).toFixed(1)} h`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flight-table-fixed-footer">
        <div className="flight-table-pagination">
          <div className="rows-per-page">
            <FilterSelect
              options={[
                { value: "10", label: "10" },
                { value: "20", label: "20" },
                { value: "30", label: "30" },
              ]}
              value={rowsPerPage.toString()}
              onChange={(value) => {
                setRowsPerPage(Number(value));
                setCurrentPage(1);
              }}
              placeholder="rowsPerPage.toString()"
              className="open-up"
              keyboard
              autoClose
            />
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
      <FlightDetailModal
        show={showDetailModal}
        onHide={handleCloseFlightModal}
        flight={selectedFlight}
        showTemporaryMessage={showTemporaryMessage || (() => {})}
        onFlightDeleted={onFlightDeleted} // <-- Pass the prop down
      />
    </div>
  );
};

export default FlightTable;
