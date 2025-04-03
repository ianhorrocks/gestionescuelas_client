import React, { useEffect, useState } from "react";
import { fetchFlights, validateFlight } from "../services/flightService";
import ValidateFlightsModal from "../components/ValidateFlightsModal";
import Navbar from "../components/Navbar"; // Importar el nuevo Navbar
import { getLoggedUser } from "../services/auth";

const AdminFlights: React.FC = () => {
  interface Flight {
    _id: string;
    details: string;
    validated: boolean;
  }

  const [flights, setFlights] = useState<Flight[]>([]);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const loggedUser = await getLoggedUser();
        setUserName(`${loggedUser.name} ${loggedUser.lastname}`);
      } catch (err) {
        setError("Error al obtener la información del usuario logueado.");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const getFlights = async () => {
      try {
        const data = await fetchFlights();
        setFlights(data);
      } catch (err) {
        setError("Failed to fetch flights");
      }
    };

    getFlights();
  }, []);

  const handleValidate = async (id: string) => {
    try {
      await validateFlight(id);
      setFlights(
        flights.map((flight) =>
          flight._id === id ? { ...flight, validated: true } : flight
        )
      );
    } catch (err) {
      setError("Failed to validate flight");
    }
  };

  const handleUpload = (file: File) => {
    console.log("Uploaded file:", file);
    // Aquí se manejará la lógica de carga de archivos
  };

  const links = [
    { path: "/admin/users", label: "Usuarios" },
    { path: "/admin/planes", label: "Aeronaves" },
    { path: "/admin/flights", label: "Vuelos" },
  ];

  return (
    <div>
      <Navbar
        title="Gestión de Vuelos"
        userName={userName}
        links={links}
        logoutPath="/"
      />
      <div className="admin-flights-container">
        <h1>Gestión de Vuelos</h1>
        {error && <p className="text-danger">{error}</p>}
        <div className="flights-section">
          <div className="flights-subsection">
            <h2>Pendientes</h2>
            <div className="flights-list">
              {Array.isArray(flights) &&
                flights
                  .filter((flight) => !flight.validated)
                  .map((flight) => (
                    <div key={flight._id} className="flight-card">
                      <div className="flight-details">{flight.details}</div>
                      <button
                        onClick={() => handleValidate(flight._id)}
                        className="btn btn-success btn-sm validate-button"
                      >
                        Validar
                      </button>
                    </div>
                  ))}
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary mt-3"
            >
              Validar Vuelos
            </button>
          </div>
          <div className="flights-subsection">
            <h2>Validados</h2>
            <div className="flights-list">
              {Array.isArray(flights) &&
                flights
                  .filter((flight) => flight.validated)
                  .map((flight) => (
                    <div key={flight._id} className="flight-card">
                      <div className="flight-details">{flight.details}</div>
                    </div>
                  ))}
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
