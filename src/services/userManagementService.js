// Service para gestionar usuarios del sistema
class UserManagementService {
  
  static delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Usuarios simulados (basados en authService pero con más datos)
  static mockUsers = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@frozen.com',
      nombre: 'Administrador',
      apellido: 'Sistema',
      role: 'admin',
      estado: 'ACTIVO',
      fecha_creacion: '2024-01-01T00:00:00Z',
      ultimo_acceso: '2025-01-15T14:30:00Z',
      telefono: '+54 11 1234-5678'
    },
    {
      id: 2,
      username: 'empleado',
      email: 'empleado@frozen.com',
      nombre: 'Juan Carlos',
      apellido: 'Pérez',
      role: 'employee',
      estado: 'ACTIVO',
      fecha_creacion: '2024-02-15T00:00:00Z',
      ultimo_acceso: '2025-01-15T13:45:00Z',
      telefono: '+54 11 2345-6789'
    },
    {
      id: 3,
      username: 'operario_lavado',
      email: 'lavado@frozen.com',
      nombre: 'María Elena',
      apellido: 'González',
      role: 'operario_lavado',
      estado: 'ACTIVO',
      fecha_creacion: '2024-03-01T00:00:00Z',
      ultimo_acceso: '2025-01-15T08:15:00Z',
      telefono: '+54 11 3456-7890'
    },
    {
      id: 4,
      username: 'operario_clasificacion',
      email: 'clasificacion@frozen.com',
      nombre: 'Roberto',
      apellido: 'Martínez',
      role: 'operario_clasificacion',
      estado: 'ACTIVO',
      fecha_creacion: '2024-03-01T00:00:00Z',
      ultimo_acceso: '2025-01-15T09:30:00Z',
      telefono: '+54 11 4567-8901'
    },
    {
      id: 5,
      username: 'pelado_trozado',
      email: 'pelado@frozen.com',
      nombre: 'Ana Sofía',
      apellido: 'López',
      role: 'pelado_trozado',
      estado: 'ACTIVO',
      fecha_creacion: '2024-03-01T00:00:00Z',
      ultimo_acceso: '2025-01-15T10:45:00Z',
      telefono: '+54 11 5678-9012'
    },
    {
      id: 6,
      username: 'operario_escurrido',
      email: 'escurrido@frozen.com',
      nombre: 'Carlos Eduardo',
      apellido: 'Rodríguez',
      role: 'operario_escurrido',
      estado: 'INACTIVO',
      fecha_creacion: '2024-03-01T00:00:00Z',
      ultimo_acceso: '2025-01-10T16:20:00Z',
      telefono: '+54 11 6789-0123'
    },
    {
      id: 7,
      username: 'operario_congelacion',
      email: 'congelacion@frozen.com',
      nombre: 'Lucía',
      apellido: 'Fernández',
      role: 'operario_congelacion',
      estado: 'ACTIVO',
      fecha_creacion: '2024-03-01T00:00:00Z',
      ultimo_acceso: '2025-01-15T11:00:00Z',
      telefono: '+54 11 7890-1234'
    },
    {
      id: 8,
      username: 'operario_empaquetado',
      email: 'empaquetado@frozen.com',
      nombre: 'Diego Alejandro',
      apellido: 'Silva',
      role: 'operario_empaquetado',
      estado: 'ACTIVO',
      fecha_creacion: '2024-03-01T00:00:00Z',
      ultimo_acceso: '2025-01-15T12:15:00Z',
      telefono: '+54 11 8901-2345'
    }
  ];

  // Obtener todos los usuarios
  static async getAllUsers() {
    await this.delay();
    
    try {
      return {
        success: true,
        data: this.mockUsers,
        total: this.mockUsers.length
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener usuarios',
        message: error.message
      };
    }
  }

  // Crear nuevo usuario
  static async createUser(userData) {
    await this.delay();
    
    try {
      // Verificar si el username ya existe
      const existingUser = this.mockUsers.find(u => u.username === userData.username);
      if (existingUser) {
        return {
          success: false,
          error: 'USERNAME_EXISTS',
          message: 'El nombre de usuario ya existe'
        };
      }

      // Verificar si el email ya existe
      const existingEmail = this.mockUsers.find(u => u.email === userData.email);
      if (existingEmail) {
        return {
          success: false,
          error: 'EMAIL_EXISTS',
          message: 'El email ya está registrado'
        };
      }

      const newId = Math.max(...this.mockUsers.map(u => u.id)) + 1;
      
      const newUser = {
        id: newId,
        username: userData.username,
        email: userData.email,
        nombre: userData.nombre,
        apellido: userData.apellido,
        role: userData.role,
        estado: 'ACTIVO',
        fecha_creacion: new Date().toISOString(),
        ultimo_acceso: null,
        telefono: userData.telefono || ''
      };

      this.mockUsers.push(newUser);

      return {
        success: true,
        data: newUser,
        message: 'Usuario creado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear usuario',
        message: error.message
      };
    }
  }

  // Actualizar usuario
  static async updateUser(userId, userData) {
    await this.delay();
    
    try {
      const userIndex = this.mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado'
        };
      }

      // Verificar username único (excluyendo el usuario actual)
      if (userData.username) {
        const existingUser = this.mockUsers.find(u => 
          u.username === userData.username && u.id !== userId
        );
        if (existingUser) {
          return {
            success: false,
            error: 'USERNAME_EXISTS',
            message: 'El nombre de usuario ya existe'
          };
        }
      }

      // Verificar email único (excluyendo el usuario actual)
      if (userData.email) {
        const existingEmail = this.mockUsers.find(u => 
          u.email === userData.email && u.id !== userId
        );
        if (existingEmail) {
          return {
            success: false,
            error: 'EMAIL_EXISTS',
            message: 'El email ya está registrado'
          };
        }
      }

      const updatedUser = {
        ...this.mockUsers[userIndex],
        ...userData
      };

      this.mockUsers[userIndex] = updatedUser;

      return {
        success: true,
        data: updatedUser,
        message: 'Usuario actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar usuario',
        message: error.message
      };
    }
  }

  // Cambiar estado del usuario (activar/desactivar)
  static async toggleUserStatus(userId) {
    await this.delay();
    
    try {
      const userIndex = this.mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado'
        };
      }

      const user = this.mockUsers[userIndex];
      const newStatus = user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
      
      this.mockUsers[userIndex] = {
        ...user,
        estado: newStatus
      };

      return {
        success: true,
        data: this.mockUsers[userIndex],
        message: `Usuario ${newStatus === 'ACTIVO' ? 'activado' : 'desactivado'} exitosamente`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al cambiar estado del usuario',
        message: error.message
      };
    }
  }

  // Eliminar usuario
  static async deleteUser(userId) {
    await this.delay();
    
    try {
      const userIndex = this.mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado'
        };
      }

      // No permitir eliminar el admin principal
      if (this.mockUsers[userIndex].username === 'admin') {
        return {
          success: false,
          error: 'CANNOT_DELETE_ADMIN',
          message: 'No se puede eliminar el administrador principal'
        };
      }

      const deletedUser = this.mockUsers.splice(userIndex, 1)[0];

      return {
        success: true,
        data: deletedUser,
        message: 'Usuario eliminado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al eliminar usuario',
        message: error.message
      };
    }
  }

  // Obtener roles disponibles
  static getRoles() {
    return [
      { value: 'admin', label: 'Administrador' },
      { value: 'employee', label: 'Empleado' },
      { value: 'operario_lavado', label: 'Operario de Lavado' },
      { value: 'operario_clasificacion', label: 'Operario de Clasificación' },
      { value: 'pelado_trozado', label: 'Operario de Pelado y Trozado' },
      { value: 'operario_escurrido', label: 'Operario de Escurrido' },
      { value: 'operario_congelacion', label: 'Operario de Congelación' },
      { value: 'operario_empaquetado', label: 'Operario de Empaquetado' }
    ];
  }

  // Obtener estadísticas de usuarios
  static async getUserStats() {
    await this.delay(200);
    
    try {
      const totalUsers = this.mockUsers.length;
      const activeUsers = this.mockUsers.filter(u => u.estado === 'ACTIVO').length;
      const inactiveUsers = totalUsers - activeUsers;
      
      const roleStats = this.getRoles().map(role => ({
        role: role.label,
        count: this.mockUsers.filter(u => u.role === role.value).length
      }));

      return {
        success: true,
        data: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          byRole: roleStats
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener estadísticas',
        message: error.message
      };
    }
  }
}

export default UserManagementService;