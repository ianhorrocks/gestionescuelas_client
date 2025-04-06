import React, { useEffect, useState } from "react";
import { getAllUserFlights } from "../services/flightService";
import Navbar from "../components/NavbarUser";
import AddFlightModal from "../components/AddFlightModal";
import { getLoggedUser } from "../services/auth";
import FlightCard from "../components/FlightCard";

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
  status: "pending" | "confirmed";
}

const UserFlights: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [schools, setSchools] = useState<{ _id: string; name: string }[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(""); // Fecha de inicio
  const [endDate, setEndDate] = useState<string>(""); // Fecha de fin
  const [error, setError] = useState("");

  // Estado para el modal
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
    school: "",
  });

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const user = await getLoggedUser();

        const flightsData = await getAllUserFlights(user._id);
        setFlights(flightsData.data);
        setFilteredFlights(flightsData.data);

        // Extraer las escuelas únicas de los vuelos
        const uniqueSchools: { _id: string; name: string }[] = Array.from(
          new Map<string, { _id: string; name: string }>(
            flightsData.data.map((flight: Flight) => [
              flight.school._id,
              flight.school,
            ])
          ).values()
        );
        console.log("Escuelas únicas:", uniqueSchools);
        setSchools(uniqueSchools);
      } catch (err) {
        console.error("Failed to fetch flightsss:", err);
        setError("Failed to fetch flights");
      }
    };

    fetchFlights();
  }, []);

  const handleSchoolFilter = (schoolId: string | null) => {
    setSelectedSchool(schoolId);
    filterFlights(schoolId, startDate, endDate);
  };

  const handleDateFilter = () => {
    filterFlights(selectedSchool, startDate, endDate);
  };

  const filterFlights = (
    schoolId: string | null,
    startDate: string,
    endDate: string
  ) => {
    let filtered = flights;

    if (schoolId) {
      filtered = filtered.filter((flight) => flight.school._id === schoolId);
    }

    if (startDate) {
      filtered = filtered.filter(
        (flight) => new Date(flight.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (flight) => new Date(flight.date) <= new Date(endDate)
      );
    }

    setFilteredFlights(filtered);
  };

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
      school: selectedSchool || "", // Asociar el vuelo a la escuela seleccionada
    });
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleFlightAdded = async () => {
    setShowModal(false);
    setError(""); // Limpiar errores
    try {
      const user = await getLoggedUser();
      const flightsData = await getAllUserFlights(user._id);
      setFlights(flightsData.data);
      setFilteredFlights(flightsData.data);
    } catch (err) {
      console.error("Error al refrescar los vuelos:", err);
      setError("Error al refrescar los vuelos");
    }
  };

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
        <div className="filter-panel">
          <label htmlFor="schoolFilter">Filtrar por escuela:</label>
          <select
            id="schoolFilter"
            value={selectedSchool || ""}
            onChange={(e) => handleSchoolFilter(e.target.value || null)}
          >
            <option value="">Todas las escuelas</option>
            {schools.map((school) => (
              <option key={school._id} value={school._id}>
                {school.name}
              </option>
            ))}
          </select>
          <div className="date-filters">
            <label htmlFor="startDate">Desde:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label htmlFor="endDate">Hasta:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button onClick={handleDateFilter}>Aplicar</button>
          </div>
        </div>
        <button className="add-button" onClick={handleShowModal}>
          +
        </button>
        <div className="flight-cards">
          {filteredFlights.map((flight) => (
            <FlightCard
              key={flight._id}
              date={flight.date}
              departureTime={new Date(
                flight.departureTime
              ).toLocaleTimeString()}
              arrivalTime={new Date(flight.arrivalTime).toLocaleTimeString()}
              origin={flight.origin}
              destination={flight.destination}
              airplane={
                flight.airplane
                  ? `${flight.airplane.registrationNumber} `
                  : "Desconocido"
              }
              pilot={`${flight.pilot.name} ${flight.pilot.lastname}`}
              instructor={
                flight.instructor
                  ? `${flight.instructor.name} ${flight.instructor.lastname}`
                  : "S/A"
              }
              status={flight.status}
            />
          ))}
        </div>
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
