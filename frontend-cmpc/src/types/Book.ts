// src/types/Book.ts
export interface Libro {
  id: string;
  titulo: string;
  autor: string;
  genero: string;
  editorial: string;
  imagenUrl?: string;
  disponible: boolean;
  deletedAt: string;
}

export interface LibroResponse {
    id: number,
    titulo: string,
    autorId: number,
    editorialId:number,
    generoId:number,
    precio:number
    imagenUrl?: string,
    disponible:boolean,
}
export interface Book {
  id: string;
  titulo: string;
  autor: string;
  genero: string;
  precio: number;
  editorial: string;
  disponible: boolean;
  imagenUrl?: string;
  deletedAt: string;
}

// Interfaz para los parámetros de filtro/ordenamiento/paginación
export interface BookQueryParams {
  page?: number;
  limit?: number; // Cantidad de elementos por página
  genre?: string;
  editorial?: string;
  author?: string;
  available?: boolean; // Para filtrar por disponibilidad
  sortBy?: string; // Campo por el que ordenar (ej. 'title', 'author', 'publishedYear')
  sortOrder?: 'asc' | 'desc'; // Dirección del ordenamiento
  search?: string; // Término de búsqueda
}

// Interfaz para la respuesta de la API de listado paginado
export interface PaginatedBooksResponse {
  data: Book[];
  total: number;
  page: number;
  lastPage: number;
  limit: number;
}