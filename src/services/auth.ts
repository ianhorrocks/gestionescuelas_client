// client/src/services/auth.ts
import api from "./api";
import { LoginResponse, UserWithRoles } from "../types/types";
import { AxiosError } from "axios";

export const loginUser = async (
  email: string,
  password: string
): Promise<{ token: string; user: UserWithRoles }> => {
  try {
    const response = await api.post<{ data: LoginResponse }>("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data.data;

    localStorage.setItem("token", token);
    localStorage.setItem("profile", JSON.stringify(user));

    return { token, user };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ error: string }>;
    const msg = axiosError.response?.data?.error;

    if (msg === "LA_ESCUELA_AUN_NO_FUE_APROBADA") {
      throw new Error("LA_ESCUELA_AUN_NO_FUE_APROBADA");
    }

    if (msg === "PASSWORD_INVALID" || msg === "USER_NOT_FOUND") {
      throw new Error("LOGIN_INVALID");
    }

    throw new Error("LOGIN_FAILED");
  }
};

export const getCurrentUser = (): UserWithRoles => {
  return JSON.parse(localStorage.getItem("profile") || "{}");
};

export const getLoggedUser = async (): Promise<UserWithRoles> => {
  const response = await api.get<{ data: UserWithRoles }>("/auth/me");
  return response.data.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("profile");
  localStorage.removeItem("selectedSchoolId");
};
