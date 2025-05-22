// src/components/BookList/BookList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import debounce from 'lodash.debounce';

const API_BASE_URL = import.meta.env.API_BASE_URL;
const API_DEFAULT_BOOK_IMAGE = import.meta.env.DEFAULT_BOOK_IMAGE;

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

// Interfaz para las opciones de filtro (géneros, editoriales, autores)
// Basado en tu respuesta, los objetos tienen 'id' y 'nombre'
interface FilterOption {
  id: number; // O string, dependiendo de tu backend si es UUID o numérico
  nombre: string;
  deletedAt?: string | null; // Opcional si existe
}

const BookList: React.FC = () => {
  const { token } = useAuth();
  const [books, setBooks] = useState<Libro[]>([]);
  const [loadingBooks, setLoadingBooks] = useState<boolean>(true);
  const [errorBooks, setErrorBooks] = useState<string | null>(null);

  // Estados de Paginación
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [lastPage, setLastPage] = useState<number>(1);

  // Estados de Filtros
  const [search, setSearch] = useState<string>('');
  const [genreFilter, setGenreFilter] = useState<string>('');
  const [editorialFilter, setEditorialFilter] = useState<string>('');
  const [authorFilter, setAuthorFilter] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('');

  // Estados de Ordenamiento
  const [sortBy, setSortBy] = useState<string>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // --- ESTADOS para los datos de filtros dinámicos (obtenidos del backend) ---
  const [fetchedGenres, setFetchedGenres] = useState<FilterOption[]>([]);
  const [fetchedEditorials, setFetchedEditorials] = useState<FilterOption[]>([]);
  const [fetchedAuthors, setFetchedAuthors] = useState<FilterOption[]>([]);
  const [loadingFilters, setLoadingFilters] = useState<boolean>(true);
  const [errorFilters, setErrorFilters] = useState<string | null>(null);

  // Función para obtener libros
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
        search: search || undefined,
        genre: genreFilter || undefined,
        editorial: editorialFilter || undefined,
        author: authorFilter || undefined,
        available: availabilityFilter !== '' ? availabilityFilter : undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      };

      const response = await axios.get<PaginatedBooksResponse>(`${API_BASE_URL}/libros`, { params });
      console.log(response)
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

  // --- EFECTO para obtener los datos de los filtros (géneros, editoriales, autores) ---
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
          axios.get<any>(`${API_BASE_URL}/generos`),
          axios.get<any>(`${API_BASE_URL}/editoriales`),
          axios.get<any>(`${API_BASE_URL}/autores`),
        ]);

        // --- AJUSTES BASADOS EN LAS RESPUESTAS DE TU BACKEND ---

        // Géneros: La respuesta es directamente un array de objetos
        setFetchedGenres(genresRes.data || []);

        // Editoriales y Autores: La respuesta es un objeto con una propiedad 'data'
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

  // Debounce para la búsqueda general
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((nextValue: string) => {
      setSearch(nextValue);
      setPage(1);
    }, 500),
    []
  );

  // Efecto que se ejecuta para cargar los libros cuando cambian los filtros o la paginación
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Manejadores de eventos
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
      await axios.delete(`${API_BASE_URL}/books/${id}`); // Asumiendo que el endpoint DELETE es /books/:id
      alert('Libro eliminado exitosamente.');
      fetchBooks();
    } catch (err: any) {
      console.error('Error al eliminar libro:', err.response?.data?.message || err.message);
      setErrorBooks('Error al eliminar el libro. Inténtelo de nuevo.');
      setLoadingBooks(false);
    }
  };

  // Mostrar mensajes de estado
  if (!token) return <div style={{ color: 'orange', textAlign: 'center', padding: '20px' }}>Debes iniciar sesión para ver los libros.</div>;
  if (loadingBooks && books.length === 0) return <div>Cargando libros...</div>;
  if (errorBooks) return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>Error: {errorBooks}</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Listado de Libros</h2>

      {/* Sección de Búsqueda */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#fff' }}>
        <input
          type="text"
          placeholder="Buscar por título, autor, descripción..."
          onChange={handleSearchChange}
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
      </div>

      {/* Controles de Filtro y Ordenamiento */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#fff' }}>
        {/* Filtro por Género (ahora dinámico) */}
        <select value={genreFilter} onChange={(e) => { setGenreFilter(e.target.value); setPage(1); }}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={loadingFilters}>
          <option value="">Filtrar por Género</option>
          {loadingFilters && <option disabled>Cargando géneros...</option>}
          {errorFilters && <option disabled>Error cargando géneros</option>}
          {fetchedGenres.map(genre => (
            <option key={genre.id} value={genre.nombre}>{genre.nombre}</option>
          ))}
        </select>

        {/* Filtro por Editorial (ahora dinámico) */}
        <select value={editorialFilter} onChange={(e) => { setEditorialFilter(e.target.value); setPage(1); }}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={loadingFilters}>
          <option value="">Filtrar por Editorial</option>
          {loadingFilters && <option disabled>Cargando editoriales...</option>}
          {errorFilters && <option disabled>Error cargando editoriales</option>}
          {fetchedEditorials.map(editorial => (
            <option key={editorial.id} value={editorial.nombre}>{editorial.nombre}</option>
          ))}
        </select>

        {/* Filtro por Autor (ahora dinámico) */}
        <select value={authorFilter} onChange={(e) => { setAuthorFilter(e.target.value); setPage(1); }}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={loadingFilters}>
          <option value="">Filtrar por Autor</option>
          {loadingFilters && <option disabled>Cargando autores...</option>}
          {errorFilters && <option disabled>Error cargando autores</option>}
          {fetchedAuthors.map(author => (
            <option key={author.id} value={author.nombre}>{author.nombre}</option>
          ))}
        </select>

        <select value={availabilityFilter} onChange={(e) => { setAvailabilityFilter(e.target.value); setPage(1); }}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="">Disponibilidad</option>
          <option value="true">Disponible</option>
          <option value="false">No Disponible</option>
        </select>

        <select value={`${sortBy}:${sortOrder}`} onChange={handleSortChange}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="title:asc">Título (A-Z)</option>
          <option value="title:desc">Título (Z-A)</option>
          <option value="author:asc">Autor (A-Z)</option>
          <option value="author:desc">Autor (Z-A)</option>
          <option value="publishedYear:desc">Año Publicación (Desc)</option>
          <option value="publishedYear:asc">Año Publicación (Asc)</option>
        </select>
      </div>

      {/* Mensaje si no hay libros */}
      {books.length === 0 && !loadingBooks && !errorBooks ? (
        <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1em' }}>No se encontraron libros que coincidan con los criterios.</p>
      ) : (
        // Listado de Libros
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {books.map((book) => (
            <div key={book.id} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
              <img
                src={book.imagenUrl ?? API_DEFAULT_BOOK_IMAGE}
                alt={book.titulo}
                style={{ width: '100%', height: '250px', objectFit: 'cover', borderBottom: '1px solid #eee' }}
                onError={(e) => { e.currentTarget.src = API_DEFAULT_BOOK_IMAGE; }}
              />
              <div style={{ padding: '15px', flexGrow: 1 }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{book.titulo}</h3>
                <p style={{ margin: '0 0 5px 0', color: '#555', fontSize: '0.9em' }}>Autor: {book.autor}</p>
                <p style={{ margin: '0 0 5px 0', color: '#555', fontSize: '0.9em' }}>Género: {book.genero}</p>
                <p style={{ margin: '0 0 5px 0', color: '#555', fontSize: '0.9em' }}>Editorial: {book.editorial}</p>
                <p style={{ margin: '0 0 5px 0', color: '#555', fontSize: '0.9em' }}>Disponibilidad: {book.disponible ? '✅ Sí' : '❌ No'}</p>
              </div>
              <div style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', gap: '10px' }}>
                <Link to={`/books/${book.id}`} style={{ textDecoration: 'none', padding: '8px 12px', backgroundColor: '#28a745', color: 'white', borderRadius: '5px', fontSize: '0.9em', display: 'inline-block' }}>Ver Detalles</Link>
                <Link to={`/books/edit/${book.id}`} style={{ textDecoration: 'none', padding: '8px 12px', backgroundColor: '#ffc107', color: 'black', borderRadius: '5px', fontSize: '0.9em', display: 'inline-block' }}>Editar</Link>
                <button onClick={() => handleDeleteBook(book.id)}
                        style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9em' }}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controles de Paginación */}
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1 || loadingBooks}
                style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Anterior
        </button>
        <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>Página {page} de {lastPage}</span>
        <button onClick={() => handlePageChange(page + 1)} disabled={page === lastPage || loadingBooks}
                style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Siguiente
        </button>

        <select value={limit} onChange={handleLimitChange} disabled={loadingBooks}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value={5}>5 por página</option>
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
        </select>
      </div>
    </div>
  );
};

export default BookList;