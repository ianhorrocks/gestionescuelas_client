import React, { useEffect, useState } from "react";
import { getUserById } from "../services/userService";
import { getSchoolsForUser } from "../services/schoolService";
import HamburgerMenu from "../components/HamburgerMenu";
import { getLoggedUser } from "../services/auth";
import "../styles/UserDashboard.css"; // Asegúrate de crear este archivo CSS

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
        setError("Failed to fetch user or schools");
      }
    };

    fetchUserAndSchools();
  }, []);

  return (
    <div className="dashboard-container">
      <HamburgerMenu userName={userName} />
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
            <ul className="list-group">
              {schools.map((school) => (
                <li key={school._id} className="list-group-item">
                  <a href={`/user/school/${school._id}`}>{school.name}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay escuelas asociadas.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
