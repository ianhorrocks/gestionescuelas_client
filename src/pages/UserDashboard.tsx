import React, { useEffect, useState } from "react";
import { getUserById } from "../services/userService";
import { getSchoolsForUser } from "../services/schoolService";
import Navbar from "../components/Navbar"; // Cambiar HamburgerMenu por Navbar
import { getLoggedUser } from "../services/auth";
// import "../styles/UserDashboard.css"; // Asegúrate de crear este archivo CSS

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
  const [userName, setUserName] = useState("");

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
        console.log("User data:", userData); // Log para verificar los datos del usuario
        setUser(userData);

        const schoolsData = await getSchoolsForUser();
        console.log("Schools data:", schoolsData); // Log para verificar los datos de las escuelas
        setSchools(schoolsData);

        const user = await getLoggedUser();
        setUserName(`${user.name} ${user.lastname}`);
      } catch (err) {
        console.log("Fetch user or schools error:", err);
        setError("Inicie Sesion (Arreglar)");
      }
    };

    fetchUserAndSchools();
  }, []);

  const handleSchoolClick = (schoolId: string) => {
    console.log("Guardando schoolId en localStorage:", schoolId);
    localStorage.setItem("selectedSchoolId", schoolId); // Guardar schoolId en localStorage
    window.location.href = `/user/school/${schoolId}`; // Navegar a la página de vuelos
  };

  return (
    <div className="dashboard-container">
      <Navbar
        title="Dashboard"
        userName={userName}
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
          <h1>¡Hola {user.name}!</h1>
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
                  onClick={() => handleSchoolClick(school._id)} // Usar la función para manejar el click
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
