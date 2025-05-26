// src/components/BookList.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import useBookList from '../../hooks/useBookList';

const API_DEFAULT_BOOK_IMAGE = import.meta.env.VITE_DEFAULT_BOOK_IMAGE;


const BookList: React.FC = () => {
  const {
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
  } = useBookList();

  const frontendHost = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
  console.log(frontendHost+API_DEFAULT_BOOK_IMAGE)

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
          <option value="titulo:asc">Título (A-Z)</option>
          <option value="titulo:desc">Título (Z-A)</option>
          <option value="autor:asc">Autor (A-Z)</option>
          <option value="autor:desc">Autor (Z-A)</option>
        </select>
      </div>

      {/* Mensaje si no hay libros */}
      {books.length === 0 && !loadingBooks && !errorBooks ? (
        <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1em' }}>No se encontraron libros que coincidan con los criterios.</p>
      ) : (

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {books.map((book) => {
            // --- AQUÍ ESTÁ EL CAMBIO CLAVE PARA LA IMAGEN ---
            const imageUrl = book.imagenUrl ? frontendHost+book.imagenUrl
              : frontendHost+API_DEFAULT_BOOK_IMAGE; // Usa la imagen por defecto si no hay URL del libro
            // ------------------------------------------------

            return (
              <div key={book.id} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
                <img
                  src={imageUrl} // Usa la URL completa aquí
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
            );
          })}
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