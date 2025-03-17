import React, { useEffect, useState } from "react";
import { fetchFlights, validateFlight } from "../services/flightService";
import AdminHamburgerMenu from "../components/AdminHamburgerMenu";
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

  return (
    <div>
      <AdminHamburgerMenu userName={userName} />
      <h1>Gestión de Vuelos</h1>
      {error && <p className="text-danger">{error}</p>}
      <ul className="list-group">
        {flights.map((flight) => (
          <li key={flight._id} className="list-group-item">
            {flight.details}
            {!flight.validated && (
              <button onClick={() => handleValidate(flight._id)}>
                Validar
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminFlights;
