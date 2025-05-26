import React, { useEffect, useState, useMemo } from "react";
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
import { Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { FlatUser } from "../types/types";
import Alert from "../components/Alert";
import FilterSelect from "../components/FilterSelect";
import { FormControl } from "react-bootstrap"; // Importa el componente de Bootstrap para el input
import { FaSearch } from "react-icons/fa"; // Importa el ícono de lupa

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<FlatUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { message, showTemporaryMessage } = useTemporaryMessage();
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("profile") || "{}");
    if (profile && profile.assignedSchools?.length > 0) {
      setSchoolId(profile.assignedSchools[0].school._id);
    } else {
      console.error("No se encontró schoolId en el perfil del usuario.");
    }
  }, []);
  
  

  const getUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      if (Array.isArray(data)) {
        const adaptedData: FlatUser[] = data.map((user) => ({
          ...user,
          assignedSchools: user.assignedSchools.map((a) => ({
            ...a,
            role: a.role as "Alumno" | "Piloto" | "Instructor", // confiamos en que se usará bien
          })),
        }));
        setUsers(adaptedData);
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

  const countByRole = useMemo(() => {
    if (!schoolId) return { all: 0, Alumno: 0, Piloto: 0, Instructor: 0 };
    const counts = { all: 0, Alumno: 0, Piloto: 0, Instructor: 0 };
    users.forEach((user) => {
      const assignment = user.assignedSchools.find(
        (a) => a.school === schoolId
      );
      if (
        assignment &&
        ["Alumno", "Piloto", "Instructor"].includes(assignment.role)
      ) {
        counts[assignment.role as "Alumno" | "Piloto" | "Instructor"]++;
        counts.all++;
      }
    });
    return counts;
  }, [users, schoolId]);

  const roleOptions = [
    { value: "all", label: `Todos (${countByRole.all})` },
    { value: "Alumno", label: `Alumnos (${countByRole.Alumno})` },
    { value: "Piloto", label: `Pilotos (${countByRole.Piloto})` },
    { value: "Instructor", label: `Instructores (${countByRole.Instructor})` },
  ];

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

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
  };

  // Maneja el cambio en el cuadro de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredUsers = useMemo(() => {
    if (!schoolId) return [];
    let filtered = users;

    // Filtra por rol si no es "all"
    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => {
        const assignment = user.assignedSchools.find(
          (a) => a.school === schoolId
        );
        return assignment?.role === selectedRole;
      });
    }

    // Filtra por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter((user) =>
        `${user.name} ${user.lastname}`.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [users, selectedRole, schoolId, searchTerm]);

  const handleTagUpdate = (updatedUser: FlatUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u._id === updatedUser._id ? updatedUser : u))
    );
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
            {/* Contenedor de búsqueda y filtro */}
            <div className="search-filter-container">
              {/* Selector de roles */}
              <FilterSelect
                options={roleOptions}
                value={selectedRole}
                onChange={handleRoleChange}
                placeholder="Filtrar por rol"
                className="filter-select"
                keyboard
                autoClose
              />
              
              {/* Cuadro de búsqueda */}
              <div className="search-box">
                <FaSearch className="search-icon" />
                <FormControl
                  type="text"
                  placeholder="Buscar nombre"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {/* Lista de usuarios */}
            <ul className="list-group-users">
              {filteredUsers.map((user) => (
                <UserItem
                  key={user._id}
                  user={user}
                  schoolId={schoolId || ""}
                  onDelete={handleDeleteClick}
                  onTagAssigned={handleTagUpdate}
                />
              ))}
            </ul>
            <button className="add-button" onClick={() => setShowModal(true)}>
              +
            </button>
          </>
        )}

        {/* Modales */}
        <AddUserModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onAssignUser={handleAssignUser}
          showTemporaryMessage={showTemporaryMessage}
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
