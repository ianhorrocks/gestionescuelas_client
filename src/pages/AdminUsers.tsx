import React, { useEffect, useState } from "react";
import UserItem from "../components/UserItem";
import AddUserModal from "../components/AddUserModal";
import Navbar from "../components/NavbarAdmin";
import PlaneLoader from "../components/PlaneLoader";
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import {
  fetchUsers,
  removeUserFromSchool,
  assignUserToSchool,
} from "../services/userService";
import { getLoggedUser } from "../services/auth";
import { Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { AdminUser } from "../types/types";
import Alert from "../components/Alert";

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
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
        console.error(
          "Error fetching logged user information:",
          err instanceof Error ? err.message : "Unknown error"
        );
      }
    };

    fetchSchoolId();
  }, []);

  const getUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("Error: Expected an array of users, but got:", data);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error fetching users:", err.message);
      } else {
        console.error("Error fetching users:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId) {
      getUsers();
    }
  }, [schoolId]);

  const handleRemove = async (id: string) => {
    setLoading(true);
    try {
      const userToRemove = users.find((user) => user._id === id);
      await removeUserFromSchool(id);
      setUsers(users.filter((user) => user._id !== id));
      setShowConfirmModal(false);
      if (userToRemove) {
        showTemporaryMessage(
          "success",
          `Usuario "${userToRemove.name} ${userToRemove.lastname}" Eliminado`
        );
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error removing user:", err.message);
        showTemporaryMessage("error", "Error al eliminar el usuario.");
      } else {
        console.error("Error removing user:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setUserIdToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (userIdToDelete) {
      handleRemove(userIdToDelete);
    }
  };

  const handleAssignUser = async (dni: string, role: string) => {
    setLoading(true);
    try {
      const response = await assignUserToSchool(dni, role);
      if (response.message === "USER_ALREADY_ASSIGNED") {
        showTemporaryMessage(
          "warning",
          "El usuario ya está asignado a la escuela"
        );
      } else {
        getUsers();
        showTemporaryMessage("success", `Usuario Agregado`);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error assigning user:", err.message);
      } else {
        console.error("Error assigning user:", err);
        showTemporaryMessage(
          "error",
          "Error al asignar el usuario a la escuela"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const links = [
    { path: "/admin/users", label: "Usuarios" },
    { path: "/admin/planes", label: "Aeronaves" },
    { path: "/admin/flights", label: "Vuelos" },
  ];

  return (
    <div>
      <Navbar title="Usuarios" links={links} logoutPath="/" />
      <div className="admin-users-container">
        {message && <Alert message={message.message} type={message.type} />}
        {loading ? (
          <PlaneLoader />
        ) : (
          <>
            <ul className="list-group-users">
              {users.map((user) => (
                <UserItem
                  key={user._id}
                  user={user}
                  onDelete={handleDeleteClick}
                  schoolId={schoolId || ""}
                  onTagAssigned={getUsers}
                />
              ))}
            </ul>
            <button className="add-button" onClick={() => setShowModal(true)}>
              +
            </button>
          </>
        )}

        <AddUserModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onAssignUser={handleAssignUser}
        />

        <Modal
          show={showConfirmModal}
          onHide={() => setShowConfirmModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Eliminación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            ¿Estás seguro de que deseas eliminar este usuario?
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

export default AdminUsers;
