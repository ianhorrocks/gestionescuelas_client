import React, { useState } from "react";
import { SimplifiedFlight, Flight } from "../types/types";
import { format } from "date-fns";
import { FaPlane, FaRoute } from "react-icons/fa";
import { formatFlightDuration, timeStringToCentesimal } from "../utils/time";
import FlightDetailModal from "./FlightDetailModal";

interface Props {
  flights: Flight[];
}

const FlightTimeline: React.FC<Props> = ({ flights }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<SimplifiedFlight | null>(
    null
  );

  function toSimplifiedFlight(flight: Flight): SimplifiedFlight {
    return {
      _id: flight._id,
      date: flight.date,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      pilot: `${flight.pilot.name} ${flight.pilot.lastname}`,
      instructor: flight.instructor
        ? `${flight.instructor.name} ${flight.instructor.lastname}`
        : "S/A",
      origin: flight.origin,
      destination: flight.destination,
      status: flight.status,
      airplane: flight.airplane ? flight.airplane.registrationNumber : "N/A",
      totalFlightTime: flight.totalFlightTime
        ? timeStringToCentesimal(flight.totalFlightTime).toString()
        : "N/A",
      school: flight.school?.name || "N/A",
      preValidated: flight.preValidated,
      flightType: flight.flightType,
    };
  }

  const flightsToShow = [...flights]
    .sort(
      (a, b) =>
        new Date(b.departureTime).getTime() -
        new Date(a.departureTime).getTime()
    )
    .slice(0, 3);

  if (!flightsToShow.length)
    return <p className="flight-empty">Sin vuelos recientes</p>;

  const handleOpenModal = (flight: Flight) => {
    setSelectedFlight(toSimplifiedFlight(flight));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFlight(null);
  };

  return (
    <>
      <ul className="flight-timeline">
        {flightsToShow.map((flight) => (
          <li
            key={flight._id}
            className={flight.status}
            style={{ cursor: "pointer" }}
            onClick={() => handleOpenModal(flight)}
          >
            <div className="flight-top">
              <div className="flight-meta">
                {format(new Date(flight.date), "dd MMM yyyy")} ·{" "}
                {formatFlightDuration(flight.totalFlightTime)}
              </div>
              <div className={`flight-status ${flight.status}`}>
                {flight.status === "confirmed"
                  ? "Confirmado"
                  : flight.status === "pending"
                  ? "Pendiente"
                  : "Rechazado"}
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
      <FlightDetailModal
        show={showModal}
        onHide={handleCloseModal}
        flight={selectedFlight}
        showTemporaryMessage={() => {}}
      />
    </>
  );
};

export default FlightTimeline;
