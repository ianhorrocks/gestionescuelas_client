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
