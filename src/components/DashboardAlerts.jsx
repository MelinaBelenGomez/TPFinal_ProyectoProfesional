import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';

const DashboardAlerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const [lowStock, activeOrders] = await Promise.all([
        dashboardService.getLowStock(),
        dashboardService.getActiveOrders()
      ]);

      const newAlerts = [];

      // Alertas de stock bajo
      if (lowStock.length > 0) {
        newAlerts.push({
          type: 'warning',
          icon: 'fas fa-exclamation-triangle',
          title: 'Stock Bajo',
          message: `${lowStock.length} producto(s) requieren reposición`,
          action: () => navigate('/raw-materials')
        });
      }

      // Alertas de órdenes pendientes
      const pendingOrders = activeOrders.filter(order => order.estado === 'planificada');
      if (pendingOrders.length > 0) {
        newAlerts.push({
          type: 'info',
          icon: 'fas fa-clock',
          title: 'Órdenes Pendientes',
          message: `${pendingOrders.length} orden(es) esperando activación`,
          action: () => navigate('/production')
        });
      }

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error cargando alertas:', error);
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="dashboard-alerts">
      {alerts.map((alert, index) => (
        <div key={index} className={`alert alert-${alert.type}`}>
          <div className="alert-content">
            <i className={alert.icon}></i>
            <div className="alert-text">
              <strong>{alert.title}</strong>
              <span>{alert.message}</span>
            </div>
          </div>
          {alert.action && (
            <button className="alert-action" onClick={alert.action}>
              Ver
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default DashboardAlerts;