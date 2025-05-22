 
import React, { useState, useEffect } from 'react';
import type { BookQueryParams } from '../../types/Book';
import useDebounce from '../../hooks/useDebounce'; // Podrías usar debounce también para los filtros si hay muchos

interface BookFilterProps {
  onFilterChange: (filters: Partial<BookQueryParams>) => void;
  currentFilters: BookQueryParams;
}

const BookFilter: React.FC<BookFilterProps> = ({ onFilterChange, currentFilters }) => {
  const [genre, setGenre] = useState(currentFilters.genre || '');
  const [editorial, setEditorial] = useState(currentFilters.editorial || '');
  const [author, setAuthor] = useState(currentFilters.author || '');
  const [availability, setAvailability] = useState<string>(
    currentFilters.available === true ? 'available' :
    currentFilters.available === false ? 'unavailable' : ''
  );

 
  const genres = ['Ficción', 'Ciencia Ficción', 'Fantasia', 'Misterio', 'Historia', 'Biografía', 'Otro'];
  const editorials = ['Planeta', 'Penguin Random House', 'Anagrama', 'Seix Barral', 'Otro'];

  const handleApplyFilters = () => {
    onFilterChange({
      genre: genre || undefined,
      editorial: editorial || undefined,
      author: author || undefined,
      available: availability === 'available' ? true : availability === 'unavailable' ? false : undefined,
    });
  };

  const handleClearFilters = () => {
    setGenre('');
    setEditorial('');
    setAuthor('');
    setAvailability('');
    onFilterChange({
      genre: undefined,
      editorial: undefined,
      author: undefined,
      available: undefined,
    });
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
      <h3>Filtros</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        <div>
          <label htmlFor="filterGenre">Género:</label>
          <select id="filterGenre" value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">Todos</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filterEditorial">Editorial:</label>
          <select id="filterEditorial" value={editorial} onChange={(e) => setEditorial(e.target.value)}>
            <option value="">Todas</option>
            {editorials.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filterAuthor">Autor:</label>
          <input
            type="text"
            id="filterAuthor"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Nombre del autor"
          />
        </div>
        <div>
          <label htmlFor="filterAvailability">Disponibilidad:</label>
          <select id="filterAvailability" value={availability} onChange={(e) => setAvailability(e.target.value)}>
            <option value="">Todos</option>
            <option value="available">Disponible</option>
            <option value="unavailable">Prestado</option>
          </select>
        </div>
      </div>
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={handleApplyFilters}>Aplicar Filtros</button>
        <button onClick={handleClearFilters} style={{ backgroundColor: '#6c757d' }}>Limpiar Filtros</button>
      </div>
    </div>
  );
};

export default BookFilter;