 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import type { Book } from '../../types/Book';

const API_BASE_URL = 'http://localhost:3000'; // Confirma esta URL

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Obtiene el ID del libro de la URL
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      if (!token) {
        setError('No autenticado. Por favor, inicia sesión.');
        setLoading(false);
        return;
      }
      if (!id) {
        setError('ID de libro no proporcionado.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<Book>(`${API_BASE_URL}/books/${id}`);
        setBook(response.data);
      } catch (err: any) {
        console.error('Error al cargar detalles del libro:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Error al cargar detalles del libro.');
        if (err.response && err.response.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, token, logout]); // Dependencias: re-fetch si ID o token cambian

  if (loading) {
    return <div>Cargando detalles del libro...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!book) {
    return <div>Libro no encontrado.</div>;
  }

  return (
    <div>
      <button onClick={() => navigate('/books')} style={{ marginBottom: '20px' }}>
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
          <button onClick={() => navigate(`/books/edit/${book.id}`)} style={{ marginTop: '20px' }}>
            Editar Libro
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;