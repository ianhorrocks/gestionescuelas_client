import React, { useState, useMemo } from "react";
import { FaRoute, FaClock, FaUser, FaUserTie, FaPlane } from "react-icons/fa";
import FilterSelect from "./FilterSelect"; // Importar el nuevo componente

interface Flight {
  _id: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  pilot: string;
  instructor: string;
  origin: string;
  destination: string;
  status: "pending" | "confirmed" | "cancelled";
  airplane?: string;
  totalFlightTime?: string;
}

interface FlightTableProps {
  flights: Flight[]; // ya filtrados por UserFlights
  selectedStatus: string;
  onFilterChange: (status: string) => void;
  allFlights: Flight[]; // todos los vuelos (para contar)
}

const statusMap = {
  all: "Todos",
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

const FlightTable: React.FC<FlightTableProps> = ({
  flights,
  selectedStatus,
  onFilterChange,
  allFlights,
}) => {
  const [sortField, setSortField] = useState<
    "date" | "origin" | "airplane" | "time"
  >("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const countByStatus = useMemo(() => {
    return allFlights.reduce(
      (acc, flight) => {
        acc.all++;
        acc[flight.status]++;
        return acc;
      },
      {
        all: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
      }
    );
  }, [allFlights]);

  const statusOptions = [
    { value: "all", label: `Todos (${countByStatus.all})` },
    { value: "pending", label: `Pendientes (${countByStatus.pending})` },
    { value: "confirmed", label: `Confirmados (${countByStatus.confirmed})` },
    { value: "cancelled", label: `Cancelados (${countByStatus.cancelled})` },
  ];

  const sortOptions = [
    { value: "date", label: "Fecha" },
    { value: "origin", label: "Escuela" },
    { value: "airplane", label: "Aeronave" },
    { value: "time", label: "Tiempo" },
  ];

  const handleSortChange = (field: string) => {
    if (field === sortField) {
      // Alternar entre ascendente y descendente
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Cambiar el campo de orden y establecer ascendente por defecto
      setSortField(field as "date" | "origin" | "airplane" | "time");
      setSortOrder("asc");
    }
  };

  const sortedFlights = useMemo(() => {
    return [...flights].sort((a, b) => {
      let compare = 0;

      if (sortField === "date") {
        compare = new Date(a.date).getTime() - new Date(b.date).getTime();
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
  }, [flights, sortField, sortOrder]);

  return (
    <div>
      <div className="flight-table-filters">
        <FilterSelect
          options={statusOptions}
          value={selectedStatus}
          onChange={onFilterChange}
          placeholder="Filtrar estado"
        />
        <FilterSelect
          options={sortOptions}
          value={sortField}
          onChange={handleSortChange}
          placeholder="Ordenar por"
          sortOrder={sortOrder} // Pasar el estado de orden
        />
      </div>

      {allFlights.length === 0 ? (
        <p className="no-flights-message">No has realizado ningún vuelo</p>
      ) : (
        <>
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
                {sortedFlights.map((flight) => (
                  <tr key={flight._id}>
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
                        { hour: "2-digit", minute: "2-digit", hour12: false }
                      )}
                      {" - "}
                      {new Date(flight.arrivalTime).toLocaleTimeString(
                        "es-ES",
                        { hour: "2-digit", minute: "2-digit", hour12: false }
                      )}
                      {" Hs"}
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

          {/* Cards Mobile */}
          <div className="flight-cards-mobile">
            {sortedFlights.map((flight) => (
              <div key={flight._id} className={`mobile-card ${flight.status}`}>
                <div className="mobile-card-header">
                  <span className="date">
                    {new Date(flight.date).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  <span className="time">
                    {new Date(flight.departureTime).toLocaleTimeString(
                      "es-ES",
                      { hour: "2-digit", minute: "2-digit", hour12: false }
                    )}
                    {" - "}
                    {new Date(flight.arrivalTime).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                    {" Hs"}
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
        </>
      )}
    </div>
  );
};

export default FlightTable;
