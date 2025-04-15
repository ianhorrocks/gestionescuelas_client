import React, { useEffect, useState } from "react";
import { User, School } from "../types/types"; // id y name
import { getUserById } from "../services/userService";
import { getSchoolsForUser } from "../services/schoolService";
import Navbar from "../components/NavbarUser";

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
        console.log("User data:", userData); // 👈
        setUser(userData);

        const schoolsData = await getSchoolsForUser();
        console.log("Schools data:", schoolsData);
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
