import React from "react";
import { Flight } from "../types/types";

interface FlightValidationTableProps {
  flights: Flight[];
  csvData: Flight[]; // Datos del CSV para contrastar
}

const FlightValidationTable: React.FC<FlightValidationTableProps> = ({
  flights,
  csvData,
}) => {
  return (
    <div className="flight-validation-table-wrapper">
      <table className="flight-validation-table">
        <thead>
          <tr>
            <th colSpan={5} className="pending-data-header">
              Vuelos Pendientes
            </th>
            <th colSpan={5} className="csv-data-header">
              Vuelos del Embebido
            </th>
          </tr>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Piloto</th>
            <th>Instructor</th>
            <th>Aeronave</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Piloto</th>
            <th>Instructor</th>
            <th>Aeronave</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight, index) => {
            const csvFlight: Partial<Flight> = csvData[index] || {};

            return (
              <tr key={flight._id}>
                <td>{new Date(flight.date).toLocaleDateString("es-ES")}</td>
                <td>
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
                  {csvFlight.date
                    ? new Date(csvFlight.date).toLocaleDateString("es-ES")
                    : "-"}
                </td>
                <td>
                  {csvFlight.departureTime && csvFlight.arrivalTime
                    ? `${new Date(csvFlight.departureTime).toLocaleTimeString(
                        "es-ES",
                        { hour: "2-digit", minute: "2-digit", hour12: false }
                      )} - ${new Date(csvFlight.arrivalTime).toLocaleTimeString(
                        "es-ES",
                        { hour: "2-digit", minute: "2-digit", hour12: false }
                      )}`
                    : "-"}
                </td>
                <td>
                  {csvFlight.pilot
                    ? `${csvFlight.pilot.name} ${csvFlight.pilot.lastname}`
                    : "-"}
                </td>
                <td>
                  {csvFlight.instructor
                    ? `${csvFlight.instructor.name} ${csvFlight.instructor.lastname}`
                    : "-"}
                </td>
                <td>
                  {csvFlight.airplane
                    ? csvFlight.airplane.registrationNumber
                    : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FlightValidationTable;
