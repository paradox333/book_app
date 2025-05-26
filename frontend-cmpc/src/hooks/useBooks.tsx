// src/features/books/hooks/useBooks.ts
import { useState, useEffect, useCallback } from 'react';
import type { Libro } from '../types/Book';
import { BookService } from '../services/books.service';
import debounce from 'lodash.debounce';

export const useBooks = () => {
  // estado UI
  const [books, setBooks] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // criterios
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    editorial: '',
    author: '',
    available: '',
    sortBy: 'title',
    sortOrder: 'asc',
  });

  // traer datos
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await BookService.list({ page, limit, search, ...filters });
      setBooks(data.data);
      // Puedes exponer lastPage, total, etc.
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Error al cargar libros');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filters]);

  // debounce al buscar
  const debouncedSearch = useCallback(
    debounce((q: string) => {
      setSearch(q);
      setPage(1);
    }, 500),
    [],
  );

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  return {
    books,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    filters,
    setFilters,
    debouncedSearch,
    refetch: fetchBooks,
  };
};
