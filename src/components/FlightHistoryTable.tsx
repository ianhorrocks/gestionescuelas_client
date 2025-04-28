// src/components/FlightHistoryTable.tsx
import React from "react";
import { Flight as BaseFlight } from "../types/types";

type HistoryFlight = Omit<BaseFlight, "status"> & {
  status: "confirmed" | "cancelled";
};

interface FlightHistoryTableProps {
  flights: HistoryFlight[];
}

const statusMap = {
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

const FlightHistoryTable: React.FC<FlightHistoryTableProps> = ({ flights }) => {
  if (flights.length === 0) {
    return (
      <div className="flight-history-table-wrapper">
        <p className="no-flights">No hay vuelos para mostrar.</p>
      </div>
    );
  }
  return (
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
          </tr>
        </thead>
        <tbody>
          {flights.map((flight) => (
            <tr key={flight._id}>
              <td>
                {new Date(flight.date).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </td>
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
                  : "N/A"}
              </td>
              <td>
                {flight.airplane ? flight.airplane.registrationNumber : "N/A"}
              </td>
              <td>
                {flight.origin} → {flight.destination}
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
  );
};

export default FlightHistoryTable;
