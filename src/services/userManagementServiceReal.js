import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

class UserManagementServiceReal {
  
  // Obtener todos los usuarios
  static async getAllUsers() {
    try {
      const response = await axios.get(`${API_BASE_URL}/usuarios`);
      return {
        success: true,
        data: response.data.map(user => ({
          id: user.idUsuario,
          username: user.username,
          nombre: user.nombre,
          rol: user.rol,
          estacion_asignada: user.estacionAsignada,
          activo: user.activo,
          email: user.email || `${user.username}@frozen.com`,
          telefono: '123-456-7890', // Campo simulado
          ultimo_acceso: null // Campo simulado
        }))
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener usuarios'
      };
    }
  }

  // Crear nuevo usuario
  static async createUser(userData) {
    try {
      const nuevoUsuario = {
        username: userData.username,
        password: userData.password || 'frozen2025', // Password por defecto
        nombre: userData.nombre,
        rol: userData.rol,
        estacionAsignada: userData.estacion_asignada || null,
        email: userData.email,
        activo: true
      };

      const response = await axios.post(`${API_BASE_URL}/usuarios`, nuevoUsuario);
      
      return {
        success: true,
        data: {
          id: response.data.idUsuario,
          username: response.data.username,
          nombre: response.data.nombre,
          rol: response.data.rol,
          estacion_asignada: response.data.estacionAsignada,
          activo: response.data.activo,
          email: response.data.email,
          telefono: '123-456-7890'
        },
        message: 'Usuario creado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al crear usuario'
      };
    }
  }

  // Actualizar usuario
  static async updateUser(userId, userData) {
    try {
      const usuarioActualizado = {
        username: userData.username,
        nombre: userData.nombre,
        rol: userData.rol,
        estacionAsignada: userData.estacion_asignada || null,
        email: userData.email,
        password: userData.password || null // Solo si se proporciona nueva password
      };

      const response = await axios.put(`${API_BASE_URL}/usuarios/${userId}`, usuarioActualizado);
      
      return {
        success: true,
        data: {
          id: response.data.data.idUsuario,
          username: response.data.data.username,
          nombre: response.data.data.nombre,
          rol: response.data.data.rol,
          estacion_asignada: response.data.data.estacionAsignada,
          activo: response.data.data.activo,
          email: response.data.data.email,
          telefono: userData.telefono || '123-456-7890'
        },
        message: 'Usuario actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al actualizar usuario'
      };
    }
  }

  // Cambiar estado del usuario (activar/desactivar)
  static async toggleUserStatus(userId) {
    try {
      // Primero obtener el usuario para saber su estado actual
      const users = await this.getAllUsers();
      const user = users.data.find(u => u.id === userId);
      
      if (user.activo) {
        await axios.put(`${API_BASE_URL}/usuarios/${userId}/desactivar`);
      } else {
        // Necesitamos crear endpoint para activar
        await axios.put(`${API_BASE_URL}/usuarios/${userId}/activar`);
      }
      
      return {
        success: true,
        data: {
          ...user,
          activo: !user.activo
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al cambiar estado del usuario'
      };
    }
  }

  // Eliminar usuario
  static async deleteUser(userId) {
    try {
      await axios.delete(`${API_BASE_URL}/usuarios/${userId}`);
      return {
        success: true,
        message: 'Usuario eliminado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al eliminar usuario'
      };
    }
  }

  // Obtener estadísticas de usuarios
  static async getUserStats() {
    try {
      const response = await this.getAllUsers();
      if (response.success) {
        const users = response.data;
        return {
          success: true,
          data: {
            total: users.length,
            active: users.filter(u => u.activo).length,
            inactive: users.filter(u => !u.activo).length,
            por_rol: {
              ADMIN: users.filter(u => u.rol === 'ADMIN').length,
              JEFE_PRODUCCION: users.filter(u => u.rol === 'JEFE_PRODUCCION').length,
              OPERARIO: users.filter(u => u.rol === 'OPERARIO').length
            }
          }
        };
      }
      return response;
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener estadísticas'
      };
    }
  }

  // Obtener roles disponibles
  static getRoles() {
    return [
      { value: 'ADMIN', label: 'Administrador' },
      { value: 'JEFE_PRODUCCION', label: 'Jefe de Producción' },
      { value: 'OPERARIO', label: 'Operario' }
    ];
  }

  // Obtener estaciones disponibles
  static getEstaciones() {
    return [
      { value: 'LAVADO', label: 'Lavado' },
      { value: 'CLASIFICACION', label: 'Clasificación' },
      { value: 'PELADO_TROZADO', label: 'Pelado y Trozado' },
      { value: 'ESCURRIDO', label: 'Escurrido' },
      { value: 'CONGELACION', label: 'Congelación' },
      { value: 'EMPAQUETADO', label: 'Empaquetado' }
    ];
  }
}

export default UserManagementServiceReal;