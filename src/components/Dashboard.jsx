import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import DashboardAlerts from './DashboardAlerts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeOrders, setActiveOrders] = useState([]);
  const [workStations, setWorkStations] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    totalOrdenes: 0,
    ordenesActivas: 0,
    ordenesPlanificadas: 0,
    ordenesConsumidas: 0
  });

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [orders, stations, stock, stats] = await Promise.all([
        dashboardService.getActiveOrders(),
        dashboardService.getWorkStationsStatus(),
        dashboardService.getLowStock(),
        dashboardService.getGlobalStats()
      ]);
      
      setActiveOrders(orders);
      setWorkStations(stations);
      setLowStock(stock);
      setGlobalStats(stats);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-message">
          <i className="fas fa-spinner fa-spin"></i> Cargando dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <DashboardAlerts />
      <div className="dashboard">
        <div className="card compact">
        <h3><i className="fas fa-chart-line"></i> Estadísticas de Producción</h3>
        <p>Resumen general del sistema</p>
        <div className="stats">
          <div className="stat">
            <div className="stat-value">{globalStats.totalOrdenes || 0}</div>
            <div className="stat-label">Total Órdenes</div>
          </div>
          <div className="stat">
            <div className="stat-value">{activeOrders.length}</div>
            <div className="stat-label">Órdenes Activas</div>
          </div>
          <div className="stat">
            <div className="stat-value">{globalStats.ordenesPlanificadas || globalStats.totalOrdenesPendientes || 0}</div>
            <div className="stat-label">Órdenes Planificadas</div>
          </div>
          <div className="stat">
            <div className="stat-value">{globalStats.ordenesConsumidas || globalStats.totalOrdenesCompletadas || 0}</div>
            <div className="stat-label">Órdenes Completadas</div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3><i className="fas fa-exclamation-triangle"></i> Stock Bajo</h3>
        <p>Productos que requieren reposición</p>
        {lowStock.length > 0 ? (
          <ul>
            {lowStock.map((item, index) => (
              <li key={index}>
                <strong>{item.sku}</strong> - {item.stockDisponible} unidades 
                <span style={{color: '#dc3545', fontSize: '12px'}}>
                  (mín: {item.cantidadMinima})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{color: '#28a745'}}>✓ Todos los productos tienen stock suficiente</p>
        )}
        <button style={{marginTop: '1rem'}} onClick={() => navigate('/raw-materials')}>
          Ver Inventario Completo
        </button>
      </div>
      
      <div className="card">
        <h3><i className="fas fa-tasks"></i> Órdenes Activas</h3>
        <p>Órdenes en proceso de producción</p>
        {activeOrders.length > 0 ? (
          <div className="orders-list">
            {activeOrders.slice(0, 5).map(order => (
              <div key={order.idOp} className="order-item">
                <div className="order-info">
                  <strong>OP #{order.idOp}</strong> - {order.sku}
                  <span className={`status-badge status-${order.estado?.toLowerCase()}`}>
                    {order.estado?.toUpperCase()}
                  </span>
                </div>
                <div className="order-details">
                  Cantidad: {order.cantidad} | Responsable: {order.responsable}
                </div>
              </div>
            ))}
            {activeOrders.length > 5 && (
              <p style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
                +{activeOrders.length - 5} órdenes más
              </p>
            )}
          </div>
        ) : (
          <p>No hay órdenes activas en este momento</p>
        )}
        <button style={{marginTop: '1rem'}} onClick={() => navigate('/production')}>
          Gestionar Órdenes
        </button>
      </div>
      
      <div className="card stations-card">
        <h3><i className="fas fa-industry"></i> Estaciones de Trabajo</h3>
        <p>Estado actual de las líneas de producción</p>
        <div className="stations-grid">
          {workStations.map(station => (
            <div key={station.nombre} className={`station-item ${station.ocupada ? 'occupied' : 'free'}`}>
              <div className="station-name">{station.nombre}</div>
              <div className="station-status">
                {station.ocupada ? (
                  <>
                    <i className="fas fa-circle" style={{color: '#dc3545'}}></i>
                    {station.lotesActivos} lote(s)
                  </>
                ) : (
                  <>
                    <i className="fas fa-circle" style={{color: '#28a745'}}></i>
                    Libre
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <button style={{marginTop: '1rem'}} onClick={() => navigate('/production')}>
          Ver Producción
        </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;