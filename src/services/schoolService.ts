import api from "./api";
import { School } from "../types/types";

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
