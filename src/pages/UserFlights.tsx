import React, { useEffect, useState } from "react";
import { getAllUserFlights } from "../services/flightService";
import Navbar from "../components/NavbarUser";
import AddFlightModal from "../components/AddFlightModal";
import FlightTable from "../components/FlightTable";
import { getLoggedUser } from "../services/auth";
import useTemporaryMessage from "../hooks/useTemporaryMessage";

interface Flight {
  _id: string;
  details: string;
  school: { _id: string; name: string };
  airplane: { registrationNumber: string; brand: string; model: string } | null;
  pilot: { name: string; lastname: string };
  instructor: { name: string; lastname: string | null };
  date: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  status: "pending" | "confirmed" | "cancelled";
  totalFlightTime?: string;
}

const convertToDecimalHours = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours + minutes / 60).toFixed(2); // Convertir a formato centesimal
};

const UserFlights: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "confirmed" | "cancelled"
  >("all");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const { message, showTemporaryMessage } = useTemporaryMessage();

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const user = await getLoggedUser();
        console.log("Userrrrrrr:", user); // Loguear el ID del usuario
        const flightsData = await getAllUserFlights(user._id);
        setFlights(flightsData.data);
      } catch (err) {
        console.error("Failed to fetch flights:", err);
        setError("Failed to fetch flights");
      }
    };

    fetchFlights();
  }, []);

  const handleShowModal = () => setShowModal(true);

  const handleCloseModal = () => setShowModal(false);

  const handleFlightAdded = async (msg?: string) => {
    setShowModal(false);
    setError("");
    if (msg) showTemporaryMessage("success", msg);

    try {
      const user = await getLoggedUser();
      const flightsData = await getAllUserFlights(user._id);
      setFlights(flightsData.data);
    } catch (err) {
      console.error("Error al refrescar los vuelos:", err);
      setError("Error al refrescar los vuelos");
    }
  };

  const filteredByStatus = flights.filter((flight) => {
    if (statusFilter === "all") return true;
    return flight.status === statusFilter;
  });

  return (
    <div className="flights-container">
      <Navbar
        title="Mis Vuelos"
        links={[
          { path: "/user/dashboard", label: "Dashboard" },
          { path: "/user/profile", label: "Mi Perfil" },
          { path: "/user/flights", label: "Mis Vuelos" },
        ]}
        logoutPath="/user/login"
      />

      <div className="flights-content">
        {error && <p className="text-danger">{error}</p>}
        {message && (
          <p className={`alert alert-${message.type}`}>{message.message}</p>
        )}

        <button className="add-button" onClick={handleShowModal}>
          +
        </button>

        <FlightTable
          flights={filteredByStatus.map((flight) => ({
            _id: flight._id,
            date: flight.date,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            pilot: `${flight.pilot.name} ${flight.pilot.lastname}`,
            instructor: flight.instructor
              ? `${flight.instructor.name} ${flight.instructor.lastname}`
              : "S/A",
            origin: flight.origin,
            destination: flight.destination,
            status: flight.status,
            airplane: flight.airplane
              ? `${flight.airplane.registrationNumber}`
              : "N/A",
            totalFlightTime: flight.totalFlightTime
              ? convertToDecimalHours(flight.totalFlightTime)
              : "N/A",
          }))}
          selectedStatus={statusFilter}
          onFilterChange={(status: string) =>
            setStatusFilter(
              status as "pending" | "confirmed" | "cancelled" | "all"
            )
          }
          allFlights={flights.map((flight) => ({
            _id: flight._id,
            date: flight.date,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            pilot: `${flight.pilot.name} ${flight.pilot.lastname}`,
            instructor: flight.instructor
              ? `${flight.instructor.name} ${flight.instructor.lastname}`
              : "S/A",
            origin: flight.origin,
            destination: flight.destination,
            status: flight.status,
            airplane: flight.airplane
              ? `${flight.airplane.registrationNumber}`
              : "N/A",
            totalFlightTime: flight.totalFlightTime
              ? convertToDecimalHours(flight.totalFlightTime)
              : "N/A",
          }))}
        />
      </div>

      <AddFlightModal
        show={showModal}
        onClose={handleCloseModal}
        onSuccess={handleFlightAdded}
        showTemporaryMessage={showTemporaryMessage}
      />
    </div>
  );
};

export default UserFlights;
