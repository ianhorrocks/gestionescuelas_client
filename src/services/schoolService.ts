import api from "./api";
import { School, NewSchool } from "../types/types";
import { AxiosError } from "axios";

// Se usa en: UserDashboard.tsx
export const getSchoolsForUser = async (): Promise<School[]> => {
  const response = await api.get<School[]>("/schools/user-schools");
  return response.data;
};

// Se usa en: por ahora para ningun lado.. pero si en el futuro
export const getSchoolsById = async (schoolId: string): Promise<School> => {
  console.log(`Fetching school by ID por getSchoolsById: ${schoolId}`);
  const response = await api.get<{ data: School }>(`/schools/${schoolId}`);
  console.log("School data:", response.data.data);
  return response.data.data;
};

// Se usa en: cuando se necesitan más detalles (probablemente admin)
export const getSchoolDetails = async (schoolId: string): Promise<School> => {
  console.log(`Fetching school by ID por getSchoolDetails: ${schoolId}`);
  try {
    const response = await api.get<{ data: School }>(
      `/schools/${schoolId}/details`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching school details:", error);
    throw error;
  }
};

export const registerSchool = async (schoolData: NewSchool) => {
  try {
    const response = await api.post("/schools", schoolData);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ error: string }>;
    const errorMsg = axiosError.response?.data?.error;

    if (
      axiosError.response?.status === 409 &&
      errorMsg === "SCHOOL_ALREADY_EXISTS"
    ) {
      throw new Error("SCHOOL_ALREADY_EXISTS");
    }

    throw new Error("SCHOOL_REGISTRATION_FAILED");
  }
};

// PUT /schools/:id para editar datos de la escuela
export const updateSchool = async (schoolId: string, data: Partial<School>) => {
  try {
    const response = await api.put<School>(`/schools/${schoolId}`, data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error: string }>;
    throw new Error(axiosError.response?.data?.error || "UPDATE_SCHOOL_FAILED");
  }
};

// Obtener todas las escuelas
export const getAllSchools = async (): Promise<School[]> => {
  const response = await api.get<{ data: School[] }>("/schools");
  return response.data.data;
};

// Obtener solo escuelas pendientes
export const getPendingSchools = async (): Promise<School[]> => {
  const response = await api.get<{ data: School[] }>("/schools/pending");
  return response.data.data;
};

// Aprobar una escuela
export const approveSchool = async (id: string) => {
  const response = await api.put(`/schools/approve/${id}`);
  return response.data;
};

// Rechazar una escuela
export const rejectSchool = async (id: string) => {
  const response = await api.put(`/schools/reject/${id}`);
  return response.data;
};

// Eliminar una escuela
export const deleteSchool = async (id: string) => {
  const response = await api.delete(`/schools/${id}`);
  return response.data;
};
