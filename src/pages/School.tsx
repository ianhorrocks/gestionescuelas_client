import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSchoolsById } from "../services/schoolService";

interface School {
  _id: string;
  name: string;
}

const School: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        if (id) {
          const schoolData = await getSchoolsById(id);
          setSchool(schoolData);
        } else {
          setError("Invalid school ID");
        }
      } catch (err) {
        console.log("Fetch school error:", err);
        setError("Failed to fetch school");
      }
    };

    fetchSchool();
  }, [id]);

  return (
    <div className="container">
      {error && <p className="text-danger">{error}</p>}
      {school && (
        <div>
          <h1>Escuela {school.name}</h1>
          <div className="menu">
            <ul className="list-group">
              <li className="list-group-item">
                <a href={`/schools/${id}/flights`}>Vuelos</a>
              </li>
              <li className="list-group-item">
                <a href={`/schools/${id}/payments`}>Pagos</a>
              </li>
              <li className="list-group-item">
                <a href={`/schools/${id}/settings`}>Configuración de Usuario</a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default School;
