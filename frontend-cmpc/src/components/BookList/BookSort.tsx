 
import React from 'react';

interface BookSortProps {
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  currentSortBy?: string;
  currentSortOrder?: 'asc' | 'desc';
}

const BookSort: React.FC<BookSortProps> = ({ onSortChange, currentSortBy, currentSortOrder }) => {
  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value, currentSortOrder || 'asc');
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(currentSortBy || 'title', e.target.value as 'asc' | 'desc');
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
      <h3>Ordenar por:</h3>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div>
          <label htmlFor="sortBy">Campo:</label>
          <select id="sortBy" value={currentSortBy || 'title'} onChange={handleSortByChange}>
            <option value="title">Título</option>
            <option value="author">Autor</option>
            <option value="publishedYear">Año de Publicación</option>
            {/* Agrega más opciones según tus campos de Book */}
          </select>
        </div>
        <div>
          <label htmlFor="sortOrder">Dirección:</label>
          <select id="sortOrder" value={currentSortOrder || 'asc'} onChange={handleSortOrderChange}>
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BookSort;