import React, { useEffect, useState } from "react";
import Navbar from "../components/NavbarAdmin";
import AddPlaneModal from "../components/AddPlaneModal";
import PlaneItem from "../components/PlaneItem";
import PlaneLoader from "../components/PlaneLoader";
import Alert from "../components/Alert";
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import {
  fetchPlanes,
  createPlane,
  deletePlane,
  updatePlanePhoto,
} from "../services/planeService";
import { getLoggedUser } from "../services/auth";
import defaultPlane from "../assets/images/default-plane.jpg";
import { NewPlane, Plane } from "../types/types";

const AdminPlanes: React.FC = () => {
  const [planes, setPlanes] = useState<Plane[]>([]);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { message, showTemporaryMessage } = useTemporaryMessage();

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
      setLoading(true);
      if (!schoolId) throw new Error("School ID is null");
      const data = await fetchPlanes(schoolId);
      setPlanes(data);
    } catch (err) {
      setError("Failed to fetch planes");
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    if (schoolId) {
      getPlanes();
    }
  }, [schoolId, getPlanes]);

  const handleAddPlane = async (planeData: NewPlane) => {
    setLoading(true);
    try {
      const newPlane = await createPlane(planeData);
      setPlanes((prevPlanes) => [...prevPlanes, newPlane]);
      showTemporaryMessage("success", "Aeronave Agregada");
      setShowAddModal(false);
    } catch (err) {
      setError("Failed to add plane");
      showTemporaryMessage("error", "Error al eliminar la aeronave.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlane = async (id: string) => {
    setLoading(true);
    try {
      await deletePlane(id);
      setPlanes((prevPlanes) => prevPlanes.filter((plane) => plane._id !== id));
      showTemporaryMessage("success", "Aeronave Eliminada");
    } catch (err) {
      setError("Failed to delete plane");
      showTemporaryMessage("error", "Error al eliminar la aeronave.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlanePhoto = async (id: string, formData: FormData) => {
    try {
      await updatePlanePhoto(id, formData);
      const updatedPlanes = planes.map((plane) =>
        plane._id === id
          ? {
              ...plane,
              photoUrl: URL.createObjectURL(formData.get("file") as Blob),
            }
          : plane
      );
      setPlanes(updatedPlanes);
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
        {message && <Alert message={message.message} type={message.type} />}

        {loading ? (
          <PlaneLoader />
        ) : (
          <>
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

            <button
              className="add-button"
              onClick={() => setShowAddModal(true)}
            >
              +
            </button>
          </>
        )}

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
