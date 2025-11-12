import { useState, useEffect } from 'react';
import axios from 'axios';
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
  
  // Estados para configuración de producción
  const [productionConfig, setProductionConfig] = useState({
    cantidad_base_orden: 500,
    numero_lotes_fijo: 10
  });
  const [showProductionConfig, setShowProductionConfig] = useState(false);
  const [pesoUnitario, setPesoUnitario] = useState(500); // gramos por defecto
  const [productosConBom, setProductosConBom] = useState([]);
  const [skuSeleccionado, setSkuSeleccionado] = useState('');

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
    
    // Cargar configuración de producción y productos con BOM
    await loadProductionConfig();
    await loadProductosConBom();
    setLoading(false);
  };
  
  const loadProductionConfig = async () => {
    try {
      const response = await axios.get('http://localhost:8081/config-produccion');
      setProductionConfig({
        cantidad_base_orden: response.data.cantidadBaseOrden,
        numero_lotes_fijo: response.data.numeroLotesFijo
      });
    } catch (error) {
      console.error('Error cargando configuración:', error);
      // Usar valores por defecto si hay error
      setProductionConfig({
        cantidad_base_orden: 500,
        numero_lotes_fijo: 10
      });
    }
  };
  
  const saveProductionConfig = async () => {
    // Validación simple de unidades sobrantes
    const unidadesSobrantes = productionConfig.cantidad_base_orden % productionConfig.numero_lotes_fijo;
    if (unidadesSobrantes > 0) {
      const mensaje = `⚠️ ADVERTENCIA: ${productionConfig.cantidad_base_orden} unidades no se divide exactamente entre ${productionConfig.numero_lotes_fijo} lotes.\n\nSobrarán ${unidadesSobrantes} unidades.\n\n¿Deseas continuar de todas formas?`;
      
      if (!confirm(mensaje)) {
        return;
      }
    }
    
    try {
      // Guardar en backend
      await axios.put('http://localhost:8081/config-produccion', {
        cantidadBaseOrden: productionConfig.cantidad_base_orden,
        numeroLotesFijo: productionConfig.numero_lotes_fijo,
        modificadoPor: 'ADMIN' // O usar el usuario actual
      });
      
      // Guardar SKU seleccionado en localStorage (solo para UI)
      localStorage.setItem('skuSeleccionado', skuSeleccionado);
      
      alert('✅ Configuración de producción guardada exitosamente en la base de datos');
      setShowProductionConfig(false);
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('❌ Error al guardar la configuración. Inténtalo de nuevo.');
    }
  };
  
  const calculateMaterialUsage = () => {
    // Cálculo correcto: dividir PESO total entre número de lotes
    const pesoTotalOrden = (productionConfig.cantidad_base_orden * pesoUnitario) / 1000; // kg total
    const pesoLote = pesoTotalOrden / productionConfig.numero_lotes_fijo; // kg por lote
    
    // Para referencia: cuántas unidades equivalen a cada lote
    const unidadesEquivalentes = Math.floor(productionConfig.cantidad_base_orden / productionConfig.numero_lotes_fijo);
    const unidadesSobrantes = productionConfig.cantidad_base_orden % productionConfig.numero_lotes_fijo;
    
    // Calcular peso sobrante basado en unidades sobrantes
    const pesoSobrante = (unidadesSobrantes * pesoUnitario) / 1000; // kg sobrante
    
    return {
      pesoTotalOrden: pesoTotalOrden.toFixed(1),
      pesoLote: pesoLote.toFixed(1),
      pesoSobrante: pesoSobrante.toFixed(1),
      totalLotes: productionConfig.numero_lotes_fijo,
      pesoUnitario: (pesoUnitario / 1000).toFixed(2),
      unidadesEquivalentes, // Solo para referencia
      unidadesSobrantes // Solo para referencia
    };
  };
  
  const loadProductosConBom = async () => {
    try {
      const response = await axios.get('http://localhost:8081/bom/productos-fabricables');
      setProductosConBom(response.data);
      
      // Seleccionar el primer producto por defecto si no hay uno seleccionado
      if (response.data.length > 0 && !skuSeleccionado) {
        const primerProducto = response.data[0].sku;
        setSkuSeleccionado(primerProducto);
        await calcularPesoDesdeProducto(primerProducto);
      }
    } catch (error) {
      console.error('Error cargando productos con BOM:', error);
    }
  };
  
  const calcularPesoDesdeProducto = async (sku) => {
    try {
      // Obtener BOM del producto seleccionado
      const response = await axios.get(`http://localhost:8081/bom/${sku}`);
      const pesoTotal = response.data.reduce((total, item) => 
        total + (item.cantPorUnidad || 0), 0
      );
      setPesoUnitario(pesoTotal > 0 ? pesoTotal : 500);
    } catch (error) {
      console.error('Error calculando peso desde BOM:', error);
      // Usar peso por defecto
      setPesoUnitario(500);
    }
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

      {/* Configuración de Producción */}
      <div className="production-config-section" style={{ marginBottom: '30px' }}>
        <div className="section-header">
          <h2><i className="fas fa-cogs"></i> Configuración de Producción</h2>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowProductionConfig(true)}
          >
            <i className="fas fa-edit"></i> Configurar Lotes
          </button>
        </div>
        
        <div style={{ 
          background: '#e7f3ff', 
          padding: '15px', 
          borderRadius: '5px', 
          marginBottom: '15px',
          border: '1px solid #b3d9ff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <i className="fas fa-info-circle" style={{ color: '#0066cc', marginRight: '8px' }}></i>
            <strong style={{ color: '#0066cc' }}>¿Qué son los lotes?</strong>
          </div>
          <p style={{ margin: '0', color: '#004080', fontSize: '14px' }}>
            Los <strong>lotes son cantidades de materia prima en kilogramos</strong> que van pasando de estación a estación durante el proceso productivo. 
            Cada lote representa la cantidad de material (frutas, verduras) que un operario procesa antes de enviarlo a la siguiente estación.
          </p>
        </div>
        
        <div className="config-summary" style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="config-item">
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                {productionConfig.cantidad_base_orden}
              </div>
              <div style={{ color: '#6c757d' }}>Cantidad Base por Orden</div>
              <div style={{ fontSize: '12px', color: '#007bff' }}>= {((productionConfig.cantidad_base_orden * pesoUnitario) / 1000).toFixed(1)} kg</div>
            </div>
            <div className="config-item">
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                {productionConfig.numero_lotes_fijo}
              </div>
              <div style={{ color: '#6c757d' }}>Número de Lotes</div>
            </div>
            <div className="config-item">
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                {(((productionConfig.cantidad_base_orden * pesoUnitario) / 1000) / productionConfig.numero_lotes_fijo).toFixed(1)} kg
              </div>
              <div style={{ color: '#6c757d' }}>Peso por Lote</div>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>Kg que pasan entre estaciones</div>
            </div>

          </div>
        </div>
      </div>

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
      
      {/* Modal Configuración de Producción */}
      {showProductionConfig && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3><i className="fas fa-cogs"></i> Configuración de Lotes de Producción</h3>
              <button 
                className="btn-close"
                onClick={() => setShowProductionConfig(false)}
              >
                ×
              </button>
            </div>
            
            <div style={{ 
              background: '#fff3cd', 
              padding: '15px', 
              margin: '0 20px 20px 20px', 
              borderRadius: '5px',
              border: '1px solid #ffeaa7'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <i className="fas fa-lightbulb" style={{ color: '#856404', marginRight: '8px' }}></i>
                <strong style={{ color: '#856404' }}>Concepto de Lotes</strong>
              </div>
              <p style={{ margin: '0', color: '#856404', fontSize: '14px', lineHeight: '1.4' }}>
                Los <strong>lotes son cantidades de materia prima en kilogramos</strong> que fluyen por las estaciones:<br/>
                LAVADO (25kg) → CLASIFICACIÓN (25kg) → PELADO (25kg) → etc.<br/>
                Cada operario procesa un lote antes de enviarlo a la siguiente estación.
              </p>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Cantidad Base por Orden de Producción:</label>
                  <input
                    type="number"
                    min="1"
                    value={productionConfig.cantidad_base_orden}
                    onChange={(e) => setProductionConfig({
                      ...productionConfig, 
                      cantidad_base_orden: parseInt(e.target.value) || 0
                    })}
                  />
                  <small style={{ color: '#6c757d' }}>Cantidad estándar que se usará como base para las órdenes</small>
                </div>
                
                <div className="form-group">
                  <label>Producto de Referencia (para cálculo de peso):</label>
                  <select
                    value={skuSeleccionado}
                    onChange={(e) => {
                      const newSku = e.target.value;
                      setSkuSeleccionado(newSku);
                      calcularPesoDesdeProducto(newSku);
                    }}
                  >
                    <option value="">Seleccionar producto...</option>
                    {productosConBom.map(producto => (
                      <option key={producto.sku} value={producto.sku}>
                        {producto.nombre} ({producto.sku})
                      </option>
                    ))}
                  </select>
                  <small style={{ color: '#6c757d' }}>Se usará el BOM real de este producto para calcular pesos</small>
                </div>
                
                <div className="form-group">
                  <label>Número de Lotes (en kg):</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={productionConfig.numero_lotes_fijo}
                    onChange={(e) => setProductionConfig({
                      ...productionConfig, 
                      numero_lotes_fijo: parseInt(e.target.value) || 1
                    })}
                  />
                  <small style={{ color: '#6c757d' }}>En cuántos lotes de materia prima (kg) se dividirá el peso total de cada orden</small>
                </div>
              </div>
              
              {/* Vista previa del cálculo */}
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                background: '#e9ecef', 
                borderRadius: '5px' 
              }}>
                <h4>📊 Vista Previa - Flujo de Materia Prima:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  <div>
                    <strong>Peso total orden:</strong> {((productionConfig.cantidad_base_orden * pesoUnitario) / 1000).toFixed(1)} kg
                  </div>
                  <div>
                    <strong>Peso por lote:</strong> {(((productionConfig.cantidad_base_orden * pesoUnitario) / 1000) / productionConfig.numero_lotes_fijo).toFixed(1)} kg
                  </div>
                  <div>
                    <strong>Unidades por lote:</strong> {Math.floor(productionConfig.cantidad_base_orden / productionConfig.numero_lotes_fijo)} unidades
                  </div>
                  <div>
                    <strong>Total de lotes:</strong> {productionConfig.numero_lotes_fijo}
                  </div>
                  <div style={{ color: (productionConfig.cantidad_base_orden % productionConfig.numero_lotes_fijo) > 0 ? '#dc3545' : '#28a745' }}>
                    <strong>Unidades sobrantes:</strong> {productionConfig.cantidad_base_orden % productionConfig.numero_lotes_fijo}
                  </div>
                  <div>
                    <strong>Estado:</strong> 
                    <span style={{ 
                      color: (productionConfig.cantidad_base_orden % productionConfig.numero_lotes_fijo) > 0 ? '#dc3545' : '#28a745',
                      marginLeft: '5px'
                    }}>
                      {(productionConfig.cantidad_base_orden % productionConfig.numero_lotes_fijo) > 0 ? '⚠️ Hay sobrante' : '✅ División exacta'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowProductionConfig(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={saveProductionConfig}
                >
                  <i className="fas fa-save"></i> Guardar Configuración
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;