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

  const filteredOrders = filter === 'all' ? orders : 
    orders.filter(order => order.shippingStatus === filter);

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

      <div className="orders-table card">
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
      </div>
    </div>
  );
};

export default Orders;