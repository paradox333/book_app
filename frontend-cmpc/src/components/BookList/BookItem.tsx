 
import React from 'react';
import type { Book } from '../../types/Book';

interface BookItemProps {
  book: Book;
  onView: () => void;
  onEdit: () => void;
 
}

const BookItem: React.FC<BookItemProps> = ({ book, onView, onEdit }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
      {book.imagenUrl && (
        <img src={book.imagenUrl} alt={book.titulo} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} />
      )}
      <h3>{book.titulo}</h3>
      <p><strong>Autor:</strong> {book.autor}</p>
      <p><strong>Género:</strong> {book.genero}</p>
      <p><strong>Editorial:</strong> {book.editorial}</p>
      <p style={{ color: book.disponible ? 'green' : 'red' }}>
        <strong>Disponibilidad:</strong> {book.disponible ? 'Disponible' : 'Prestado'}
      </p>
      <button onClick={onView} style={{ marginRight: '10px' }}>Ver Detalles</button>
      <button onClick={onEdit}>Editar</button>
      {/* <button onClick={onDelete} style={{ backgroundColor: 'red' }}>Eliminar</button> */}
    </div>
  );
};

export default BookItem;