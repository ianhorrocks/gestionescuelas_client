import React, { useEffect, useState } from "react";
import { getAllUserFlights } from "../services/flightService";
import { getSchoolsForUser } from "../services/schoolService";
import Navbar from "../components/NavbarUser";
import PlaneLoader from "../components/PlaneLoader";
import { Chart } from "react-google-charts";
import { Flight, School, FlightEvolution } from "../types/types";

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

        // Fetch flights
        const flightsData = await getAllUserFlights(userId);
        setFlights(flightsData);

        // Fetch schools
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

  // Procesar datos para métricas
  const flightsCount = flights.length;

  const flightEvolution: FlightEvolution[] = flights.reduce(
    (acc: FlightEvolution[], flight) => {
      const month = new Date(flight.date).toLocaleString("es-ES", {
        month: "long",
      });
      const existingMonth = acc.find((item) => item.month === month);
      if (existingMonth) {
        existingMonth.count++;
      } else {
        acc.push({ month, count: 1 });
      }
      return acc;
    },
    []
  );

  // Ordenar meses en el gráfico
  const sortedFlightEvolution = [
    ["Mes", "Vuelos"],
    ...flightEvolution.map((item) => [item.month, item.count]),
  ];

  return (
    <div className="dashboard-container">
      <Navbar
        title="Dashboard"
        links={[
          { path: "/user/dashboard", label: "Dashboard" },
          { path: "/user/profile", label: "Mi Perfil" },
          { path: "/user/flights", label: "Mis Vuelos" },
        ]}
        logoutPath="/user/login"
      />

      {error && <p className="text-danger">{error}</p>}

      {loading ? (
        <PlaneLoader />
      ) : (
        <div className="dashboard-content">
          {/* Métricas principales */}
          <div className="kpis">
            <div className="kpi">
              <h3>Vuelos realizados</h3>
              <p>{flightsCount}</p>
            </div>
            <div className="kpi">
              <h3>Evolución de vuelos</h3>
              <Chart
                chartType="LineChart"
                width="100%"
                height="200px"
                data={sortedFlightEvolution}
                options={{
                  hAxis: { title: "Mes" },
                  vAxis: { title: "Vuelos" },
                  legend: "none",
                }}
              />
            </div>
          </div>

          {/* Escuelas asignadas */}
          <div className="school-cards">
            {schools.map((school) => (
              <div key={school._id} className="school-card">
                <img
                  src={school.planes[0]?.photoUrl || "/default-school.jpg"}
                  alt={school.name}
                  className="school-image"
                />
                <h4>{school.name}</h4>
                <p>{school.address || "Ubicación no disponible"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
