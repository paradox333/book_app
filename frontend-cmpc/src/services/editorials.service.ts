import { api } from './api';

export const EditorialService = {
  getAll: async (token: string | null) => {
    return await api.get<any>(`/editoriales`, { headers: { Authorization: `Bearer ${token}` } });

  },

  create: async (nombre: string, token: string | null) => {
    const res = await api.post(`/editoriales`, { nombre }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
};
