import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [planeIdToDelete, setPlaneIdToDelete] = useState<string | null>(null);
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
          console.error("Error cant obtain school ID for logged user.");
        }
      } catch (err) {
        console.error("Error fetching logged user information:", err);
      }
    };

    fetchSchoolId();
  }, []);

  const getPlanes = React.useCallback(async () => {
    try {
      setLoading(true);
      if (!schoolId) throw new Error("School ID is null");
      const data = await fetchPlanes(schoolId);
      const enrichedPlanes = data.map((plane) => ({
        ...plane,
        addedDate: new Date(
          parseInt(plane._id.substring(0, 8), 16) * 1000
        ).toLocaleDateString("es-ES"),
        photoUrl: plane.photoUrl || defaultPlane,
      }));

      setPlanes(enrichedPlanes);
    } catch (err) {
      console.error("Error fetching planes:", err);
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
      console.error("Error adding plane:", err);
      showTemporaryMessage("error", "Error al eliminar la aeronave.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setPlaneIdToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (planeIdToDelete) {
      setLoading(true);
      try {
        await deletePlane(planeIdToDelete);
        setPlanes((prevPlanes) =>
          prevPlanes.filter((plane) => plane._id !== planeIdToDelete)
        );
        showTemporaryMessage("success", "Aeronave Eliminada");
      } catch (err) {
        console.error("Error deleting plane:", err);
        showTemporaryMessage("error", "Error al eliminar la aeronave.");
      } finally {
        setLoading(false);
        setShowConfirmModal(false);
      }
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
      console.error("Error updating plane photo:", err);
      showTemporaryMessage("error", "Error al subir foto");
    }
  };

  const links = [
    { path: "/admin/users", label: "Usuarios" },
    { path: "/admin/planes", label: "Aeronaves" },
    { path: "/admin/flights", label: "Vuelos" },
  ];

  return (
    <div>
      <Navbar title="Aeronaves" links={links} logoutPath="/" />
      <div className="admin-planes-container">
        {message && <Alert message={message.message} type={message.type} />}

        {loading ? (
          <PlaneLoader />
        ) : (
          <>
            <div className="list-group-planes">
              {planes.map((plane) => (
                <PlaneItem
                  key={plane._id}
                  plane={plane}
                  onDelete={handleDeleteClick}
                  onUpdatePhoto={handleUpdatePlanePhoto}
                  onIdAssigned={getPlanes}
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

        <Modal
          show={showConfirmModal}
          onHide={() => setShowConfirmModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Eliminación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            ¿Estás seguro de que deseas eliminar esta aeronave?
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default AdminPlanes;
