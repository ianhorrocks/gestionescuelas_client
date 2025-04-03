import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Importar useParams
import { fetchUserFlights } from "../services/flightService";
import Navbar from "../components/Navbar"; // Importar el componente Navbar
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
      <Navbar
        title="Vuelos"
        userName={userName}
        links={[
          { path: "/user/dashboard", label: "Dashboard" },
          { path: "/user/profile", label: "Mi Perfil" },
          { path: "/user/flights", label: "Mis Vuelos" },
        ]}
        logoutPath="/user/login"
      />
      <div className="flights-content">
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
