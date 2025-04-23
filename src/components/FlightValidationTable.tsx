import React from "react";
import { Flight } from "../types/types";

interface FlightValidationTableProps {
  flights: Flight[];
}

const FlightValidationTable: React.FC<FlightValidationTableProps> = ({
  flights,
}) => {
  return (
    <div className="flight-validation-table-wrapper">
      <table className="flight-validation-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Piloto</th>
            <th>Instructor</th>
            <th>Aeronave</th>
            <th>Ruta</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight) => (
            <tr
              key={flight._id}
              className={flight.preValidated ? "prevalidated" : ""}
            >
              <td>{new Date(flight.date).toLocaleDateString("es-ES")}</td>
              <td>
                {new Date(flight.departureTime).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
                {" - "}
                {new Date(flight.arrivalTime).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </td>
              <td>
                {flight.pilot.name} {flight.pilot.lastname}
              </td>
              <td>
                {flight.instructor
                  ? `${flight.instructor.name} ${flight.instructor.lastname}`
                  : "Sin Instructor"}
              </td>
              <td>
                {flight.airplane
                  ? flight.airplane.registrationNumber
                  : "Sin Avión"}
              </td>
              <td>
                {flight.origin} → {flight.destination}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FlightValidationTable;
