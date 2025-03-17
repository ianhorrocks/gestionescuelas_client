const API_URL = "http://localhost:3001/api/schools";

export const getSchoolsForUser = async () => {
  console.log("Fetching schools for user"); // Agregar console.log
  const response = await fetch(`${API_URL}/user-schools`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch schools for user");
  }

  return await response.json();
};

export const getSchoolsById = async (schoolId: string) => {
  console.log(`Fetching school by ID: ${schoolId}`); // Agregar console.log
  const response = await fetch(`${API_URL}/${schoolId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch school by ID");
  }

  const data = await response.json();
  console.log("School data:", data); // Agregar console.log
  return data;
};
