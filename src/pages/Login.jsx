import { useState, useEffect } from 'react';
import AuthService from '../services/authService';
import UserManagementService from '../services/userManagementServiceReal';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testCredsLoaded, setTestCredsLoaded] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    nombre: '',
    email: '',
    rol: 'OPERARIO',
    estacion_asignada: ''
  });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!newUser.username || !newUser.password) {
      setCreateError('Ingrese usuario y contraseña para crear la cuenta');
      return;
    }

    setCreating(true);
    try {
      const resp = await UserManagementService.createUser(newUser);
      if (resp.success) {
        // Intentar login automático con las credenciales creadas
        const loginResp = await AuthService.login(newUser.username, newUser.password);
        if (loginResp.success) {
          const userData = { isAuthenticated: true, ...loginResp.user };
          onLogin(userData);
        } else {
          // Prefill login form para que el usuario inicie sesión manualmente
          setFormData({ username: newUser.username, password: newUser.password });
          setTestCredsLoaded(true);
          setCreateMode(false);
        }
      } else {
        setCreateError(resp.message || 'Error al crear usuario');
      }
    } catch (err) {
      console.error('Error creando usuario:', err);
      setCreateError('Error de conexión al crear usuario');
    } finally {
      setCreating(false);
    }
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
      const response = await AuthService.login(formData.username, formData.password);

      if (response.success) {
        // Login exitoso
        const userData = {
          isAuthenticated: true,
          ...response.user
        };
        
        onLogin(userData);
        // Si venimos de credenciales de prueba, eliminarlas
        try {
          sessionStorage.removeItem('lastCreatedUser');
        } catch (err) {
          // silencioso
        }
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

  useEffect(() => {
    try {
      const item = sessionStorage.getItem('lastCreatedUser');
      if (item) {
        const parsed = JSON.parse(item);
        setFormData({
          username: parsed.username || '',
          password: parsed.password || ''
        });
        setTestCredsLoaded(true);
      }
    } catch (err) {
      // ignore parse errors
    }
  }, []);

  return (
    <div className="login-container">
      <div className="login-header">
        <h1 className="logo">FROZEN</h1>
        <span className="byline">BY 5HERTZ</span>
      </div>
      
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <p>Accede al Sistema de Gestión</p>
        {testCredsLoaded && (
          <div className="test-creds-notice" style={{background: '#f6ffed', border: '1px solid #d9f7be', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px'}}>
            Credenciales de prueba cargadas en el formulario. Se eliminarán después del login.
          </div>
        )}

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

        <div style={{textAlign: 'center', marginTop: '1rem'}}>
          <button type="button" className="link-button" onClick={() => setCreateMode(!createMode)}>
            {createMode ? 'Volver al login' : 'Crear cuenta nueva'}
          </button>
        </div>

        {createMode && (
          <div className="create-card" style={{marginTop: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '6px'}}>
            <h3>Crear nueva cuenta</h3>
            {createError && <div className="error-message">{createError}</div>}
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label>Usuario</label>
                <input name="username" value={newUser.username} onChange={handleCreateChange} />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input type="password" name="password" value={newUser.password} onChange={handleCreateChange} />
              </div>
              <div className="form-group">
                <label>Nombre</label>
                <input name="nombre" value={newUser.nombre} onChange={handleCreateChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" value={newUser.email} onChange={handleCreateChange} />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select name="rol" value={newUser.rol} onChange={handleCreateChange}>
                  <option value="ADMIN">Administrador</option>
                  <option value="JEFE_PRODUCCION">Jefe Producción</option>
                  <option value="OPERARIO">Operario</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estación asignada</label>
                <input name="estacion_asignada" value={newUser.estacion_asignada} onChange={handleCreateChange} />
              </div>
              <div style={{textAlign: 'right'}}>
                <button type="submit" className="login-btn" disabled={creating}>
                  {creating ? 'Creando...' : 'Crear cuenta'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="login-info">
          <p><strong>Contraseña para todos:</strong> frozen2025</p>
          <hr style={{margin: '0.5rem 0', border: '1px solid #e9ecef'}} />
          <p><strong>Admin:</strong> admin</p>
          <p><strong>Jefe Producción:</strong> jefe</p>
          <p><strong>Lavado:</strong> operario_lavado</p>
          <p><strong>Clasificación:</strong> operario_clasificacion</p>
          <p><strong>Pelado:</strong> operario_pelado</p>
          <p><strong>Escurrido:</strong> operario_escurrido</p>
          <p><strong>Congelación:</strong> operario_congelacion</p>
          <p><strong>Empaquetado:</strong> operario_empaquetado</p>
        </div>
      </div>
    </div>
  );
};

export default Login;