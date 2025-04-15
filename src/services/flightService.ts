// client/src/services/flightService.ts
import api from "./api";
import { Flight } from "../types/types";

export interface FlightData {
  date: string;
  airplane: string;
  pilot: string;
  instructor: string | null;
  departureTime: string;
  arrivalTime: string;
  landings: string;
  oil?: string;
  charge?: string;
  school: string;
  origin: string;
  destination: string;
  initialOdometer: string;
  finalOdometer: string;
}

// Por ahora en ningun lado
export const fetchUserFlights = async (schoolId: string): Promise<Flight[]> => {
  const response = await api.get<Flight[]>(`/schools/${schoolId}/flights`);
  return response.data;
};

// Se usa en Userflights y en AdminFlights .tsx
export const fetchFlights = async (): Promise<Flight[]> => {
  const response = await api.get<Flight[]>(`/flights`);
  console.log("Fetched flights:", response.data);
  return response.data;
};

// Se va a usar en adminflightmodal y por ende en validateflightsmodal.tsx pero aun no
export const validateFlight = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    `/flights/${id}/validate`
  );
  return response.data;
};

// Era para UserSchool.tsx pero no se usa mas
export const getUserFlightsBySchool = async (
  userId: string,
  schoolId: string
): Promise<Flight[]> => {
  console.log(
    `Fetching flights for user ID: ${userId} and school ID: ${schoolId}`
  );
  const response = await api.get<Flight[]>(
    `/flights/user/${userId}/school/${schoolId}`
  );
  console.log("Flights data:", response.data);
  return response.data;
};

// Se usa en addFlight modal habria que hacer un type exportarlo y usarlo aqui... solo para los vuelos que son creados...
export const createFlight = async (
  flightData: FlightData
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(`/flights`, flightData);
  return response.data;
};

// Se usa en userflights .tsx
export const getAllUserFlights = async (userId: string): Promise<Flight[]> => {
  const response = await api.get<{ data: Flight[] }>(`/flights/user/${userId}`);
  return response.data.data;
};

// se usa en adminflights.tsx
export const getAllSchoolFlights = async (
  schoolId: string
): Promise<Flight[]> => {
  const response = await api.get<{ data: Flight[] }>(
    `/flights/school/${schoolId}`
  );
  return response.data.data;
};
