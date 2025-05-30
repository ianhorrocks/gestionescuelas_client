// client/src/types.ts

export interface Plane {
  _id: string; // opcional para cuando lo creás
  registrationNumber: string;
  country: string;
  brand: string;
  model: string;
  totalHours: number | undefined; // opcional para cuando lo creás
  lastMaintenance?: Date;
  baseAerodrome: string;
  photoUrl?: string;
  addedDate?: string; // opcional para cuando lo creás
  idEmbebbed?: string | null; // ✅ agregado para manejar id del sistema embebido
  school?: string | { _id: string; name?: string; aerodrome?: string }; // <-- AGREGADO
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
  school:
    | string
    | {
        _id: string;
        name: string;
        aerodrome: string;
        // agrega otros campos si los necesitas
      };
  tag?: string; // Agregamos la propiedad tag aquí
}

export interface User {
  _id: string;
  name: string;
  lastname: string;
  email: string;
  dni: number;
  photo?: string | null;
  assignedSchools: AssignedSchool[];
  flightLocation?: string;
  license?: string;
  createdAt: string;
  updatedAt: string;
  activeSys?: boolean; // <-- AGREGADO
}

export interface EditUserProfileInput {
  name: string;
  lastname: string;
  email: string;
  dni: number;
  flightLocation?: string;
  license?: string;
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

export interface AdminUser extends User {
  // Si necesitas agregar propiedades adicionales específicas de AdminUser, hazlo aquí
}

export interface FlightUser {
  _id: string;
  name: string;
  lastname: string;
  role: string;
}

export type FlightType =
  | "Vuelo Privado"
  | "Instrucción"
  | "Navegacion"
  | "Readaptacion"
  | "Bautismo";

export interface Flight {
  _id: string;
  date: string;
  airplane: { registrationNumber: string };
  pilot: { name: string; lastname: string };
  instructor: { name: string; lastname: string } | null;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: "pending" | "confirmed" | "cancelled";
  preValidated: boolean;
  totalFlightTime?: string;
  flightType: FlightType; // ✅ nuevo
  school?: { _id: string; name: string };
  landings?: number;
  oil?: string;
  oilUnit?: "lt" | "qt";
  charge?: string;
  chargeUnit?: "lt" | "gal";
  comment?: string;
}

export interface SimplifiedFlight {
  _id: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  pilot: string;
  instructor: string;
  origin: string;
  destination: string;
  status: "pending" | "confirmed" | "cancelled";
  airplane?: string;
  totalFlightTime?: string;
  school?: string; // nombre plano
  landings?: number;
  oil?: string;
  oilUnit?: "lt" | "qt";
  charge?: string;
  chargeUnit?: "lt" | "gal";
  comment?: string;
  preValidated?: boolean;
  flightType?: FlightType;
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
  oilUnit?: "lt" | "qt";
  charge?: string;
  chargeUnit?: "lt" | "gal";
  school: string;
  origin: string;
  destination: string;
  flightType: FlightType;
  comment?: string; // <-- AGREGADO
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

export interface NewUser {
  dni: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
}

export interface NewSchool {
  type: string;
  name: string;
  country: string;
  aerodrome: string;
  address: string;
  openingHours: string;
  publicPhone: string;
  publicEmail: string;
  adminEmail: string;
  adminPassword: string;
}

export interface EmbeddedFlightInput {
  id?: string;
  id_embebed: string;
  id_tag: string;
  timestamp: string;
}

export interface EmbeddedFlight {
  id_embebbed: string;
  pilot_tag?: string;
  instructor_tag?: string;
  departureTime: string;
  arrivalTime: string;
  planeRegistration?: string;
  pilotName?: string;
  instructorName?: string;
}

export interface DiscardedRow {
  id_embebed: string;
  id_tag: string;
  timestamp: string;
  reason: string;
}

export interface EmbeddedFlightResponse {
  message: string;
  embebedFlights: EmbeddedFlight[];
  discardedRows: DiscardedRow[];
}

export interface FlightEvolution {
  month: string;
  count: number;
}

export interface ExtendedFlight extends Flight {
  validated: boolean;
}

export type HistoryFlight = ExtendedFlight & {
  status: "confirmed" | "cancelled";
};

export type AssignedSchoolFlat = {
  _id: string;
  role: "Alumno" | "Piloto" | "Instructor";
  createdAt: string;
  school: string | { _id: string; name: string; aerodrome: string };
  tag?: string;
};

export type FlatUser = Omit<User, "assignedSchools"> & {
  assignedSchools: AssignedSchoolFlat[];
};

export interface EditSchoolProfileInput {
  name: string;
  address: string;
  aerodrome: string;
  publicEmail: string;
  publicPhone: string;
  openingHours?: string;
  country?: string;
}

export interface UserWithRoles extends User {
  roles?: string[];
}
