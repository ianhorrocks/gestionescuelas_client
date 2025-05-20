import React, { useEffect, useState } from "react";
import { getAllUserFlights } from "../services/flightService";
import { getSchoolsForUser } from "../services/schoolService";
import Navbar from "../components/NavbarUser";
import PlaneLoader from "../components/PlaneLoader";
import { Flight, School } from "../types/types";
import defaultSchoolImage from "../assets/images/Logo-School-Profile.png";
import FlightSummaryCard from "../components/FlightSummaryCard";
import FlightTimeline from "../components/FlightTimeline";
import FlightHoursCard from "../components/FlightHoursCard";

const UserDashboard: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const decodedToken: { _id: string } = JSON.parse(
          atob(token.split(".")[1])
        );
        const userId = decodedToken._id;

        const flightsData = await getAllUserFlights(userId);
        setFlights(flightsData);

        const schoolsData = await getSchoolsForUser();
        setSchools(schoolsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos. Por favor, intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusCounts = (flights: Flight[]) => {
    let confirmed = 0,
      pending = 0,
      cancelled = 0;

    flights.forEach((flight) => {
      if (flight.status === "confirmed") confirmed++;
      else if (flight.status === "pending") pending++;
      else if (flight.status === "cancelled") cancelled++;
    });

    return { confirmed, pending, cancelled };
  };

  const { confirmed, pending } = getStatusCounts(flights);

  const getFlightsByDate = (flights: Flight[]) => {
    const map = new Map<string, number>();

    flights.forEach((flight) => {
      const date = new Date(flight.date).toLocaleDateString("es-AR"); // formato DD/MM/YYYY
      map.set(date, (map.get(date) || 0) + 1);
    });

    // Convertir a array ordenado por fecha ascendente
    return Array.from(map.entries())
      .map(([date, flights]) => ({ date, flights }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getTotalFlightHours = (flights: Flight[]): number => {
    return flights.reduce((acc, flight) => {
      const time = parseFloat(flight.totalFlightTime || "0");
      return acc + (isNaN(time) ? 0 : time);
    }, 0);
  };

  return (
    <div className="dashboard-container">
      <Navbar
        title="Dashboard"
        links={[
          { path: "/user/dashboard", label: "Dashboard" },
          { path: "/user/profile", label: "Mi Perfil" },
          { path: "/user/flights", label: "Mis Vuelos" },
        ]}
        logoutPath="/"
      />

      {error && <p className="dashboard-error">{error}</p>}

      {loading ? (
        <PlaneLoader />
      ) : (
        <div className="dashboard-content">
          {/* KPIs */}
          <FlightSummaryCard
            total={flights.length}
            confirmed={confirmed}
            pending={pending}
          />

          <FlightHoursCard
            totalHours={getTotalFlightHours(flights)}
            flightData={getFlightsByDate(flights)}
          />

          {/* Últimos vuelos */}
          <div className="dashboard-timeline">
            <h2 className="dashboard-section-title">Últimos vuelos</h2>
            <FlightTimeline
              flights={[...flights]
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .slice(0, 4)}
            />
          </div>

          {/* Escuelas */}
          <div className="dashboard-schools">
            <h2 className="dashboard-section-title">Mis Escuelas</h2>
            <div className="school-cards">
              {schools.map((school) => (
                <div key={school._id} className="school-card">
                  <img
                    src={school.planes[0]?.photoUrl || defaultSchoolImage}
                    alt={school.name}
                    className="school-image"
                  />
                  <div className="school-info">
                    <h4>{school.name}</h4>
                    <p>{school.address || "Ubicación no disponible"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
