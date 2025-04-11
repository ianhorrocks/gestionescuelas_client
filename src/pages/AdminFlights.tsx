import React, { useEffect, useState } from "react";
import { getAllSchoolFlights } from "../services/flightService";
import ValidateFlightsModal from "../components/ValidateFlightsModal";
import Navbar from "../components/NavbarAdmin";
import FlightValidationTable from "../components/FlightValidationTable";
import FlightHistoryTable from "../components/FlightHistoryTable";
import { getLoggedUser } from "../services/auth";

const AdminFlights: React.FC = () => {
  interface Flight {
    _id: string;
    status: "pending" | "confirmed" | "cancelled";
    validated: boolean;
    date: string;
    departureTime: string;
    arrivalTime: string;
    pilot: { name: string; lastname: string };
    instructor: { name: string; lastname: string } | null;
    origin: string;
    destination: string;
    airplane: { registrationNumber: string } | null;
  }

  const [flights, setFlights] = useState<Flight[]>([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const loggedUser = await getLoggedUser();
        const schoolId = loggedUser.assignedSchools[0]?.school?._id;
        const flightsData = await getAllSchoolFlights(schoolId);
        console.log("Vuelos obtenidos:", flightsData.data);

        // Normalizar los datos de los vuelos
        interface FlightData {
          _id: string;
          status: "pending" | "confirmed" | "cancelled";
          date: string;
          departureTime: string;
          arrivalTime: string;
          pilot: { name: string; lastname: string };
          instructor: { name: string; lastname: string } | null;
          origin: string;
          destination: string;
          airplane: { registrationNumber: string } | null;
        }

        const normalizedFlights = flightsData.data.map(
          (flight: FlightData) => ({
            _id: flight._id,
            status: flight.status,
            validated: flight.status === "confirmed", // Considerar "confirmed" como validado
            date: flight.date,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            pilot: {
              name: flight.pilot.name,
              lastname: flight.pilot.lastname,
            },
            instructor: flight.instructor
              ? {
                  name: flight.instructor.name,
                  lastname: flight.instructor.lastname,
                }
              : null,
            origin: flight.origin,
            destination: flight.destination,
            airplane: flight.airplane
              ? { registrationNumber: flight.airplane.registrationNumber }
              : null,
          })
        );

        setFlights(normalizedFlights);
      } catch (err) {
        console.error("Error fetching school flights:", err);
        setError("Error al obtener los vuelos de la escuela.");
      }
    };

    fetchFlights();
  }, []);

  const handleUpload = (file: File) => {
    console.log("Archivo subido:", file);
    // Aquí se manejará la lógica de carga de archivos
  };

  const links = [
    { path: "/admin/users", label: "Usuarios" },
    { path: "/admin/planes", label: "Aeronaves" },
    { path: "/admin/flights", label: "Vuelos" },
  ];

  return (
    <div>
      <Navbar title="Vuelos" links={links} logoutPath="/" />
      <div className="admin-flights-container">
        {error && <p className="text-danger">{error}</p>}
        <div className="flights-section">
          {/* Vuelos Pendientes */}
          <div className="flights-subsection">
            <h2>Pendientes</h2>
            <div className="flight-table-wrapper pending-flights">
              <FlightValidationTable
                flights={flights.filter(
                  (flight) => flight.status === "pending"
                )}
                csvData={[]} // Datos del CSV
              />
            </div>
          </div>

          {/* Vuelos Validados y Cancelados */}
          <div className="flights-subsection">
            <h2>Historial</h2>
            <div className="flight-history-table-wrapper">
              <FlightHistoryTable
                flights={flights
                  .filter(
                    (flight) =>
                      flight.status === "confirmed" ||
                      flight.status === "cancelled"
                  )
                  .map((flight) => ({
                    ...flight,
                    status: flight.status as "confirmed" | "cancelled", // Asegurar el tipo correcto
                  }))}
              />
            </div>
          </div>
        </div>
        <ValidateFlightsModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onUpload={handleUpload}
        />
      </div>
    </div>
  );
};

export default AdminFlights;
