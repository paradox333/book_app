 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Added loading state for button

  const { login } = useAuth(); // Destructure the login function from your AuthContext
  const navigate = useNavigate(); // To redirect after successful login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    setErrorMessage(null); // Clear previous errors

    try {
      const success = await login(email, password);
      if (success) {
 
 
      } else {
 
 
        setErrorMessage('Credenciales inválidas o error de red.'); // Generic error if no specific message from AuthContext
      }
    } catch (error) {
 
 
      console.error('Error during login attempt:', error);
      setErrorMessage('Ocurrió un error inesperado al intentar iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email" // Helps browsers with autofill
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password" // Helps browsers with autofill
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;