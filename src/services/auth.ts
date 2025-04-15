// client/src/services/auth.ts
import api from "./api";
import { LoginResponse, User } from "../types/types";

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await api.post<{ data: LoginResponse }>("/auth/login", {
    email,
    password,
  });

  console.log("LOGIN RESPONSE:", response.data);

  const { token, user } = response.data.data;

  localStorage.setItem("token", token);
  localStorage.setItem("profile", JSON.stringify(user));

  return { token, user };
};

export const getCurrentUser = (): User => {
  return JSON.parse(localStorage.getItem("profile") || "{}");
};

export const getLoggedUser = async (): Promise<User> => {
  const response = await api.get<{ data: User }>("/auth/me");
  return response.data.data; // también está envuelto en "data"
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("profile");
  localStorage.removeItem("selectedSchoolId");
};
