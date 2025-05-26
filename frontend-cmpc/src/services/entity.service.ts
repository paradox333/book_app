import { api } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const EntityService = {
    
  create: async (nombre: string, token: string | null, entityType: string) => {

    const res = await api.post<{ id: number; nombre: string }>(
        `${API_BASE_URL}/${entityType}`,
        { nombre: nombre },
        { headers: { Authorization: `Bearer ${token}` } }
      );
 
      return res.data.id;
  }
};
