import { useState } from 'react';

const Orders = () => {
  const [orders, setOrders] = useState([
    {
      id: 'PED-001',
      client: 'Restaurante El Jardín',
      date: '2025-01-15',
      products: 'Frutillas congeladas (5kg), Mix berries (3kg)',
      total: 12500,
      paymentStatus: 'paid',
      shippingStatus: 'delivered',
      priority: 'normal'
    },
    {
      id: 'PED-002',
      client: 'Supermercado Central',
      date: '2025-01-15',
      products: 'Espinacas congeladas (10kg), Zanahorias baby (8kg)',
      total: 18750,
      paymentStatus: 'pending',
      shippingStatus: 'preparing',
      priority: 'high'
    },
    {
      id: 'PED-003',
      client: 'Panadería Artesanal',
      date: '2025-01-14',
      products: 'Mix berries (2kg), Frutillas (3kg)',
      total: 8900,
      paymentStatus: 'paid',
      shippingStatus: 'shipped',
      priority: 'normal'
    },
    {
      id: 'PED-004',
      client: 'Hotel Plaza',
      date: '2025-01-14',
      products: 'Espinacas (15kg), Mix berries (5kg), Zanahorias (10kg)',
      total: 28400,
      paymentStatus: 'paid',
      shippingStatus: 'preparing',
      priority: 'urgent'
    },
    {
      id: 'PED-005',
      client: 'Cafetería Luna',
      date: '2025-01-13',
      products: 'Frutillas congeladas (2kg)',
      total: 4200,
      paymentStatus: 'overdue',
      shippingStatus: 'pending',
      priority: 'low'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const getStatusBadge = (status, type) => {
    const statusConfig = {
      payment: {
        paid: { text: 'Pagado', class: 'status-success' },
        pending: { text: 'Pendiente', class: 'status-warning' },
        overdue: { text: 'Vencido', class: 'status-danger' }
      },
      shipping: {
        pending: { text: 'Pendiente', class: 'status-secondary' },
        preparing: { text: 'Preparando', class: 'status-info' },
        shipped: { text: 'Enviado', class: 'status-warning' },
        delivered: { text: 'Entregado', class: 'status-success' }
      },
      priority: {
        low: { text: 'Baja', class: 'priority-low' },
        normal: { text: 'Normal', class: 'priority-normal' },
        high: { text: 'Alta', class: 'priority-high' },
        urgent: { text: 'Urgente', class: 'priority-urgent' }
      }
    };

    const config = statusConfig[type][status];
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const updateOrderStatus = (orderId, field, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, [field]: newStatus } : order
    ));
  };

  const filteredOrders = orders.filter(order => {
    const matchesShipping = filter === 'all' || order.shippingStatus === filter;
    const matchesSearch = order.client.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesDate = !dateFilter || order.date === dateFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    return matchesShipping && matchesSearch && matchesDate && matchesPriority && matchesPayment;
  }).sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'total') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    if (sortBy === 'date') {
      return sortOrder === 'asc' ? new Date(aValue) - new Date(bValue) : new Date(bValue) - new Date(aValue);
    }
    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });

  const metrics = {
    total: orders.length,
    pending: orders.filter(o => o.shippingStatus === 'pending').length,
    preparing: orders.filter(o => o.shippingStatus === 'preparing').length,
    shipped: orders.filter(o => o.shippingStatus === 'shipped').length,
    delivered: orders.filter(o => o.shippingStatus === 'delivered').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    unpaidAmount: orders.filter(o => o.paymentStatus !== 'paid').reduce((sum, order) => sum + order.total, 0)
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>Gestión de Pedidos</h2>
        <p>Administra los pedidos de tus clientes</p>
      </div>

      <div className="orders-metrics">
        <div className="metric-card card">
          <div className="metric-icon">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="metric-info">
            <div className="metric-value">{metrics.total}</div>
            <div className="metric-label">Total Pedidos</div>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="metric-info">
            <div className="metric-value">{metrics.pending + metrics.preparing}</div>
            <div className="metric-label">Pendientes</div>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="metric-info">
            <div className="metric-value">${metrics.totalRevenue.toLocaleString()}</div>
            <div className="metric-label">Ingresos Totales</div>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="metric-info">
            <div className="metric-value">${metrics.unpaidAmount.toLocaleString()}</div>
            <div className="metric-label">Por Cobrar</div>
          </div>
        </div>
      </div>

      <div className="orders-filters">
        <button 
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          Todos ({metrics.total})
        </button>
        <button 
          className={filter === 'pending' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('pending')}
        >
          Pendientes ({metrics.pending})
        </button>
        <button 
          className={filter === 'preparing' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('preparing')}
        >
          Preparando ({metrics.preparing})
        </button>
        <button 
          className={filter === 'shipped' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('shipped')}
        >
          Enviados ({metrics.shipped})
        </button>
        <button 
          className={filter === 'delivered' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('delivered')}
        >
          Entregados ({metrics.delivered})
        </button>
      </div>

      <div className="advanced-filters" style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Buscar cliente o ID..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '200px' }}
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="all">Todas las prioridades</option>
            <option value="low">Baja</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="all">Todos los pagos</option>
            <option value="paid">Pagado</option>
            <option value="pending">Pendiente</option>
            <option value="overdue">Vencido</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="date">Ordenar por fecha</option>
            <option value="client">Ordenar por cliente</option>
            <option value="total">Ordenar por total</option>
            <option value="priority">Ordenar por prioridad</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="orders-table card">
        {filteredOrders.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Envío</th>
                <th>Prioridad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">{order.id}</td>
                  <td>{order.client}</td>
                  <td>{new Date(order.date).toLocaleDateString('es-ES')}</td>
                  <td className="products-cell">{order.products}</td>
                  <td className="total-cell">${order.total.toLocaleString()}</td>
                  <td>{getStatusBadge(order.paymentStatus, 'payment')}</td>
                  <td>{getStatusBadge(order.shippingStatus, 'shipping')}</td>
                  <td>{getStatusBadge(order.priority, 'priority')}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view"
                        onClick={() => alert(`Ver detalles de ${order.id}`)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="action-btn edit"
                        onClick={() => alert(`Editar ${order.id}`)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <i className="fas fa-search" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
            <p>No se encontraron pedidos con los filtros aplicados</p>
            <button 
              onClick={() => {
                setFilter('all');
                setSearchFilter('');
                setDateFilter('');
                setPriorityFilter('all');
                setPaymentFilter('all');
              }}
              style={{ padding: '8px 16px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;