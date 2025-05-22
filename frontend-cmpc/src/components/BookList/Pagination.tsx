 
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (totalPages <= 1) return null; // No mostrar paginación si solo hay una página

  return (
    <div style={{ marginTop: '30px', textAlign: 'center' }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{ marginRight: '10px' }}
      >
        Anterior
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            margin: '0 5px',
            backgroundColor: currentPage === page ? '#007bff' : '#f0f0f0',
            color: currentPage === page ? 'white' : '#333',
            border: currentPage === page ? '1px solid #007bff' : '1px solid #ccc',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{ marginLeft: '10px' }}
      >
        Siguiente
      </button>
    </div>
  );
};

export default Pagination;