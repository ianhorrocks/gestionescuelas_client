import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSchoolsById } from "../services/schoolService";
import { getUserFlightsBySchool } from "../services/flightService";
import HamburgerMenu from "../components/HamburgerMenu";
import AddFlightModal from "../components/AddFlightModal";
import { getLoggedUser } from "../services/auth";
//import "../styles/UserSchool.css";

interface School {
  _id: string;
  name: string;
}

interface Flight {
  _id: string;
  details: string;
  status: string;
}

const UserSchool: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newFlight, setNewFlight] = useState({
    date: "",
    initialOdometer: "",
    finalOdometer: "",
    origin: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    landings: "",
    oil: "",
    charge: "",
  });
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchSchoolAndFlights = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const decodedToken: { _id: string } = JSON.parse(
          atob(token.split(".")[1])
        );
        const userId = decodedToken._id;

        if (id) {
          console.log(`Fetching school by ID: ${id}`);
          const schoolData = await getSchoolsById(id);
          console.log("School data:", schoolData);
          setSchool(schoolData.data); // Asegúrate de que schoolData es un objeto con la propiedad data

          console.log(
            `Fetching flights for user ID: ${userId} and school ID: ${id}`
          );
          const flightsData = await getUserFlightsBySchool(userId, id);
          console.log("Flights data:", flightsData);
          setFlights(flightsData.data || []); // Asegúrate de que flightsData es un array
        } else {
          setError("Invalid school ID");
        }
      } catch (err) {
        console.error("Failed to fetch school or flights:", err);
        setError("Failed to fetch school or flights");
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

    fetchSchoolAndFlights();
    fetchUser();
  }, [id]);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFlight({ ...newFlight, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí deberías agregar la lógica para enviar el nuevo vuelo al servidor
    handleCloseModal();
  };

  return (
    <div className="school-container">
      <HamburgerMenu userName={userName} />
      {error && <p className="text-danger">{error}</p>}
      {school && (
        <div className="school-content">
          <h1 className="school-title">Mis vuelos en {school.name}</h1>
          <button className="add-user-button" onClick={handleShowModal}>
            +
          </button>
          <h2>Vuelos Pendientes:</h2>
          <ul className="list-group">
            {flights
              .filter((flight) => flight.status === "pending")
              .map((flight) => (
                <li key={flight._id} className="list-group-item">
                  {flight.details}
                </li>
              ))}
          </ul>
          <h2>Vuelos Validados:</h2>
          <ul className="list-group">
            {flights
              .filter((flight) => flight.status === "confirmed")
              .map((flight) => (
                <li key={flight._id} className="list-group-item">
                  {flight.details}
                </li>
              ))}
          </ul>
        </div>
      )}

      <AddFlightModal
        show={showModal}
        onClose={handleCloseModal}
        newFlight={newFlight}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default UserSchool;
