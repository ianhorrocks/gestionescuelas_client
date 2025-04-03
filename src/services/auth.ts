const API_URL = "http://localhost:3001/api/auth";

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const { data } = await response.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("profile", JSON.stringify(data.user));
  return data;
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("profile") || "{}");
};

export const getLoggedUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }

  const response = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  const { data } = await response.json();
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("profile");
};
