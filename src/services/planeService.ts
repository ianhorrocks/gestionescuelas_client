const API_URL = "http://localhost:3001/api/planes";

export const fetchPlanes = async (schoolId: string | null) => {
  if (!schoolId) {
    throw new Error("School ID is required");
  }
  const response = await fetch(`${API_URL}?schoolId=${schoolId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch planes");
  }

  const data = await response.json();
  return data.data; // Asegúrate de devolver solo los datos necesarios
};

export const deletePlane = async (id: string) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error deleting plane:", errorData);
    throw new Error("Failed to delete plane");
  }

  return await response.json();
};

export const createPlane = async (planeData: {
  registrationNumber: string;
  country: string;
  brand: string;
  model: string;
  totalHours: number;
  lastMaintenance?: Date; // Opcional
  baseAerodrome: string;
}) => {
  console.log("Sending plane data:", planeData); // Imprimir los datos enviados
  const response = await fetch(`${API_URL}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(planeData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error creating plane:", errorData); // Añadir log para ver el error
    throw new Error("Failed to create plane");
  }

  const data = await response.json();
  return data.data; // Asegúrate de devolver solo los datos necesarios
};

export const updatePlanePhoto = async (id: string, formData: FormData) => {
  const response = await fetch(`${API_URL}/${id}/photo`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error updating plane photo:", errorData);
    throw new Error("Failed to update plane photo");
  }

  const data = await response.json();
  return data.data; // Asegúrate de devolver solo los datos necesarios
};
