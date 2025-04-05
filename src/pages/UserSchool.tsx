import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSchoolsById } from "../services/schoolService";
import { getUserFlightsBySchool } from "../services/flightService";
import { fetchPlanes } from "../services/planeService";
import { fetchUsersByIds } from "../services/userService";
import Navbar from "../components/NavbarUser"; // Cambiar HamburgerMenu por Navbar
import AddFlightModal from "../components/AddFlightModal";
import { getLoggedUser } from "../services/auth";
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import Alert from "../components/Alert";
import FlightCard from "../components/FlightCard";

interface School {
  _id: string;
  name: string;
}

interface Flight {
  _id: string;
  details: string;
  status: string;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  instructor: string;
  pilot: string;
  airplane: string; // Added airplane property
  initialOdometer: number; // Added initialOdometer property
  finalOdometer: number; // Added finalOdometer property
}

const UserSchool: React.FC = () => {
  const { id: schoolId } = useParams<{ id: string }>();
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
    airplane: "",
    pilot: "",
    instructor: "",
    school: schoolId || "",
  });
  const [userName, setUserName] = useState("");
  const { message, showTemporaryMessage } = useTemporaryMessage();
  const [planes, setPlanes] = useState<Map<string, string>>(new Map());
  const [users, setUsers] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const fetchSchoolAndFlights = async () => {
      try {
        const token = localStorage.getItem("token");
        const payload = token ? atob(token.split(".")[1]) : null;

        if (payload) {
          console.log(payload);
        } else {
          console.error("Token is null or invalid");
          throw new Error("No token found");
        }

        const decodedToken: { _id: string } = JSON.parse(payload);
        const userId = decodedToken._id;

        if (schoolId) {
          console.log(`Fetching school by ID: ${schoolId}`);
          const schoolData = await getSchoolsById(schoolId);
          console.log("School data:", schoolData);
          setSchool(schoolData.data);

          console.log(
            `Fetching flights for user ID: ${userId} and school ID: ${schoolId}`
          );
          const flightsData = await getUserFlightsBySchool(userId, schoolId);
          console.log("Flights data:", flightsData);
          setFlights(flightsData.data || []);
        } else {
          setError("Invalid school ID");
        }
      } catch (err) {
        console.error("Failed to fetch school or flights:", err);
        setError("Failed to fetch school or flights");
      }
    };

    fetchSchoolAndFlights();
  }, [schoolId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getLoggedUser();
        setUserName(`${user.name} ${user.lastname}`);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        // Obtener los aviones de la escuela
        const planesData = await fetchPlanes(schoolId ?? null);
        const planesMap: Map<string, string> = new Map(
          planesData.map(
            (plane: { _id: string; registrationNumber: string }) => [
              plane._id,
              plane.registrationNumber,
            ]
          )
        );
        setPlanes(planesMap);

        // Obtener los IDs únicos de los usuarios (pilotos e instructores)
        const userIds = Array.from(
          new Set(
            flights.flatMap((flight) => [flight.pilot, flight.instructor])
          )
        );

        // Obtener los detalles de los usuarios
        const usersData = await fetchUsersByIds(userIds);
        const usersMap: Map<string, string> = new Map(
          usersData.map(
            (user: { _id: string; name: string; lastname: string }) => [
              user._id,
              `${user.name} .${user.lastname.charAt(0)}`,
            ]
          )
        );
        setUsers(usersMap);
      } catch (error) {
        console.error("Error fetching related data:", error);
      }
    };

    fetchRelatedData();
  }, [schoolId, flights]);

  const handleShowModal = () => {
    setNewFlight({
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
      airplane: "",
      pilot: "",
      instructor: "",
      school: schoolId || "",
    });
    setShowModal(true); // Abrir el modal
  };

  const handleCloseModal = () => setShowModal(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setNewFlight({ ...newFlight, [e.target.name]: e.target.value });
  };

  const handleFlightAdded = (successMessage: string) => {
    showTemporaryMessage("success", successMessage);
    const fetchFlights = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token is null or invalid");
        }
        const decodedToken: { _id: string } = JSON.parse(
          atob(token.split(".")[1])
        );
        const userId = decodedToken._id;

        if (schoolId) {
          const flightsData = await getUserFlightsBySchool(userId, schoolId);
          setFlights(flightsData.data || []);
        }
      } catch (err) {
        console.error("Error al refrescar los vuelos:", err);
        setError("Error al refrescar los vuelos");
      }
    };
    fetchFlights();
  };

  return (
    <div className="school-container">
      <Navbar
        title="Escuela (Pasar a vuelos)"
        userName={userName}
        links={[
          { path: "/user/dashboard", label: "Dashboard" },
          { path: "/user/profile", label: "Mi Perfil" },
          { path: "/user/flights", label: "Mis Vuelos" },
        ]}
        logoutPath="/user/login"
      />
      {message && <Alert message={message.message} type={message.type} />}
      {error && <p className="text-danger">{error}</p>}
      {school && (
        <div className="school-content">
          <h1 className="school-title">Mis vuelos en {school.name}</h1>
          <button className="add-button" onClick={handleShowModal}>
            +
          </button>
          <h2>Vuelos Pendientes:</h2>
          <ul className="list-group">
            {flights
              .filter((flight) => flight.status === "pending") // Filtrar por estado en el frontend
              .map((flight) => (
                <li key={flight._id} className="list-group-item">
                  <FlightCard
                    date={flight.date}
                    departureTime={new Date(
                      flight.departureTime
                    ).toLocaleTimeString()}
                    arrivalTime={new Date(
                      flight.arrivalTime
                    ).toLocaleTimeString()}
                    origin={flight.origin}
                    destination={flight.destination}
                    airplane={planes.get(flight.airplane) || "Desconocido"} // Obtener el nombre del avión
                    pilot={users.get(flight.pilot) || "Desconocido"} // Obtener el nombre del piloto
                    instructor={
                      flight.instructor
                        ? users.get(flight.instructor) || "Desconocido"
                        : "S/A" // Mostrar "S/A" si el instructor es null o no está asignado
                    }
                    status={flight.status as "pending" | "confirmed"}
                  />
                </li>
              ))}
          </ul>
          <h2>Vuelos Validados:</h2>
          <ul className="list-group">
            {flights
              .filter((flight) => flight.status === "confirmed")
              .map((flight) => (
                <li key={flight._id} className="list-group-item">
                  <FlightCard
                    date={flight.date}
                    departureTime={new Date(
                      flight.departureTime
                    ).toLocaleTimeString()}
                    arrivalTime={new Date(
                      flight.arrivalTime
                    ).toLocaleTimeString()}
                    origin={flight.origin}
                    destination={flight.destination}
                    airplane={planes.get(flight.airplane) || "Desconocido"} // Obtener el nombre del avión
                    pilot={users.get(flight.pilot) || "Desconocido"} // Obtener el nombre del piloto
                    instructor={users.get(flight.instructor) || "Desconocido"} // Obtener el nombre del instructor
                    status={flight.status as "pending" | "confirmed"}
                  />
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
        onSuccess={handleFlightAdded}
        initialFlight={newFlight} // Pass the required initialFlight prop
      />
    </div>
  );
};

export default UserSchool;
