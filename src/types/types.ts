// client/src/types.ts

export interface Plane {
  _id: string; // opcional para cuando lo creás
  registrationNumber: string;
  country: string;
  brand: string;
  model: string;
  totalHours: number;
  lastMaintenance?: Date;
  baseAerodrome: string;
  photoUrl?: string;
}

export interface School {
  _id: string;
  name: string;
  address: string;
  admin: string;
  aerodrome: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  openingHours: string;
  planes: Plane[];
  publicEmail: string;
  publicPhone: string;
  status: string;
  type: string;
}

export interface AssignedSchool {
  _id: string;
  role: string;
  createdAt: string;
  school: School;
}

export interface User {
  _id: string;
  name: string;
  lastname: string;
  dni: number;
  email: string;
  photo: string | null;
  assignedSchools: AssignedSchool[];
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
  password?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AssignedSchoolShort {
  school: string; // ID de la escuela
  role: string;
  createdAt: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  lastname: string;
  email: string;
  photo?: string;
  dni: string;
  assignedSchools: AssignedSchoolShort[];
}

export interface FlightUser {
  _id: string;
  name: string;
  lastname: string;
  role: string;
}

export interface Flight {
  _id: string;
  date: string;
  airplane: { registrationNumber: string } | null;
  pilot: { name: string; lastname: string };
  instructor: { name: string; lastname: string } | null;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: "pending" | "confirmed" | "cancelled";
  totalFlightTime?: string;
}

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

export interface NewPlane {
  registrationNumber: string;
  country: string;
  brand: string;
  model: string;
  totalHours: number;
  lastMaintenance?: Date;
  baseAerodrome: string;
}
