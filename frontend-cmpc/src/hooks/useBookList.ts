  
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { useAuth } from '../context/AuthContext';
import { AuthorService } from '../services/authors.service';
import { EditorialService } from '../services/editorials.service';
import { GenreService } from '../services/genres.service';
import { BookService } from '../services/books.service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('Error: La variable de entorno API_BASE_URL no está definida.');
}

interface Libro {
  id: string;
  titulo: string;
  autor: string;
  genero: string;
  editorial: string;
  disponible: boolean;
  imagenUrl?: string;
  deletedAt: string;
}

interface PaginatedBooksResponse {
  data: Libro[];
  total: number;
  page: number;
  lastPage: number;
  limit: number;
}

 
 
interface FilterOption {
  id: number; // O string, dependiendo de tu backend si es UUID o numérico
  nombre: string;
  titulo: string;
  deletedAt?: string | null; // Opcional si existe
}


export const useBookList = () => {

  const { token } = useAuth();
  const [books, setBooks] = useState<Libro[]>([]);
  const [loadingBooks, setLoadingBooks] = useState<boolean>(true);
  const [errorBooks, setErrorBooks] = useState<string | null>(null);

 
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [lastPage, setLastPage] = useState<number>(1);

 
  const [search, setSearch] = useState<string>('');
  const [genreFilter, setGenreFilter] = useState<string>('');
  const [editorialFilter, setEditorialFilter] = useState<string>('');
  const [authorFilter, setAuthorFilter] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('');

 
  const [sortBy, setSortBy] = useState<string>('titulo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

 
  const [fetchedGenres, setFetchedGenres] = useState<FilterOption[]>([]);
  const [fetchedEditorials, setFetchedEditorials] = useState<FilterOption[]>([]);
  const [fetchedAuthors, setFetchedAuthors] = useState<FilterOption[]>([]);
  const [loadingFilters, setLoadingFilters] = useState<boolean>(true);
  const [errorFilters, setErrorFilters] = useState<string | null>(null);

 
  const fetchBooks = useCallback(async () => {
    if (!token) {
      setLoadingBooks(false);
      setErrorBooks('No autenticado. Por favor, inicie sesión.');
      return;
    }

    setLoadingBooks(true);
    setErrorBooks(null);

    try {
      const params = {
        pages: page,
        limit,
        titulo: search || undefined,
        genero: genreFilter || undefined,
        editorial: editorialFilter || undefined,
        autor: authorFilter || undefined,
        disponible: availabilityFilter !== '' ? availabilityFilter : undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      };

      const response = await axios.get<PaginatedBooksResponse>(`${API_BASE_URL}/libros`, { params });
      setBooks(response.data.data);
      setTotalBooks(response.data.total);
      setPage(response.data.page);
      setLastPage(response.data.lastPage);
      setLimit(response.data.limit);
    } catch (err: any) {
      console.error('Error al obtener libros:', err.response?.data?.message || err.message);
      setErrorBooks('Error al cargar los libros. Inténtelo de nuevo.');
    } finally {
      setLoadingBooks(false);
    }
  }, [
    token, page, limit, search, genreFilter, editorialFilter,
    authorFilter, availabilityFilter, sortBy, sortOrder
  ]);

 
  useEffect(() => {
    const fetchFilterData = async () => {
      if (!token) {
        setLoadingFilters(false);
        return;
      }
      setLoadingFilters(true);
      setErrorFilters(null);
      try {
        const [genresRes, editorialsRes, authorsRes] = await Promise.all([
          GenreService.getAll(token),
          EditorialService.getAll(token),
          AuthorService.getAll(token)
        ]);

 

 
        setFetchedGenres(genresRes.data || []);

 
        setFetchedEditorials(editorialsRes.data.data || []);
        setFetchedAuthors(authorsRes.data.data || []);

      } catch (err: any) {
        console.error('Error al obtener datos de filtros:', err.response?.data?.message || err.message);
        setErrorFilters('Error al cargar opciones de filtro. Inténtelo de nuevo.');
        setFetchedGenres([]);
        setFetchedEditorials([]);
        setFetchedAuthors([]);
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchFilterData();
  }, [token]);

 
 
  const debouncedSearch = useCallback(
    debounce((nextValue: string) => {
      setSearch(nextValue);
      setPage(1);
    }, 500),
    []
  );

 
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

 
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= lastPage) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, order] = e.target.value.split(':');
    setSortBy(field);
    setSortOrder(order as 'asc' | 'desc');
    setPage(1);
  };

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este libro?')) {
      return;
    }
    try {
      setLoadingBooks(true);
      await BookService.delete(id, token)
      alert('Libro eliminado exitosamente.');
      fetchBooks();
    } catch (err: any) {
      console.error('Error al eliminar libro:', err.response?.data?.message || err.message);
      setErrorBooks('Error al eliminar el libro. Inténtelo de nuevo.');
      setLoadingBooks(false);
    }
  };

  return {
    token,
    loadingBooks,
    books,
    errorBooks,
    handleSearchChange,
    genreFilter,
    setGenreFilter,
    setPage,
    loadingFilters,
    errorFilters,
    fetchedGenres,
    editorialFilter,
    setEditorialFilter,
    fetchedEditorials,
    authorFilter,
    setAuthorFilter,
    fetchedAuthors,
    availabilityFilter,
    setAvailabilityFilter,
    sortBy,
    page,   
    lastPage,
    sortOrder,
    handleSortChange,
    handleDeleteBook,
    handlePageChange,
    limit,
    handleLimitChange
  }
}

export default useBookList;