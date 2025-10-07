import { useState } from 'react';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.username && formData.password) {
      if (formData.username === 'admin' && formData.password === 'frozen2025') {
        onLogin(true);
      } else {
        alert('Credenciales incorrectas. Usa: admin / frozen2025');
      }
    } else {
      alert('Por favor complete todos los campos.');
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
            />
          </div>
          
          <button type="submit" className="login-btn">
            <i className="fas fa-sign-in-alt"></i> Ingresar
          </button>
        </form>
        
        <div className="login-info">
          <p><strong>Demo:</strong> admin / frozen2025</p>
        </div>
      </div>
    </div>
  );
};

export default Login;