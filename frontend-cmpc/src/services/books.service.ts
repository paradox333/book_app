import type { Book, BookCompletePayload, BookPayload, FilterOption, LibroResponse, PaginatedBooksResponse, UpdateBook } from '../types/Book';
import { api } from './api';

export const BookService = {
  getAll: async (token: string | null): Promise<Book[]> => {
    const res = await api.get<Book[]>(`/libros`,{
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  getById: async (id: string, token: string | null): Promise<LibroResponse> => {
    const res = await api.get<LibroResponse>(`/libros/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  getByIdFilter: async (id: string, token: string | null): Promise<Book> => {
    const res = await api.get(`/libros`, {
      params: {id},
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data[0];
  },

  list: async (
    params: { page?: number; id?: string, limit?: number; titulo?: string; autor?: string; genero?: string; editorial?: string },
    token: string | null
  ): Promise<PaginatedBooksResponse> => {
    const res = await api.get<PaginatedBooksResponse>('/libros', {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  create: async (body: BookPayload, token: string | null) => {
    const res = await api.post('/libros', body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  update: async (id: string, data: UpdateBook, token: string | null) => {
    try{
      
      const res = await api.patch<Book>(`/libros/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    }catch(err){
      console.log(err)
      return 
    }
  },

  delete: async (id: string, token: string | null): Promise<void> => {
    await api.delete(`/libros/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Si necesitas los filtros para dropdowns, etc.
  filters: (token: string | null) =>
    Promise.all([
      api.get<FilterOption[]>('/generos', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      api.get<FilterOption[]>('/editoriales', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      api.get<FilterOption[]>('/autores', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]),

  // src/services/libros.service.ts

// Suponiendo que BookCompletePayload es LibroFormValues,
// ajusta el tipo si es necesario.


createComplete: async (body: BookCompletePayload, token: string | null) => {

    const formData = new FormData();


    formData.append('titulo', body.titulo);
    formData.append('autor', body.autor);
    formData.append('editorial', body.editorial);
    formData.append('genero', body.genero);
    // Asegúrate de que el precio y disponible sean strings
    formData.append('precio', body.precio.toString());
    formData.append('disponible', body.disponible.toString());

    if (body.imagen instanceof File) { 
      formData.append('imagen', body.imagen); 
    } 
  

    try {
      const res = await api.post('/libros/complete', formData,{
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      return res.data;
    } catch (err: any) {
      console.error('Error creando libro completo (frontend):', err);
      // Más logging detallado para depuración
      throw err;
    }
},
};
