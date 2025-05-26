// src/features/books/components/BookImage.tsx
import React from 'react';

interface Props {
  src?: string;
  alt: string;
}

export const BookImage: React.FC<Props> = ({ src, alt }) => {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        borderRadius: '4px',
        marginBottom: '10px',
      }}
    />
  );
};
