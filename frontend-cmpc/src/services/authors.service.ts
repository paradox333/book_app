import { api } from './api';

export const AuthorService = {
  getAll: async (token: string | null) => {
    return await api.get<any>(`/autores`, { headers: { Authorization: `Bearer ${token}` } });

  },

  create: async (nombre: string, token: string | null) => {
    const res = await api.post(`/autores`, { nombre }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

};
