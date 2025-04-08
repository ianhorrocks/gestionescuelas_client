import React, { useEffect, useState } from "react";
import { getAllUserFlights } from "../services/flightService";
import Navbar from "../components/NavbarUser";
import AddFlightModal from "../components/AddFlightModal";
import { getLoggedUser } from "../services/auth";
import FlightTable from "../components/FlightTable";

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
}

const UserFlights: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "confirmed" | "cancelled"
  >("all");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

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
    school: "",
  });

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const user = await getLoggedUser();
        const flightsData = await getAllUserFlights(user._id);
        setFlights(flightsData.data);
      } catch (err) {
        console.error("Failed to fetch flights:", err);
        setError("Failed to fetch flights");
      }
    };

    fetchFlights();
  }, []);

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
      school: "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleFlightAdded = async () => {
    setShowModal(false);
    setError("");
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
          }))}
        />
      </div>

      <AddFlightModal
        show={showModal}
        onClose={handleCloseModal}
        newFlight={newFlight}
        handleChange={(e) =>
          setNewFlight({ ...newFlight, [e.target.name]: e.target.value })
        }
        onSuccess={handleFlightAdded}
      />
    </div>
  );
};

export default UserFlights;
