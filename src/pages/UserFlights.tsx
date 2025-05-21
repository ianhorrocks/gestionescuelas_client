import React, { useRef, useEffect, useState } from "react";
import { getAllUserFlights } from "../services/flightService";
import Navbar from "../components/NavbarUser";
import AddFlightModal from "../components/AddFlightModal";
import FlightTable from "../components/FlightTable";
import { getLoggedUser } from "../services/auth";
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import { Flight, SimplifiedFlight } from "../types/types";
import PlaneLoader from "../components/PlaneLoader";
import { FaArrowUp } from "react-icons/fa";

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
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null); // 👈

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const node = scrollRef.current;
      if (!node) return;

      const handleScroll = () => {
        setShowScrollTop(node.scrollTop > 0);
      };

      node.addEventListener("scroll", handleScroll);
      handleScroll(); // fuerza evaluación inicial

      // Limpieza
      return () => {
        node.removeEventListener("scroll", handleScroll);
      };
    });

    // Observa cuando se monta el contenido
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchFlights = async () => {
      try {
        const user = await getLoggedUser();
        const flightsData = await getAllUserFlights(user._id);
        setFlights(flightsData);
      } catch (err) {
        console.error("Failed to fetch flights:", err);
        setError("Failed to fetch flights");
      } finally {
        setLoading(false);
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
      setFlights(flightsData);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error al refrescar los vuelos:", err);
      setError("Error al refrescar los vuelos");
    }
  };

  return (
    <div className="user-flights-container">
      <Navbar
        title="Mis Vuelos"
        links={[
          { path: "/user/dashboard", label: "Dashboard" },
          { path: "/user/profile", label: "Mi Perfil" },
          { path: "/user/flights", label: "Mis Vuelos" },
        ]}
        logoutPath="/"
      />

      {error && <p className="text-danger">{error}</p>}
      {message && (
        <p className={`alert alert-${message.type}`}>{message.message}</p>
      )}

      {loading ? (
        <PlaneLoader />
      ) : (
        <div className="user-flights-content">
          <button className="add-button" onClick={handleShowModal}>
            +
          </button>

          <FlightTable
            flights={flights.map(
              (flight): SimplifiedFlight => ({
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
                school: flight.school?.name || "N/A",
              })
            )}
            selectedStatus={statusFilter}
            onFilterChange={(status: string) =>
              setStatusFilter(
                status as "pending" | "confirmed" | "cancelled" | "all"
              )
            }
            allFlights={flights.map(
              (flight): SimplifiedFlight => ({
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
                school: flight.school?.name || "N/A",
              })
            )}
            scrollRef={scrollRef}
          />
        </div>
      )}

      <AddFlightModal
        show={showModal}
        onClose={handleCloseModal}
        onSuccess={handleFlightAdded}
        showTemporaryMessage={showTemporaryMessage}
      />

      {!loading && (
        <button
          className={`scroll-top-button ${showScrollTop ? "visible" : ""}`}
          onClick={() =>
            scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
          }
          aria-label="Subir arriba"
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
};

export default UserFlights;
