import React, { useEffect, useState } from "react";
import { fetchUserFlights } from "../services/flightService";
import HamburgerMenu from "../components/HamburgerMenu";
import { getLoggedUser } from "../services/auth";
// import "../styles/UserFlights.css"; // Asegúrate de crear este archivo CSS

const UserFlights: React.FC = () => {
  interface Flight {
    _id: string;
    details: string;
  }

  const [flights, setFlights] = useState<Flight[]>([]);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const getFlights = async () => {
      try {
        const data = await fetchUserFlights();
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
  }, []);

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
