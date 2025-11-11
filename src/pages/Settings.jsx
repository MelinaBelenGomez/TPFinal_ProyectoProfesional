import { useState, useEffect } from 'react';
import UserManagementService from '../services/userManagementServiceReal';
import '../styles/settings.css';

const Settings = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('username');
  const [sortOrder, setSortOrder] = useState('asc');
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    nombre: '',
    password: '',
    rol: '',
    estacion_asignada: '',
    telefono: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [usersResponse, statsResponse] = await Promise.all([
      UserManagementService.getAllUsers(),
      UserManagementService.getUserStats()
    ]);
    
    if (usersResponse.success) {
      setUsers(usersResponse.data);
    }
    if (statsResponse.success) {
      setStats(statsResponse.data);
    }
    setLoading(false);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const response = await UserManagementService.createUser(newUser);
    if (response.success) {
      setUsers([...users, response.data]);
      setNewUser({
        username: '',
        email: '',
        nombre: '',
        password: '',
        rol: '',
        estacion_asignada: '',
        telefono: ''
      });
      setShowAddForm(false);
      loadData(); // Recargar stats
    } else {
      alert(response.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const response = await UserManagementService.updateUser(editingUser.id, editingUser);
    if (response.success) {
      setUsers(users.map(u => u.id === editingUser.id ? response.data : u));
      setEditingUser(null);
    } else {
      alert(response.message);
    }
  };

  const handleToggleStatus = async (userId) => {
    const response = await UserManagementService.toggleUserStatus(userId);
    if (response.success) {
      setUsers(users.map(u => u.id === userId ? response.data : u));
      loadData(); // Recargar stats
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      const response = await UserManagementService.deleteUser(userId);
      if (response.success) {
        setUsers(users.filter(u => u.id !== userId));
        loadData(); // Recargar stats
      } else {
        alert(response.message);
      }
    }
  };

  const getRoleLabel = (rol) => {
    const roles = UserManagementService.getRoles();
    return roles.find(r => r.value === rol)?.label || rol;
  };

  const getEstacionLabel = (estacion) => {
    const estaciones = UserManagementService.getEstaciones();
    return estaciones.find(e => e.value === estacion)?.label || estacion || 'Sin asignar';
  };

  const getStatusColor = (activo) => {
    return activo ? '#28a745' : '#dc3545';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="page-header">
        <h1><i className="fas fa-users-cog"></i> Gestión de Usuarios y Configuración</h1>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Usuarios</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active">
              <i className="fas fa-user-check"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">Usuarios Activos</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon inactive">
              <i className="fas fa-user-times"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.inactive}</div>
              <div className="stat-label">Usuarios Inactivos</div>
            </div>
          </div>
        </div>
      )}

      {/* Gestión de Usuarios */}
      <div className="users-section">
        <div className="section-header">
          <h2>Gestión de Usuarios</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <i className="fas fa-plus"></i> Agregar Usuario
          </button>
        </div>

        <div className="filters-section" style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="🔍 Buscar usuario, nombre o email..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '250px' }}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="all">Todos los roles</option>
              {UserManagementService.getRoles().map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="all">Todos los estados</option>
              <option value="true">ACTIVO</option>
              <option value="false">INACTIVO</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="username">Por usuario</option>
              <option value="nombre">Por nombre</option>
              <option value="rol">Por rol</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(user => {
                  const matchesSearch = user.username.toLowerCase().includes(searchFilter.toLowerCase()) ||
                                      user.nombre.toLowerCase().includes(searchFilter.toLowerCase()) ||
                                      user.email.toLowerCase().includes(searchFilter.toLowerCase());
                  const matchesRole = roleFilter === 'all' || user.rol === roleFilter;
                  const matchesStatus = statusFilter === 'all' || user.activo.toString() === statusFilter;
                  return matchesSearch && matchesRole && matchesStatus;
                })
                .sort((a, b) => {
                  let aValue = a[sortBy];
                  let bValue = b[sortBy];
                  
                  if (sortBy === 'rol') {
                    aValue = a.rol;
                    bValue = b.rol;
                  }
                  return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                })
                .map(user => (
                <tr key={user.id}>
                  <td className="username-cell">{user.username}</td>
                  <td>{user.nombre}</td>
                  <td>{user.email}</td>
                  <td>{getRoleLabel(user.rol)}</td>
                  <td>{getEstacionLabel(user.estacion_asignada)}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(user.activo) }}
                    >
                      {user.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => setEditingUser({...user})}
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn btn-sm"
                        style={{ 
                          backgroundColor: user.activo ? '#ffc107' : '#28a745',
                          color: 'white'
                        }}
                        onClick={() => handleToggleStatus(user.id)}
                        title={user.activo ? 'Desactivar' : 'Activar'}
                      >
                        <i className={`fas fa-${user.activo ? 'pause' : 'play'}`}></i>
                      </button>
                      {user.username !== 'admin' && (
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Eliminar"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.filter(user => {
            const matchesSearch = user.username.toLowerCase().includes(searchFilter.toLowerCase()) ||
                                user.nombre.toLowerCase().includes(searchFilter.toLowerCase()) ||
                                user.email.toLowerCase().includes(searchFilter.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.rol === roleFilter;
            const matchesStatus = statusFilter === 'all' || user.activo.toString() === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
          }).length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <i className="fas fa-search" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
              <p>No se encontraron usuarios con los filtros aplicados</p>
              <button 
                onClick={() => {
                  setSearchFilter('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
                style={{ padding: '8px 16px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Agregar Usuario */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Agregar Nuevo Usuario</h3>
              <button 
                className="btn-close"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre de Usuario:</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contraseña:</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Dejar vacío para usar 'frozen2025'"
                  />
                </div>
                <div className="form-group">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    value={newUser.nombre}
                    onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="usuario@frozen.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Rol:</label>
                  <select
                    value={newUser.rol}
                    onChange={(e) => setNewUser({...newUser, rol: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar rol...</option>
                    {UserManagementService.getRoles().map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                {newUser.rol === 'OPERARIO' && (
                  <div className="form-group">
                    <label>Estación Asignada:</label>
                    <select
                      value={newUser.estacion_asignada}
                      onChange={(e) => setNewUser({...newUser, estacion_asignada: e.target.value})}
                      required
                    >
                      <option value="">Seleccionar estación...</option>
                      {UserManagementService.getEstaciones().map(estacion => (
                        <option key={estacion.value} value={estacion.value}>
                          {estacion.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Teléfono:</label>
                  <input
                    type="tel"
                    value={newUser.telefono}
                    onChange={(e) => setNewUser({...newUser, telefono: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editar Usuario</h3>
              <button 
                className="btn-close"
                onClick={() => setEditingUser(null)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre de Usuario:</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nueva Contraseña:</label>
                  <input
                    type="password"
                    value={editingUser.password || ''}
                    onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                    placeholder="Dejar vacío para mantener actual"
                  />
                </div>
                <div className="form-group">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    value={editingUser.nombre}
                    onChange={(e) => setEditingUser({...editingUser, nombre: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Rol:</label>
                  <select
                    value={editingUser.rol}
                    onChange={(e) => setEditingUser({...editingUser, rol: e.target.value})}
                    required
                  >
                    {UserManagementService.getRoles().map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                {editingUser.rol === 'OPERARIO' && (
                  <div className="form-group">
                    <label>Estación Asignada:</label>
                    <select
                      value={editingUser.estacion_asignada || ''}
                      onChange={(e) => setEditingUser({...editingUser, estacion_asignada: e.target.value})}
                    >
                      <option value="">Sin asignar</option>
                      {UserManagementService.getEstaciones().map(estacion => (
                        <option key={estacion.value} value={estacion.value}>
                          {estacion.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Teléfono:</label>
                  <input
                    type="tel"
                    value={editingUser.telefono || '123-456-7890'}
                    onChange={(e) => setEditingUser({...editingUser, telefono: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Actualizar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;