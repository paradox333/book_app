import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Book } from '../types/Book';
import { BookService } from '../services/books.service';

export function useBookDetails() {
  const { id } = useParams<{ id: string }>();
  const { token, logout } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchBook = async () => {
      if (!token || !id) {
        setError('Acceso no autorizado o ID inválido.');
        setLoading(false);
        return;
      }

      try {
        const data = await BookService.getByIdFilter(id, token);
        console.log('data', data)
        setBook(data);
      } catch (err: any) {
        if (err.response?.status === 401) logout();
        setError(err.response?.data?.message || 'Error al obtener el libro');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, token, logout]);
  return { book, loading, error, navigate };
}
