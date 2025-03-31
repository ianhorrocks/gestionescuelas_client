import React from "react";
import { FaPlane, FaUserTie, FaUser, FaMapMarkerAlt } from "react-icons/fa";

interface FlightCardProps {
  date: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  airplane: string; // Matrícula del avión
  pilot: string; // Nombre del piloto
  instructor: string; // Nombre del instructor
  status: "pending" | "confirmed"; // Estado del vuelo
}

const FlightCard: React.FC<FlightCardProps> = ({
  date,
  departureTime,
  arrivalTime,
  origin,
  destination,
  airplane,
  pilot,
  instructor,
  status,
}) => {
  return (
    <div className={`flight-card ${status}`}>
      <div className="flight-card-header">
        <div className="flight-date">{new Date(date).toLocaleDateString()}</div>
        <div className="flight-time">
          {departureTime} - {arrivalTime}
        </div>
      </div>
      <div className="flight-card-body">
        {/* Primera fila: Información del vuelo */}
        <div className="flight-card-info row">
          <div className="flight-info">
            <FaPlane className="icon" /> {airplane}
          </div>
          <div className="flight-locations">
            <FaMapMarkerAlt className="icon" /> {origin} → {destination}
          </div>
        </div>
        {/* Segunda fila: Tripulación */}
        <div className="flight-card-crew row">
          <div className="flight-crew">
            <FaUser className="icon" /> Piloto: {pilot}
          </div>
          <div className="flight-crew">
            <FaUserTie className="icon" /> Instr: {instructor}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightCard;
