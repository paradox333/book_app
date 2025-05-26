// src/features/books/pages/BookDetails.tsx
import React from 'react';
import { BookInfo } from './BookInfo';
import { useBookDetails } from '../../hooks/useBookDetails';

const BookDetails: React.FC = () => {
  const { book, loading, error, navigate } = useBookDetails();

  if (loading) return <div>Cargando detalles del libro...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!book) return <div>Libro no encontrado.</div>;

  return (
    <BookInfo
      book={book}
      onEdit={() => navigate(`/books/edit/${book.id}`)}
      onBack={() => navigate('/books')}
    />
  );
};

export default BookDetails;
