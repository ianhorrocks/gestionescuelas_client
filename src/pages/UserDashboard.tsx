import React, { useEffect, useState } from "react";
import { getUserById } from "../services/userService";
import { getSchoolsForUser } from "../services/schoolService";
import Navbar from "../components/NavbarUser";

interface School {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  name: string;
}

const UserDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserAndSchools = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const decodedToken: { _id: string } = JSON.parse(
          atob(token.split(".")[1])
        );
        const userId = decodedToken._id;

        const userData = await getUserById(userId);
        setUser(userData);

        const schoolsData = await getSchoolsForUser();
        setSchools(schoolsData);
      } catch (err) {
        console.log("Fetch user or schools error:", err);
        setError("Inicie Sesion (Arreglar)");
      }
    };

    fetchUserAndSchools();
  }, []);

  const handleSchoolClick = (schoolId: string) => {
    localStorage.setItem("selectedSchoolId", schoolId);
    window.location.href = `/user/school/${schoolId}`;
  };

  return (
    <div className="dashboard-container container-dashboard">
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
      {user && (
        <div className="dashboard-content">
          <div className="kpis">
            <div className="kpi">
              <h3>Vuelos realizados</h3>
              <p>15</p>
            </div>
            <div className="kpi">
              <h3>Curso completado</h3>
              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: "75%" }}
                  aria-valuenow={75}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  75%
                </div>
              </div>
            </div>
          </div>
          <h2>Gestiona tus vuelos:</h2>
          {schools && schools.length > 0 ? (
            <div className="school-cards">
              {schools.map((school) => (
                <a
                  key={school._id}
                  onClick={() => handleSchoolClick(school._id)}
                  className="school-card"
                >
                  {school.name}
                </a>
              ))}
            </div>
          ) : (
            <p>No hay escuelas asociadas.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
