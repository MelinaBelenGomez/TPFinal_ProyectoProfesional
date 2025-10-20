import { useState } from 'react';
import AuthService from '../services/authService';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.username || !formData.password) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    
    try {
      const response = await AuthService.login({
        username: formData.username,
        password: formData.password
      });

      if (response.success) {
        // Login exitoso
        const userData = {
          isAuthenticated: true,
          ...response.data.user,
          token: response.data.token
        };
        
        onLogin(userData);
      } else {
        // Error en login
        setError(response.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h1 className="logo">FROZEN</h1>
        <span className="byline">BY 5HERTZ</span>
      </div>
      
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <p>Accede al Sistema de Gestión</p>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="username">
              <i className="fas fa-user"></i> Usuario
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ingrese su usuario"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i> Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingrese su contraseña"
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Iniciando sesión...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i> Ingresar
              </>
            )}
          </button>
        </form>
        
        <div className="login-info">
          <p><strong>Contraseña para todos:</strong> frozen2025</p>
          <hr style={{margin: '0.5rem 0', border: '1px solid #e9ecef'}} />
          <p><strong>Admin:</strong> admin</p>
          <p><strong>Empleado:</strong> empleado</p>
          <p><strong>Lavado:</strong> operario_lavado</p>
          <p><strong>Clasificación:</strong> operario_clasificacion</p>
          <p><strong>Pelado:</strong> pelado_trozado</p>
          <p><strong>Escurrido:</strong> operario_escurrido</p>
          <p><strong>Congelación:</strong> operario_congelacion</p>
          <p><strong>Empaquetado:</strong> operario_empaquetado</p>
        </div>
      </div>
    </div>
  );
};

export default Login;