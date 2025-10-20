// Simulación de API para autenticación
class AuthService {
  
  static delay(ms = 800) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Login de usuario - DATOS QUE SE ENVÍAN AL BACKEND
  static async login(credentials) {
    await this.delay();
    
    try {
      // PAYLOAD: Solo estos datos se envían al backend
      const payload = {
        username: credentials.username,
        password: credentials.password
      };

      console.log('🔐 Enviando credenciales al backend:', { username: payload.username, password: '***' });

      // Simulación de usuarios en la base de datos
      const mockUsers = [
        {
          id: 1,
          username: 'admin',
          password: 'frozen2025',
          role: 'admin',
          nombre_completo: 'Administrador Sistema',
          email: 'admin@frozen.com',
          activo: true
        },
        {
          id: 2,
          username: 'empleado',
          password: 'frozen2025',
          role: 'employee',
          nombre_completo: 'Juan Pérez',
          email: 'juan@frozen.com',
          activo: true
        },
        {
          id: 3,
          username: 'operario_lavado',
          password: 'frozen2025',
          role: 'operario_lavado',
          nombre_completo: 'María García',
          email: 'maria@frozen.com',
          activo: true
        },
        {
          id: 4,
          username: 'operario_clasificacion',
          password: 'frozen2025',
          role: 'operario_clasificacion',
          nombre_completo: 'Carlos López',
          email: 'carlos@frozen.com',
          activo: true
        },
        {
          id: 5,
          username: 'pelado_trozado',
          password: 'frozen2025',
          role: 'pelado_trozado',
          nombre_completo: 'Ana Martínez',
          email: 'ana@frozen.com',
          activo: true
        },
        {
          id: 6,
          username: 'operario_escurrido',
          password: 'frozen2025',
          role: 'operario_escurrido',
          nombre_completo: 'Luis Rodríguez',
          email: 'luis@frozen.com',
          activo: true
        },
        {
          id: 7,
          username: 'operario_congelacion',
          password: 'frozen2025',
          role: 'operario_congelacion',
          nombre_completo: 'Sofía González',
          email: 'sofia@frozen.com',
          activo: true
        },
        {
          id: 8,
          username: 'operario_empaquetado',
          password: 'frozen2025',
          role: 'operario_empaquetado',
          nombre_completo: 'Diego Fernández',
          email: 'diego@frozen.com',
          activo: true
        }
      ];

      // Buscar usuario
      const user = mockUsers.find(u => 
        u.username === payload.username && 
        u.password === payload.password &&
        u.activo
      );

      if (!user) {
        return {
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Usuario o contraseña incorrectos'
        };
      }

      // Simulación de token JWT (en producción vendría del backend)
      const token = `jwt_token_${user.id}_${Date.now()}`;

      // Respuesta exitosa del backend
      const response = {
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            nombre_completo: user.nombre_completo,
            email: user.email
          },
          token: token,
          expires_in: 3600 // 1 hora
        },
        message: 'Login exitoso'
      };

      console.log('✅ Respuesta del backend:', {
        ...response,
        data: { ...response.data, token: 'jwt_token_***' }
      });

      // Guardar token en localStorage (simulación)
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));

      return response;

    } catch (error) {
      console.error('❌ Error en login:', error);
      return {
        success: false,
        error: 'LOGIN_ERROR',
        message: 'Error interno del servidor'
      };
    }
  }

  // Logout de usuario
  static async logout() {
    await this.delay(300);
    
    try {
      console.log('🚪 Cerrando sesión...');
      
      // Limpiar datos locales
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');

      return {
        success: true,
        message: 'Sesión cerrada exitosamente'
      };

    } catch (error) {
      return {
        success: false,
        error: 'LOGOUT_ERROR',
        message: 'Error al cerrar sesión'
      };
    }
  }

  // Verificar si el usuario está autenticado
  static isAuthenticated() {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    return !!(token && userData);
  }

  // Obtener datos del usuario actual
  static getCurrentUser() {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  // Verificar token (simulación de validación con backend)
  static async validateToken() {
    await this.delay(200);
    
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return {
        success: false,
        error: 'NO_TOKEN',
        message: 'No hay token de autenticación'
      };
    }

    // En producción, aquí se validaría el token con el backend
    return {
      success: true,
      data: {
        valid: true,
        user: this.getCurrentUser()
      }
    };
  }
}

export default AuthService;