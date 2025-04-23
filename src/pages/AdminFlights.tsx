// pages/AdminFlights.tsx

import React, { useEffect, useState } from "react";
import { getAllSchoolFlights } from "../services/flightService";
import { Flight as FlightBase } from "../types/types";
import ValidateFlightsModal from "../components/ValidateFlightsModal";
import Navbar from "../components/NavbarAdmin";
import FlightValidationTable from "../components/FlightValidationTable";
import FlightHistoryTable from "../components/FlightHistoryTable";
import { getLoggedUser } from "../services/auth";
import PlaneLoader from "../components/PlaneLoader";
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import Alert from "../components/Alert";

type Flight = FlightBase & { validated: boolean };

const AdminFlights: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  const { message, showTemporaryMessage } = useTemporaryMessage();

  const fetchFlights = async (schoolId: string) => {
    try {
      const flightsData = await getAllSchoolFlights(schoolId);
      const normalizedFlights = flightsData.map((flight) => ({
        ...flight,
        validated: flight.status === "confirmed",
      }));
      setFlights(normalizedFlights);
    } catch (err) {
      console.error("Error fetching school flights:", err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const loggedUser = await getLoggedUser();
        const schoolId = loggedUser.assignedSchools[0]?.school?._id;
        if (!schoolId) {
          console.error("No school ID found for the logged user.");
          setLoading(false);
          return;
        }
        setSchoolId(schoolId);
        await fetchFlights(schoolId);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
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
            {message && <Alert type={message.type} message={message.message} />}

            <div className="flights-section">
              <div className="flights-subsection">
                <div className="align-items-center">
                  <h2>Pendientes</h2>
                </div>
                <div className="flight-table-wrapper pending-flights">
                  <FlightValidationTable
                    flights={flights.filter((f) => f.status === "pending")}
                  />
                </div>
                <div className="text-end mt-3">
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                  >
                    Validar vuelos con CSV
                  </button>
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

            {schoolId && (
              <ValidateFlightsModal
                show={showModal}
                onHide={() => setShowModal(false)}
                schoolId={schoolId}
                onResult={async () => {
                  await fetchFlights(schoolId);
                  showTemporaryMessage("success", "Validación ejecutada");
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminFlights;
