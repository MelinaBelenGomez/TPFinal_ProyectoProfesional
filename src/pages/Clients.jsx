import { useState, useEffect } from 'react';
import ClientService from '../services/clientService';
import '../styles/clients.css';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientOrders, setClientOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [clientsResponse, statsResponse] = await Promise.all([
      ClientService.getClientsWithOrderSummary(),
      ClientService.getClientStats()
    ]);
    
    if (clientsResponse.success) {
      setClients(clientsResponse.data);
    }
    if (statsResponse.success) {
      setStats(statsResponse.data);
    }
    setLoading(false);
  };

  const handleViewOrders = async (client) => {
    setSelectedClient(client);
    setLoadingOrders(true);
    
    const response = await ClientService.getClientOrders(client.id);
    if (response.success) {
      setClientOrders(response.data);
    }
    setLoadingOrders(false);
  };

  const getClientTypeLabel = (tipo) => {
    const types = ClientService.getClientTypes();
    return types.find(t => t.value === tipo)?.label || tipo;
  };

  const getOrderStateInfo = (estado) => {
    const states = ClientService.getOrderStates();
    return states.find(s => s.value === estado) || { label: estado, color: '#6c757d' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando clientes...</p>
      </div>
    );
  }

  return (
    <div className="clients-container">
      <div className="page-header">
        <h1><i className="fas fa-users"></i> Gestión de Clientes</h1>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.total_clientes}</div>
              <div className="stat-label">Total Clientes</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active">
              <i className="fas fa-user-check"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.clientes_activos}</div>
              <div className="stat-label">Clientes Activos</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orders">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.total_pedidos}</div>
              <div className="stat-label">Total Pedidos</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon sales">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">{formatCurrency(stats.ventas_totales)}</div>
              <div className="stat-label">Ventas Totales</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Clientes */}
      <div className="clients-section">
        <h2>Lista de Clientes</h2>
        <div className="clients-grid">
          {clients.map(client => (
            <div key={client.id} className="client-card">
              <div className="client-header">
                <h3>{client.nombre}</h3>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: client.estado === 'ACTIVO' ? '#28a745' : '#dc3545' }}
                >
                  {client.estado}
                </span>
              </div>
              
              <div className="client-info">
                <p><i className="fas fa-tag"></i> {getClientTypeLabel(client.tipo)}</p>
                <p><i className="fas fa-envelope"></i> {client.email}</p>
                <p><i className="fas fa-phone"></i> {client.telefono}</p>
                <p><i className="fas fa-map-marker-alt"></i> {client.direccion}</p>
              </div>

              <div className="client-summary">
                <div className="summary-item">
                  <span className="summary-label">Pedidos:</span>
                  <span className="summary-value">{client.resumen.total_pedidos}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Ventas:</span>
                  <span className="summary-value">{formatCurrency(client.resumen.total_ventas)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Pendientes:</span>
                  <span className="summary-value pending">{client.resumen.pedidos_pendientes}</span>
                </div>
                {client.resumen.ultimo_pedido && (
                  <div className="summary-item">
                    <span className="summary-label">Último pedido:</span>
                    <span className="summary-value">{formatDate(client.resumen.ultimo_pedido)}</span>
                  </div>
                )}
              </div>

              <div className="client-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleViewOrders(client)}
                >
                  <i className="fas fa-list"></i> Ver Pedidos
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Pedidos */}
      {selectedClient && (
        <div className="modal-overlay">
          <div className="modal-content orders-modal">
            <div className="modal-header">
              <h3>Pedidos de {selectedClient.nombre}</h3>
              <button 
                className="btn-close"
                onClick={() => setSelectedClient(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {loadingOrders ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Cargando pedidos...</p>
                </div>
              ) : clientOrders.length === 0 ? (
                <div className="no-orders">
                  <i className="fas fa-inbox"></i>
                  <p>Este cliente no tiene pedidos registrados</p>
                </div>
              ) : (
                <div className="orders-list">
                  {clientOrders.map(order => {
                    const stateInfo = getOrderStateInfo(order.estado);
                    return (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <span className="order-number">{order.numero_pedido}</span>
                          <span 
                            className="order-status"
                            style={{ backgroundColor: stateInfo.color }}
                          >
                            {stateInfo.label}
                          </span>
                        </div>
                        
                        <div className="order-info">
                          <p><strong>Fecha:</strong> {formatDate(order.fecha_pedido)}</p>
                          <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
                        </div>

                        <div className="order-products">
                          <h4>Productos:</h4>
                          <ul>
                            {order.productos.map((producto, index) => (
                              <li key={index}>
                                {producto.cantidad}x {producto.nombre} - {formatCurrency(producto.precio_unitario)} c/u
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;