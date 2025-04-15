import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true, // Podés dejarlo, aunque no se usen cookies
});

// 👇 Interceptor que agrega el token al header Authorization
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {}; // 👈 asegura que headers exista
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
