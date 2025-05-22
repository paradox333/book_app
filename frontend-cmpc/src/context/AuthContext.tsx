// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.API_BASE_URL;

if (!API_BASE_URL) {
  console.error('Error: La variable de entorno API_BASE_URL no está definida.');
}

interface User {
  userId: string;
  email: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// CAMBIO AQUI: Ahora es una exportación por defecto
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserFromToken = () => {
      setIsLoading(true);
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const decodedPayload = JSON.parse(atob(token.split('.')[1]));
          setUser({ userId: decodedPayload.sub, email: decodedPayload.email });
        } catch (error) {
          console.error('Error al decodificar el token JWT desde localStorage:', error);
          logout();
        }
      } else {
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      }
      setIsLoading(false);
    };

    loadUserFromToken();
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const newToken = response.data.access_token;
      setToken(newToken);
      localStorage.setItem('jwt_token', newToken);

      const decodedPayload = JSON.parse(atob(newToken.split('.')[1]));
      setUser({ userId: decodedPayload.sub, email: decodedPayload.email });

      navigate('/books');
      return true;
    } catch (error: any) {
      console.error('Error de login:', error.response?.data?.message || error.message);
      alert(`Error de login: ${error.response?.data?.message || 'Error desconocido'}`);
      logout();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwt_token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};


// useAuth se sigue exportando como nombrado
export default AuthProvider;

// useAuth se sigue exportando como nombrado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};