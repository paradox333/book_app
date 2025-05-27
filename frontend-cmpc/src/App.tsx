 
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import AuthProvider, { useAuth } from './context/AuthContext';
 

import BookList from './components/BookList/BookList';
import BookForm from './components/BookForm/BookForm';
import BookDetails from './components/BookDetails/BookDetails';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';

 
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando autenticación...</div>;
  }

  return token ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  const { token, logout } = useAuth();

  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/">Inicio</Link></li>
          {!token && <li><Link to="/login">Login</Link></li>}
          {!token && <li><Link to="/register">Registro</Link></li>}
          {token && <li><Link to="/books">Libros</Link></li>}
          {token && <li><Link to="/books/new">Nuevo Libro</Link></li>}
          {token && <li><button onClick={logout}>Cerrar Sesión</button></li>}
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<h1>Bienvenido a la Biblioteca Digital!</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/books"
          element={
            <PrivateRoute>
              <BookList />
            </PrivateRoute>
          }
        />
        <Route
          path="/books/new"
          element={
            <PrivateRoute>
              <BookForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/books/edit/:id"
          element={
            <PrivateRoute>
              <BookForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/books/:id"
          element={
            <PrivateRoute>
              <BookDetails />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;