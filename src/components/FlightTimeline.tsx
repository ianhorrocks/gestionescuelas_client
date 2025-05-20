import React from "react";
import { Flight } from "../types/types";
import { format } from "date-fns";
import { FaPlane, FaRoute } from "react-icons/fa";

interface Props {
  flights: Flight[];
}

const FlightTimeline: React.FC<Props> = ({ flights }) => {
  if (!flights.length)
    return <p className="flight-empty">Sin vuelos recientes</p>;

  const formatFlightTime = (time?: string) => {
    if (!time) return "Sin duración";
    const totalMinutes = Math.round(parseFloat(time) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <ul className="flight-timeline">
      {flights.map((flight) => (
        <li key={flight._id} className={flight.status}>
          <div className="flight-top">
            <div className="flight-meta">
              {format(new Date(flight.date), "dd MMM yyyy")} ·{" "}
              {formatFlightTime(flight.totalFlightTime)}
            </div>
            <div className={`flight-status ${flight.status}`}>
              {flight.status === "confirmed"
                ? "Confirmado"
                : flight.status === "pending"
                ? "Pendiente"
                : "Cancelado"}
            </div>
          </div>

          <div className="flight-info">
            <div className="flight-block">
              <FaPlane className="flight-icon" />
              <span>{flight.airplane.registrationNumber}</span>
            </div>
            <div className="flight-block">
              <FaRoute className="flight-icon" />
              <span>
                {flight.origin} → {flight.destination}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default FlightTimeline;
