import { api } from './api';

export const GenreService = {
  getAll: async (token: string | null) => {
    return await api.get<any>(`/generos`, { headers: { Authorization: `Bearer ${token}` } });
  },

  create: async (nombre: string, token: string | null) => {
    const res = await api.post(`/generos`, { nombre }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
};
