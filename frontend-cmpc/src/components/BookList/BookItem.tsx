// src/features/books/components/BookItem.tsx
import React from 'react';
import { BookImage } from './BookImage';
import { BookActions } from './BookActions';
import type { Book } from '../../types/Book';
import { BookMetadata } from './BookMetadata';

interface BookItemProps {
  book: Book;
  onView: () => void;
  onEdit: () => void;
}

export const BookItem: React.FC<BookItemProps> = ({ book, onView, onEdit }) => {
  return (
    <div style={{
      border: '1px solid #ccc',
      padding: '15px',
      borderRadius: '8px',
      textAlign: 'center',
    }}>
      <BookImage src={book.imagenUrl} alt={book.titulo} />
      <BookMetadata book={book} />
      <BookActions onView={onView} onEdit={onEdit} />
    </div>
  );
};
