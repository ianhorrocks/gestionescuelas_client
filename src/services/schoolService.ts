const API_URL = "http://localhost:3001/api/schools";

export const getSchoolsById = async (schoolId: string) => {
  console.log("Fetching schools by user ID:", schoolId); // Agregar console.log
  const response = await fetch(`${API_URL}/${schoolId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch schools");
  }

  return await response.json();
};
