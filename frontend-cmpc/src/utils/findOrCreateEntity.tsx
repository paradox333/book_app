import axios from 'axios';
import type { FilterOption } from '../types/Book';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const findOrCreateEntity = async (
  entityType: 'autores' | 'generos' | 'editoriales',
  entityName: string,
  existingOptions: FilterOption[],
  token: null | string
): Promise<string | number | null> => {
  const trimmed = entityName.trim().toLowerCase();
  const existing = existingOptions.find(opt => opt.nombre.toLowerCase() === trimmed);
  if (existing) return existing.id;

  try {
    const res = await axios.post(`${API_BASE_URL}/${entityType}`, { nombre: trimmed }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.id;
  } catch (err) {
    console.error(`Error al crear ${entityType}`, err);
    return null;
  }
};
