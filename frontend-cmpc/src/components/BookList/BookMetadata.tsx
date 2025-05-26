// src/features/books/components/BookInfo.tsx
import React from 'react';
import type { Book } from '../../types/Book';

interface Props {
  book: Book;
}

export const BookMetadata: React.FC<Props> = ({ book }) => (
  <>
    <h3>{book.titulo}</h3>
    <p><strong>Autor:</strong> {book.autor}</p>
    <p><strong>Género:</strong> {book.genero}</p>
    <p><strong>Editorial:</strong> {book.editorial}</p>
    <p style={{ color: book.disponible ? 'green' : 'red' }}>
      <strong>Disponibilidad:</strong> {book.disponible ? 'Disponible' : 'Prestado'}
    </p>
  </>
);
