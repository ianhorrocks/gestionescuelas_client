import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSchoolsById } from "../services/schoolService";
import { getUserFlightsBySchool } from "../services/flightService";
import { fetchPlanes } from "../services/planeService";
import { fetchUsersFromSchool } from "../services/userService";
import Navbar from "../components/NavbarUser";
import AddFlightModal from "../components/AddFlightModal";
import FlightTable from "../components/FlightTable";
import { getLoggedUser } from "../services/auth";

interface School {
  _id: string;
  name: string;
}

interface Flight {
  _id: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  status: "pending" | "confirmed" | "cancelled";
  airplane?: string;
  pilot: string;
  instructor: string;
}

interface User {
  _id: string;
  name: string;
  lastname: string;
}

interface Plane {
  _id: string;
  registrationNumber: string;
}

const UserSchool: React.FC = () => {
  const { id: schoolId } = useParams<{ id: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [planes, setPlanes] = useState<Plane[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "confirmed" | "cancelled"
  >("all");
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

  useEffect(() => {
    const fetchSchoolAndFlights = async () => {
      try {
        if (schoolId) {
          const schoolData = await getSchoolsById(schoolId);
          setSchool(schoolData.data);

          const user = await getLoggedUser();
          const flightsData = await getUserFlightsBySchool(user._id, schoolId);
          setFlights(flightsData.data || []);

          // Cargar usuarios y aviones asociados a la escuela
          const usersData = await fetchUsersFromSchool(schoolId);
          setUsers(usersData);

          const planesData = await fetchPlanes(schoolId);
          setPlanes(planesData);
        } else {
          throw new Error("Invalid school ID");
        }
      } catch (err) {
        console.error("Failed to fetch school or flights:", err);
      }
    };

    fetchSchoolAndFlights();
  }, [schoolId]);

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
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleFlightAdded = async () => {
    setShowModal(false);
    try {
      const user = await getLoggedUser();
      const flightsData = await getUserFlightsBySchool(user._id, schoolId!);
      setFlights(flightsData.data || []);
    } catch (err) {
      console.error("Error al refrescar los vuelos:", err);
    }
  };

  const filteredByStatus = flights.filter((flight) => {
    if (statusFilter === "all") return true;
    return flight.status === statusFilter;
  });

  return (
    <div className="school-container">
      <Navbar
        title={`Mis vuelos en ${school?.name || "Escuela"}`}
        links={[
          { path: "/user/dashboard", label: "Dashboard" },
          { path: "/user/profile", label: "Mi Perfil" },
          { path: "/user/flights", label: "Mis Vuelos" },
        ]}
        logoutPath="/user/login"
      />

      <div className="school-content">
        <button className="add-button" onClick={handleShowModal}>
          +
        </button>

        <FlightTable
          flights={filteredByStatus.map((flight) => ({
            _id: flight._id,
            date: flight.date,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            pilot: `${
              users.find((user) => user._id === flight.pilot)?.name ||
              "Desconocido"
            } ${
              users.find((user) => user._id === flight.pilot)?.lastname || ""
            }`,
            instructor: `${
              users.find((user) => user._id === flight.instructor)?.name ||
              "S/A"
            } ${
              users.find((user) => user._id === flight.instructor)?.lastname ||
              ""
            }`,
            origin: flight.origin,
            destination: flight.destination,
            status: flight.status,
            airplane:
              planes.find((plane) => plane._id === flight.airplane)
                ?.registrationNumber || "N/A",
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
            pilot: flight.pilot,
            instructor: flight.instructor,
            origin: flight.origin,
            destination: flight.destination,
            status: flight.status,
            airplane: flight.airplane || "N/A",
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

export default UserSchool;
