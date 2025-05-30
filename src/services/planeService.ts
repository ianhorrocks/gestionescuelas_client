import api from "./api";
import { Plane, NewPlane } from "../types/types";
import { AxiosError } from "axios";

// Se usa en AddFlightModal.tsx y en AdminPlanes.tsx
export const fetchPlanes = async (schoolId: string): Promise<Plane[]> => {
  const response = await api.get<{ data: Plane[] }>(
    `/planes?schoolId=${schoolId}`
  );
  return response.data.data;
};

// Se usa en PlaneItem.tsx y en AdminPlanes.tsx
export const deletePlane = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/planes/${id}`);
  return response.data;
};

// Se usa en AdminPlanes.tsx
export const createPlane = async (planeData: NewPlane): Promise<Plane> => {
  const response = await api.post<{ data: Plane }>(`/planes/add`, planeData);
  return response.data.data;
};

// Se usa en AdminPlanes.tsx pero está en desuso
export const updatePlanePhoto = async (
  id: string,
  formData: FormData
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    `/planes/${id}/photo`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

export const assignEmbeddedIdToPlane = async (
  planeId: string,
  idEmbebbed: string,
  schoolId?: string
): Promise<{ message: string }> => {
  try {
    const response = await api.put("/planes/assign-id", {
      planeId,
      idEmbebbed,
      schoolId,
    });
    return response.data;
  } catch (error) {
    if (
      error instanceof AxiosError &&
      error.response?.data?.message === "ID_ALREADY_ASSIGNED"
    ) {
      throw new Error("ID_ALREADY_ASSIGNED");
    }
    throw error;
  }
};

export const removeEmbeddedIdFromPlane = async (
  planeId: string
): Promise<{ message: string }> => {
  const response = await api.put("/planes/remove-id", {
    planeId,
  });
  return response.data;
};
