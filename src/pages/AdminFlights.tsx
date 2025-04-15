import React, { useEffect, useState } from "react";
import { getAllSchoolFlights } from "../services/flightService";
import { Flight as FlightBase } from "../types/types";
import ValidateFlightsModal from "../components/ValidateFlightsModal";
import Navbar from "../components/NavbarAdmin";
import FlightValidationTable from "../components/FlightValidationTable";
import FlightHistoryTable from "../components/FlightHistoryTable";
import { getLoggedUser } from "../services/auth";
import PlaneLoader from "../components/PlaneLoader";

type Flight = FlightBase & { validated: boolean };

const AdminFlights: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const loggedUser = await getLoggedUser();
        const schoolId = loggedUser.assignedSchools[0]?.school?._id;
        if (!schoolId) {
          setError("No se encontró una escuela asignada.");
          setLoading(false);
          return;
        }

        const flightsData = await getAllSchoolFlights(schoolId);
        console.log("Vuelos obtenidos:", flightsData); // ya es un array

        const normalizedFlights = flightsData.map((flight) => ({
          ...flight,
          validated: flight.status === "confirmed",
        }));

        setFlights(normalizedFlights);
      } catch (err) {
        console.error("Error fetching school flights:", err);
        setError("Error al obtener los vuelos de la escuela.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, []);

  const links = [
    { path: "/admin/users", label: "Usuarios" },
    { path: "/admin/planes", label: "Aeronaves" },
    { path: "/admin/flights", label: "Vuelos" },
  ];

  return (
    <div>
      <Navbar title="Vuelos" links={links} logoutPath="/" />
      <div className="admin-flights-container">
        {loading ? (
          <PlaneLoader />
        ) : (
          <>
            {error && <p className="text-danger">{error}</p>}
            <div className="flights-section">
              <div className="flights-subsection">
                <h2>Pendientes</h2>
                <div className="flight-table-wrapper pending-flights">
                  <FlightValidationTable
                    flights={flights.filter((f) => f.status === "pending")}
                    csvData={[]}
                  />
                </div>
              </div>

              <div className="flights-subsection">
                <h2>Historial</h2>
                <div className="flight-history-table-wrapper">
                  <FlightHistoryTable
                    flights={flights
                      .filter(
                        (f) =>
                          f.status === "confirmed" || f.status === "cancelled"
                      )
                      .map(
                        (f) =>
                          f as Omit<Flight, "status"> & {
                            status: "confirmed" | "cancelled";
                          }
                      )}
                  />
                </div>
              </div>
            </div>

            <ValidateFlightsModal
              show={showModal}
              onHide={() => setShowModal(false)}
              onUpload={(file) => console.log("Archivo subido:", file)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminFlights;
