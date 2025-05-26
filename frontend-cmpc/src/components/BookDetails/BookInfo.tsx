// src/features/books/components/BookInfo.tsx
import React from 'react';
import type { Book } from '../../types/Book';

type Props = {
  book: Book;
  onEdit: () => void;
  onBack: () => void;
};

export const BookInfo: React.FC<Props> = ({ book, onEdit, onBack }) => (
  <div>
    <button onClick={onBack} style={{ marginBottom: '20px' }}>
      Volver a la Lista de Libros
    </button>
    <h2>Detalles de "{book.titulo}"</h2>
    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
      {book.imagenUrl && (
        <img src={book.imagenUrl} alt={book.titulo} style={{ maxWidth: '300px', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} />
      )}
      <div>
        <p><strong>Autor:</strong> {book.autor}</p>
        <p><strong>Género:</strong> {book.genero}</p>
        <p><strong>Editorial:</strong> {book.editorial}</p>
        <p style={{ color: book.disponible ? 'green' : 'red' }}>
          <strong>Disponibilidad:</strong> {book.disponible ? 'Disponible' : 'Prestado'}
        </p>
        <button onClick={onEdit} style={{ marginTop: '20px' }}>
          Editar Libro
        </button>
      </div>
    </div>
  </div>
);
