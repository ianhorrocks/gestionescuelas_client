import React from "react";
import { FaRoute, FaClock, FaUser, FaUserTie, FaPlane } from "react-icons/fa";

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
  flights: Flight[];
  selectedStatus: string;
  onFilterChange: (status: string) => void;
  allFlights: Flight[];
}

const statusMap = {
  all: "Todos",
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

const filterLabelMap = {
  all: "Todos",
  pending: "Pendientes",
  confirmed: "Confirmados",
  cancelled: "Cancelados",
};

const FlightTable: React.FC<FlightTableProps> = ({
  flights,
  selectedStatus,
  onFilterChange,
  allFlights,
}) => {
  const countByStatus = allFlights.reduce(
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

  return (
    <div>
      <div className="flight-table-filters">
        {Object.keys(filterLabelMap).map((statusKey) => (
          <button
            key={statusKey}
            className={`status-tab ${
              selectedStatus === statusKey ? "active" : ""
            }`}
            onClick={() => onFilterChange(statusKey)}
          >
            {filterLabelMap[statusKey as keyof typeof filterLabelMap]} (
            {countByStatus[statusKey as keyof typeof countByStatus]})
          </button>
        ))}
      </div>

      <div className="flight-table-wrapper">
        <table className="flight-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Estado</th>
              <th>Piloto</th>
              <th>Instructor</th>
              <th>Ruta</th>
              <th>Aeronave</th>
              <th>Tiempo Total</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight) => {
              return (
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
                        hour12: false, // Formato 24 horas
                      }
                    )}{" "}
                    -{" "}
                    {new Date(flight.arrivalTime).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false, // Formato 24 horas
                    })}{" "}
                    Hs
                  </td>
                  <td>
                    <span className={`badge ${flight.status}`}>
                      {statusMap[flight.status]}
                    </span>
                  </td>
                  <td>{flight.pilot}</td>
                  <td>{flight.instructor}</td>
                  <td>
                    {flight.origin} → {flight.destination}
                  </td>
                  <td>{flight.airplane || "-"}</td>
                  <td>
                    {flight.totalFlightTime
                      ? `${parseFloat(flight.totalFlightTime).toFixed(1)} h`
                      : "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flight-cards-mobile">
        {flights.map((flight) => (
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
  );
};

export default FlightTable;
