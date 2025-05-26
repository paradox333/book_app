 
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

 
export interface PaginatedBooksResponse {
  data: Book[];
  total: number;
  page: number;
  lastPage: number;
  limit: number;
}

/**
 * Representa una opción usada en los filtros (géneros, editoriales, autores…)
 */
export interface FilterOption<ID = string | number | null> {
  id: ID;
  nombre: string;
  deletedAt?: string | null;
}

export interface BookPayload {
    titulo: string;
    autorId: number;
    generoId: number;
    editorialId: number;
    precio: number;
    disponible: boolean;
    imagenUrl: string | undefined;
}

export interface UpdateBook{
  titulo?: string;
  autorId?: number;
  generoId?: number;
  precio?: number;
  editorialId?: number;
  disponible?: boolean;
  imagenUrl?: File | null;
}

export interface BookCompletePayload {
  titulo: string;
  autor: string;
  editorial: string;
  genero: string;
  precio: string;
  disponible: string;
  imagen?: File | null;
}