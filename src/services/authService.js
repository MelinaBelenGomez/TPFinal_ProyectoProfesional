import axios from 'axios';

// Configuración del backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

class AuthService {
  static async login(username, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: username,
        password: password
      });

      if (response.data.success) {
        // Guardar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return {
          success: true,
          user: response.data.user
        };
      } else {
        return {
          success: false,
          message: response.data.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  static logout() {
    localStorage.removeItem('user');
  }

  static getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  // Obtener todos los usuarios (para jefe de producción)
  static async getAllUsers() {
    try {
      const response = await axios.get(`${API_BASE_URL}/usuarios`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener usuarios'
      };
    }
  }

  // Actualizar estación asignada
  static async updateUserStation(userId, station) {
    try {
      await axios.put(`${API_BASE_URL}/usuarios/${userId}/estacion`, {
        estacion: station
      });
      return {
        success: true,
        message: 'Estación actualizada correctamente'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al actualizar estación'
      };
    }
  }

  static hasPermission(user, permission) {
    if (!user) return false;
    
    // Admin tiene todos los permisos
    if (user.rol === 'ADMIN') return true;
    
    // Jefe de producción tiene permisos de gestión
    if (user.rol === 'JEFE_PRODUCCION' && ['view_orders', 'manage_production'].includes(permission)) {
      return true;
    }
    
    // Operarios solo pueden trabajar en su estación
    if (user.rol === 'OPERARIO' && permission === user.estacion_asignada) {
      return true;
    }
    
    return false;
  }

  // Validar roles específicos
  static validateRole(user, allowedRoles) {
    if (!user) return false;
    return allowedRoles.includes(user.rol);
  }

  // Obtener información del rol
  static getRoleInfo(rol) {
    const roleMap = {
      ADMIN: { name: 'Administrador', level: 5 },
      JEFE_PRODUCCION: { name: 'Jefe de Producción', level: 4 },
      OPERARIO: { name: 'Operario', level: 2 }
    };
    
    return roleMap[rol] || { name: 'Desconocido', level: 0 };
  }

  // Obtener estación del usuario
  static getUserStation(user) {
    return user?.estacion_asignada || null;
  }

  // Verificar si usuario puede acceder a estación
  static canAccessStation(user, station) {
    if (!user) return false;
    
    // Admin y jefe pueden ver todas las estaciones
    if (['ADMIN', 'JEFE_PRODUCCION'].includes(user.rol)) return true;
    
    // Operarios solo su estación asignada
    return user.rol === 'OPERARIO' && user.estacion_asignada === station;
  }
}

export default AuthService;