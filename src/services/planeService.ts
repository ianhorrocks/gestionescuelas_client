import api from "./api";
import { Plane, NewPlane } from "../types/types";

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
