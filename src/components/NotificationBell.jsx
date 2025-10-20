import { useState, useEffect } from 'react';
import RawMaterialService from '../services/rawMaterialService';

const NotificationBell = () => {
  const [alerts, setAlerts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    const response = await RawMaterialService.getLowStockAlerts();
    if (response.success) {
      setAlerts(response.data);
    }
    setLoading(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="notification-bell">
      <button 
        className="bell-button"
        onClick={toggleDropdown}
      >
        <i className="fas fa-bell"></i>
        {alerts.length > 0 && (
          <span className="notification-badge">{alerts.length}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Alertas de Stock</h4>
            <button 
              className="close-dropdown"
              onClick={() => setShowDropdown(false)}
            >
              ×
            </button>
          </div>
          
          <div className="notification-content">
            {loading ? (
              <div className="notification-loading">
                <i className="fas fa-spinner fa-spin"></i>
                Cargando...
              </div>
            ) : alerts.length === 0 ? (
              <div className="no-notifications">
                <i className="fas fa-check-circle"></i>
                <p>No hay alertas de stock</p>
              </div>
            ) : (
              <div className="alerts-list">
                {alerts.map(alert => (
                  <div key={alert.id} className="alert-item">
                    <div className="alert-icon">
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div className="alert-info">
                      <strong>{alert.nombre}</strong>
                      <p>Stock: {alert.stock_actual} {alert.unidad}</p>
                      <p>Mínimo: {alert.stock_minimo} {alert.unidad}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;