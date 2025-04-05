import React, { useEffect, useState } from "react";
import Navbar from "../components/NavbarAdmin";
import AddPlaneModal from "../components/AddPlaneModal";
import PlaneItem from "../components/PlaneItem";
import {
  fetchPlanes,
  createPlane,
  deletePlane,
  updatePlanePhoto,
} from "../services/planeService";
import { getLoggedUser } from "../services/auth";
import defaultPlane from "../assets/images/default-plane.jpg";

interface Plane {
  _id: string;
  registrationNumber: string;
  country: string;
  brand: string;
  model: string;
  totalHours: number;
  lastMaintenance?: Date;
  baseAerodrome: string;
  photoUrl?: string;
}

const AdminPlanes: React.FC = () => {
  const [planes, setPlanes] = useState<Plane[]>([]);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchoolId = async () => {
      try {
        const loggedUser = await getLoggedUser();
        if (loggedUser && loggedUser.assignedSchools.length > 0) {
          setSchoolId(loggedUser.assignedSchools[0].school._id);
        } else {
          setError("No se pudo obtener la escuela del usuario logueado.");
        }
      } catch (err) {
        setError("Error al obtener la información del usuario logueado.");
      }
    };

    fetchSchoolId();
  }, []);

  const getPlanes = React.useCallback(async () => {
    try {
      const data = await fetchPlanes(schoolId);
      setPlanes(data);
    } catch (err) {
      setError("Failed to fetch planes");
    }
  }, [schoolId]);

  useEffect(() => {
    if (schoolId) {
      getPlanes();
    }
  }, [schoolId, getPlanes]);

  const handleAddPlane = async (planeData: Omit<Plane, "_id">) => {
    try {
      const newPlane = await createPlane(planeData);
      setPlanes((prevPlanes) => [...prevPlanes, newPlane]);
      setShowAddModal(false);
    } catch (err) {
      setError("Failed to add plane");
    }
  };

  const handleDeletePlane = async (id: string) => {
    try {
      await deletePlane(id);
      setPlanes((prevPlanes) => prevPlanes.filter((plane) => plane._id !== id));
    } catch (err) {
      setError("Failed to delete plane");
    }
  };

  const handleUpdatePlanePhoto = async (id: string, formData: FormData) => {
    try {
      const updatedPlane = await updatePlanePhoto(id, formData);
      setPlanes((prevPlanes) =>
        prevPlanes.map((plane) =>
          plane._id === updatedPlane._id ? updatedPlane : plane
        )
      );
    } catch (err) {
      setError("Failed to update plane photo");
    }
  };

  const links = [
    { path: "/admin/users", label: "Usuarios" },
    { path: "/admin/planes", label: "Aeronaves" },
    { path: "/admin/flights", label: "Vuelos" },
  ];

  return (
    <div className="admin-planes-container">
      <Navbar title="Aeronaves" links={links} logoutPath="/" />
      <div className="content">
        {error && <p className="text-danger">{error}</p>}
        <div className="plane-list">
          {planes.map((plane) => (
            <PlaneItem
              key={plane._id}
              plane={{
                _id: plane._id,
                registrationNumber: plane.registrationNumber,
                brand: plane.brand,
                model: plane.model,
                photoUrl: plane.photoUrl || defaultPlane,
                baseAerodrome: plane.baseAerodrome,
                addedDate: new Date(
                  parseInt(plane._id.substring(0, 8), 16) * 1000
                ).toLocaleDateString("es-ES"),
              }}
              onDelete={handleDeletePlane}
              onUpdatePhoto={handleUpdatePlanePhoto}
            />
          ))}
        </div>
        <button className="add-button" onClick={() => setShowAddModal(true)}>
          +
        </button>
        <AddPlaneModal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddPlane={handleAddPlane}
        />
      </div>
    </div>
  );
};

export default AdminPlanes;
