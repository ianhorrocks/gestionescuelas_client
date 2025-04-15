import api from "./api";
import { AdminUser, User, FlightUser } from "../types/types";

// Se usa en AdminUsers.tsx // Error en'response.data' is of type 'unknown'.ts(18046) (property) Axios.AxiosXHR<unknown>.data: unknown Response that was provided by the server
export const fetchUsers = async (): Promise<AdminUser[]> => {
  const response = await api.get<{ data: AdminUser[] }>("/users");
  return response.data.data;
};

// Se usa en: por ahora ningun lado..
export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const assignUserToSchool = async (
  dni: string,
  role: string
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>("/users/add", {
    dni,
    role,
  });
  return response.data;
};

export const removeUserFromSchool = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/users/remove/${id}`);
  return response.data;
};

// Se usa en UserDashboard.tsx
export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
};

// Se usa en: por ahora ningun lado..
export const updateUserProfile = async (profile: {
  name: string;
  lastname: string;
  email: string;
}) => {
  const response = await api.put("/users/profile", profile);
  return response.data;
};

// Se usa en: por ahora ningun lado.. // Error en 'response.data' is of type 'unknown'.ts(18046) const response: Axios.AxiosXHR<unknown>
export const fetchUsersByIds = async (userIds: string[]): Promise<User[]> => {
  const response = await api.post<{ data: User[] }>("/users/details", {
    userIds,
  });
  return response.data.data;
};

// Se usa en: por ahora ningun lado.. pero si en el futuro
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const response = await api.put("/users/change-password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};

// Se usa en: por ahora ningun lado..
export const fetchUserProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

// Se usa en: addFlightModal.tsx // Error en 'response.data' is of type 'unknown'.ts(18046) const response: Axios.AxiosXHR<unknown>
export const fetchUsersFromSchool = async (
  schoolId: string
): Promise<FlightUser[]> => {
  const response = await api.get<{ data: FlightUser[] }>(
    `/users/school/${schoolId}`
  );
  return response.data.data;
};
