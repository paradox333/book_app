// src/features/books/components/BookActions.tsx
import React from 'react';

interface Props {
  onView: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

export const BookActions: React.FC<Props> = ({ onView, onEdit }) => (
  <div>
    <button onClick={onView} style={{ marginRight: '10px' }}>Ver Detalles</button>
    <button onClick={onEdit}>Editar</button>
  </div>
);
