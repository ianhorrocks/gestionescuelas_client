import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Importar useParams
import { fetchUserFlights } from "../services/flightService";
import HamburgerMenu from "../components/HamburgerMenu";
import { getLoggedUser } from "../services/auth";

const UserFlights: React.FC = () => {
  interface Flight {
    _id: string;
    details: string;
  }

  const { schoolId: urlSchoolId } = useParams<{ schoolId: string }>(); // Obtener schoolId desde la URL
  const [schoolId, setSchoolId] = useState<string | null>(urlSchoolId || null); // Definir estado para schoolId
  const [flights, setFlights] = useState<Flight[]>([]);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedSchoolId = localStorage.getItem("selectedSchoolId");
    if (!schoolId && storedSchoolId) {
      console.log("Usando schoolId del localStorage:", storedSchoolId); // Log para verificar
      setSchoolId(storedSchoolId); // Usar el schoolId del localStorage si no está en la URL
    }
  }, [schoolId]);

  useEffect(() => {
    const getFlights = async () => {
      try {
        if (!schoolId) {
          throw new Error("School ID is missing");
        }

        const data = await fetchUserFlights(schoolId); // Pasar schoolId al servicio
        setFlights(data);
      } catch (err) {
        setError("Failed to fetch flights");
      }
    };

    const fetchUser = async () => {
      try {
        const user = await getLoggedUser();
        setUserName(`${user.name} ${user.lastname}`);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    getFlights();
    fetchUser();
  }, [schoolId]);

  return (
    <div className="flights-container">
      <HamburgerMenu userName={userName} />
      <div className="flights-content">
        <h1>Mis Vuelos</h1>
        {error && <p className="text-danger">{error}</p>}
        <ul className="list-group">
          {flights.map((flight) => (
            <li key={flight._id} className="list-group-item">
              {flight.details}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserFlights;
