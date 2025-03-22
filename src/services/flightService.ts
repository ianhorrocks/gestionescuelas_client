const API_URL = "http://localhost:3001/api/flights";

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
  ); // Agregar console.log
  const response = await fetch(`${API_URL}/user/${userId}/school/${schoolId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch flights for school");
  }

  const data = await response.json();
  console.log("Flights data:", data); // Agregar console.log
  return data;
};
