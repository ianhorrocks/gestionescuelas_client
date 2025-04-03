import React, { useEffect, useState } from "react";
import UserItem from "../components/UserItem";
import AddUserModal from "../components/AddUserModal";
import Navbar from "../components/Navbar"; // Importar el nuevo Navbar
import {
  fetchUsers,
  removeUserFromSchool,
  assignUserToSchool,
} from "../services/userService";
import { getLoggedUser } from "../services/auth";
import { Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";

interface User {
  _id: string;
  name: string;
  lastname: string;
  assignedSchools: {
    school: string;
    role: string;
    createdAt: string;
  }[];
  email: string;
  photo?: string;
  dni: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchSchoolId = async () => {
      try {
        const loggedUser = await getLoggedUser();
        if (loggedUser && loggedUser.assignedSchools.length > 0) {
          setSchoolId(loggedUser.assignedSchools[0].school._id);
          setUserName(`${loggedUser.name} ${loggedUser.lastname}`);
        } else {
          setError("No se pudo obtener la escuela del usuario logueado.");
        }
      } catch (err) {
        setError("Error al obtener la información del usuario logueado.");
      }
    };

    fetchSchoolId();
  }, []);

  const getUsers = async () => {
    try {
      const data = await fetchUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setError("Unexpected response format");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Failed to fetch users");
      } else {
        setError("Failed to fetch users");
      }
    }
  };

  useEffect(() => {
    if (schoolId) {
      getUsers();
    }
  }, [schoolId]);

  const handleRemove = async (id: string) => {
    try {
      await removeUserFromSchool(id);
      setUsers(users.filter((user) => user._id !== id));
      setShowConfirmModal(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Failed to remove user from school");
      } else {
        setError("Failed to remove user from school");
      }
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
    try {
      const response = await assignUserToSchool(dni, role);
      if (response.message === "USER_ALREADY_ASSIGNED") {
        setError("El usuario ya pertenece a la escuela.");
      } else {
        setError("");
        getUsers(); // Refrescar la lista de usuarios
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Error al asignar el usuario a la escuela.");
      } else {
        setError("Error al asignar el usuario a la escuela.");
      }
    }
  };

  const links = [
    { path: "/admin/users", label: "Usuarios" },
    { path: "/admin/planes", label: "Aeronaves" },
    { path: "/admin/flights", label: "Vuelos" },
  ];

  return (
    <div>
      <Navbar
        title="Gestión de Usuarios"
        userName={userName}
        links={links}
        logoutPath="/"
      />
      <div className="admin-users-container">
        <h1>Usuarios</h1>
        {error && <p className="text-danger">{error}</p>}
        <ul className="list-group-users">
          {users.map((user) => (
            <UserItem
              key={user._id}
              user={user}
              onDelete={handleDeleteClick}
              schoolId={schoolId || ""}
            />
          ))}
        </ul>
        <button className="add-button" onClick={() => setShowModal(true)}>
          +
        </button>
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
