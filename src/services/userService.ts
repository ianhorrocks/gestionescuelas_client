const API_URL = "http://localhost:3001/api/users";

export const fetchUsers = async () => {
  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  console.log("Response status:", response.status); // Añadir log para ver el estado de la respuesta

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error fetching users:", errorData); // Añadir log para ver el error
    throw new Error("Failed to fetch users");
  }

  const result = await response.json();
  console.log("Fetched users:", result); // Añadir log para ver los datos obtenidos
  return result.data; // Devolver directamente el array de usuarios
};

export const deleteUser = async (id: string) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }

  return await response.json();
};

export const assignUserToSchool = async (dni: string, role: string) => {
  const response = await fetch(`${API_URL}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ dni, role }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to assign user");
  }

  return await response.json();
};

export const removeUserFromSchool = async (id: string) => {
  const response = await fetch(`${API_URL}/remove/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to remove user from school");
  }

  return await response.json();
};

export const getUserById = async (id: string) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user jeje");
  }

  return await response.json();
};

export const updateUserProfile = async (profile: {
  name: string;
  lastname: string;
  email: string;
}) => {
  const response = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  return await response.json();
};

export const fetchUsersByIds = async (userIds: string[]) => {
  const response = await fetch(`${API_URL}/details`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ userIds }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user details");
  }

  const data = await response.json();
  return data.data; // Devuelve los detalles de los usuarios
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const response = await fetch(`${API_URL}/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    throw new Error("Failed to change password");
  }

  return await response.json();
};

export const fetchUserProfile = async () => {
  const response = await fetch(`${API_URL}/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  return await response.json();
};
