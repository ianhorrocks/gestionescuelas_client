import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useAuth } from "../context/useAuth";
import {
  getAllSchools,
  getPendingSchools,
  approveSchool,
  rejectSchool,
  deleteSchool,
} from "../services/schoolService";
import { fetchUsersFromSchool, fetchUsers } from "../services/userService";
import PlaneLoader from "../components/PlaneLoader";
import Alert from "../components/Alert";
import FilterSelect from "../components/FilterSelect";
import ConfirmModal from "../components/ConfirmModal";
import { School, FlightUser } from "../types/types";
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import { useNavigate } from "react-router-dom";

const estadoOptions = [
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobadas" },
  { value: "rejected", label: "Rechazadas" },
  { value: "all", label: "Todas" },
];

// Panel de Superusuario para gestión de escuelas y usuarios
const SuperAdminPanel: React.FC = () => {
  const authContext = useContext(AuthContext);
  const { loading } = useAuth();
  const user = authContext?.user;
  const [mode, setMode] = useState<"escuelas" | "usuarios">("escuelas");
  const [schools, setSchools] = useState<School[]>([]);
  const [filter, setFilter] = useState("all");
  const [alert, setAlert] = useState<string | null>(null);
  // Para modo usuarios
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [users, setUsers] = useState<FlightUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [modal, setModal] = useState<{ show: boolean; action: null | "approve" | "reject" | "delete"; schoolId?: string }>({ show: false, action: null });
  const { message, showTemporaryMessage } = useTemporaryMessage();
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastname.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const navigate = useNavigate();

  // Proteger acceso solo para Super Admin
  useEffect(() => {
    if (!user || !user.roles?.includes("Super Admin")) {
      setAlert("Acceso denegado. Solo para Super Admin.");
    } else if (mode === "escuelas") {
      fetchSchools();
    } else if (mode === "usuarios") {
      fetchAllSchools();
    }
    // eslint-disable-next-line
  }, [user, filter, mode]);

  const fetchSchools = async () => {
    try {
      let data: School[] = [];
      if (filter === "pending") {
        data = await getPendingSchools();
      } else {
        data = await getAllSchools();
        if (filter !== "all") {
          data = data.filter((s) => s.status === filter);
        }
      }
      setSchools(data);
    } catch (e) {
      setAlert("Error al cargar escuelas");
    }
  };

  // Para modo usuarios: cargar todas las escuelas para el dropdown
  const fetchAllSchools = async () => {
    try {
      const data = await getAllSchools();
      setSchools(data);
    } catch (e) {
      setAlert("Error al cargar escuelas");
    }
  };

  // Cuando selecciona una escuela en modo usuarios
  const handleSelectSchool = async (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setLoadingUsers(true);
    try {
      let usersData: FlightUser[] = [];
      if (schoolId === "all") {
        const allUsers = await fetchUsers();
        // Mapea a FlightUser y asigna un rol (o 'Sin rol' si no tiene)
        const uniqueUsers = Array.from(
          new Map(
            allUsers.map((u) => [
              u._id,
              {
                _id: u._id,
                name: u.name,
                lastname: u.lastname,
                role:
                  u.assignedSchools && u.assignedSchools.length > 0
                    ? u.assignedSchools[0].role
                    : "Sin rol",
              },
            ])
          ).values()
        );
        usersData = uniqueUsers;
      } else {
        usersData = await fetchUsersFromSchool(schoolId);
      }
      setUsers(usersData);
    } catch (e) {
      setAlert("Error al cargar usuarios");
      setUsers([]);
    }
    setLoadingUsers(false);
  };

  // Acciones: aprobar, rechazar, eliminar
  const handleApprove = async (id: string) => {
    await approveSchool(id);
    showTemporaryMessage("success", "Escuela aprobada correctamente");
    fetchSchools();
  };
  const handleReject = async (id: string) => {
    await rejectSchool(id);
    showTemporaryMessage("warning", "Escuela rechazada");
    fetchSchools();
  };
  const handleDelete = async (id: string) => {
    await deleteSchool(id);
    showTemporaryMessage("success", "Escuela eliminada");
    fetchSchools();
  };

  const handleAction = (action: "approve" | "reject" | "delete", schoolId: string) => {
    setModal({ show: true, action, schoolId });
  };
  const handleConfirm = async () => {
    if (!modal.schoolId || !modal.action) return;
    if (modal.action === "approve") await handleApprove(modal.schoolId);
    if (modal.action === "reject") await handleReject(modal.schoolId);
    if (modal.action === "delete") await handleDelete(modal.schoolId);
    setModal({ show: false, action: null });
  };
  const handleCancel = () => setModal({ show: false, action: null });

  if (loading) return <PlaneLoader />;

  return (
    <>
      <button
        className="superadmin-logout-btn"
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("profile");
          localStorage.removeItem("selectedSchoolId");
          navigate("/login");
        }}
      >
        Cerrar sesión
      </button>
      <div className="superadmin-panel-container">
        <h2 className="superadmin-title">PANEL DE PILOTLOG</h2>
        <div className="superadmin-mode-buttons">
          <button
            onClick={() => setMode("escuelas")}
            className={mode === "escuelas" ? "active" : ""}
          >
            ESCUELAS
          </button>
          <button
            onClick={() => setMode("usuarios")}
            className={mode === "usuarios" ? "active" : ""}
          >
            USUARIOS
          </button>
        </div>
        {message && <Alert message={message.message} type={message.type} />}
        {alert && <Alert message={alert} type="error" />}
        <ConfirmModal
          show={modal.show}
          title={
            modal.action === "approve"
              ? "Aprobar escuela"
              : modal.action === "reject"
              ? "Rechazar escuela"
              : modal.action === "delete"
              ? "Eliminar escuela"
              : ""
          }
          message={
            modal.action === "approve"
              ? "¿Está seguro que desea aprobar esta escuela?"
              : modal.action === "reject"
              ? "¿Está seguro que desea rechazar esta escuela?"
              : modal.action === "delete"
              ? "¿Está seguro que desea eliminar esta escuela? Esta acción no se puede deshacer."
              : ""
          }
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
        {mode === "escuelas" && (
          <>
            <div className="filter-select-wrapper">
              <FilterSelect
                options={estadoOptions}
                value={filter}
                onChange={(val) => setFilter(val as string)}
                placeholder="Filtrar por estado"
              />
            </div>
            <div style={{ minHeight: 250, position: "relative" }}>
              {loadingUsers ? (
                <PlaneLoader />
              ) : Array.isArray(schools) && schools.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map((school) => (
                      <tr key={school._id}>
                        <td>{school.name}</td>
                        <td>{school.status}</td>
                        <td>
                          {school.status === "pending" && (
                            <>
                              <button onClick={() => handleAction("approve", school._id)}>Aprobar</button>
                              <button onClick={() => handleAction("reject", school._id)}>Rechazar</button>
                            </>
                          )}
                          <button onClick={() => handleAction("delete", school._id)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>No hay escuelas para mostrar.</div>
              )}
            </div>
          </>
        )}
        {mode === "usuarios" && (
          <>
            <div className="filter-select-wrapper">
              <FilterSelect
                options={[
                  { value: "all", label: "Todos" },
                  ...schools.map((s) => ({ value: s._id, label: s.name })),
                ]}
                value={selectedSchoolId}
                onChange={(val) => handleSelectSchool(val as string)}
                placeholder="Selecciona una escuela"
              />
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <input
                type="text"
                placeholder="Buscar usuario por nombre o apellido..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", minWidth: 220 }}
              />
            </div>
            <div style={{ minHeight: 250, position: "relative" }}>
              {loadingUsers ? (
                <PlaneLoader />
              ) : selectedSchoolId && filteredUsers.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Rol</th>
                      {/* Aquí puedes agregar más columnas para acciones */}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.lastname}</td>
                        <td>{user.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : selectedSchoolId ? (
                <div>No hay usuarios para esta escuela.</div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SuperAdminPanel;
