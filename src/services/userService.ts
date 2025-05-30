import api from "./api";
import {
  AdminUser,
  User,
  FlightUser,
  NewUser,
  EditUserProfileInput,
} from "../types/types";
import { AxiosError } from "axios";

// Se usa en AdminUsers.tsx
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
  try {
    const response = await api.post<{ message: string }>("/users/add", {
      dni,
      role,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (
        error.response?.status === 404 &&
        error.response?.data?.message === "USER_NOT_FOUND"
      ) {
        throw new Error("USER_NOT_FOUND");
      }
      if (
        error.response?.status === 400 &&
        error.response?.data?.message === "USER_ALREADY_ASSIGNED"
      ) {
        throw new Error("USER_ALREADY_ASSIGNED");
      }
    }
    throw new Error("ASSIGN_USER_FAILED");
  }
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

export const updateUserProfile = async (
  id: string,
  profile: EditUserProfileInput
) => {
  try {
    const response = await api.put(`/users/${id}`, profile);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorCode = error.response?.data?.errorCode;

      if (errorCode === "DNI_DUPLICATED") {
        throw new Error("DNI_DUPLICATED");
      }
      if (errorCode === "EMAIL_DUPLICATED") {
        throw new Error("EMAIL_DUPLICATED");
      }
    }

    throw new Error("UPDATE_PROFILE_FAILED");
  }
};

// Se usa en: por ahora ningun lado..
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

// Se usa en: addFlightModal.tsx
export const fetchUsersFromSchool = async (
  schoolId: string
): Promise<FlightUser[]> => {
  const response = await api.get<{ data: FlightUser[] }>(
    `/users/school/${schoolId}`
  );
  return response.data.data;
};

export const registerUser = async (userData: NewUser) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ error: string }>;

    const errorMessage = axiosError.response?.data?.error;
    console.error("Error in registration:", errorMessage);
    if (axiosError.response?.status === 409) {
      if (errorMessage === "EMAIL_ALREADY_REGISTERED") {
        throw new Error("EMAIL_ALREADY_REGISTERED");
      }
      if (errorMessage === "DNI_ALREADY_REGISTERED") {
        throw new Error("DNI_ALREADY_REGISTERED");
      }
    }

    throw new Error("REGISTRATION_FAILED");
  }
};

export const assignTagToUser = async (
  userId: string,
  schoolId: string,
  tag: string
): Promise<{ message: string; user: User }> => {
  try {
    const response = await api.put<{ message: string; user: User }>(
      "/users/assign-tag",
      {
        userId,
        schoolId,
        tag,
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      // Intenta extraer el mensaje de error del backend
      const backendMessage = error.response?.data?.message;
      if (backendMessage === "TAG_ALREADY_ASSIGNED") {
        throw new Error("TAG_ALREADY_ASSIGNED");
      }
    }
    throw error;
  }
};

export const removeTagFromUser = async (
  userId: string,
  schoolId: string
): Promise<{ message: string }> => {
  const response = await api.put("/users/remove-tag", {
    userId,
    schoolId,
  });
  return response.data;
};
