const API_URL = "http://localhost:3001/api/flights";

export interface FlightData {
  date: string;
  airplane: string;
  pilot: string;
  instructor: string | null; // Permitir null como valor válido
  departureTime: string;
  arrivalTime: string;
  landings: string;
  oil?: string; // Opcional
  charge?: string; // Opcional
  school: string;
  origin: string;
  destination: string;
  initialOdometer: string;
  finalOdometer: string;
}

export const fetchUserFlights = async (schoolId: string) => {
  const API_URL = `http://localhost:3001/api/schools/${schoolId}/flights`;

  try {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch flights");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching flights:", error);
    throw error;
  }
};

export const fetchFlights = async () => {
  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch flights");
  }

  const data = await response.json();
  console.log("Fetched flights:", data); // Agregar console.log para verificar los datos
  return data;
};

export const validateFlight = async (id: string) => {
  const response = await fetch(`${API_URL}/${id}/validate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to validate flight");
  }

  return await response.json();
};

export const getUserFlightsBySchool = async (
  userId: string,
  schoolId: string
) => {
  console.log(
    `Fetching flights for user ID: ${userId} and school ID: ${schoolId}`
  );
  const response = await fetch(`${API_URL}/user/${userId}/school/${schoolId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch flights for school");
  }

  const data = await response.json();
  console.log("Flights data:", data); // Agregar console.log para verificar los datos
  return data;
};

export const createFlight = async (flightData: FlightData) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(flightData),
    });

    if (!response.ok) {
      throw new Error("Failed to create flight");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating flight:", error);
    throw error;
  }
};

export const getAllUserFlights = async (userId: string) => {
  const API_URL = `http://localhost:3001/api/flights/user/${userId}`; // Endpoint para obtener todos los vuelos del usuario

  try {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch all user flights");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching all user flights:", error);
    throw error;
  }
};
