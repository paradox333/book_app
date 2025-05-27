import { api } from './api';

interface RegisterPayload {
  email: string;
  password: string; // Nota: en el frontend será el hash
  nombre: string;
}

interface RegisterResponse {
  acceess: string;
  userId: string;
  // Añade cualquier otra propiedad que tu API devuelva
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const usuariosService = {
    
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    try {
      const response = await api.post<RegisterResponse>(`${API_BASE_URL}/usuarios`, payload);
      return response.data;
    } catch (error) {
      if (api != undefined ) {
        throw new Error('Error desconocido al registrar.');
      } else {
        console.error('Error inesperado:', error);
        throw new Error('Ocurrió un error inesperado.');
      }
    }
  },
};