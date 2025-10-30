import { useState, useEffect } from 'react';
import ProductionServiceAxios from '../services/productionServiceAxios';

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
    try {
      const response = await ProductionServiceAxios.getRawMaterialsWithStock();
      if (response.success) {
        console.log('Datos de materiales:', response.data);
        
        // Filtrar materiales con stock bajo usando stock_disponible
        const lowStockMaterials = response.data.filter(material => {
          const isLowStock = material.stock_disponible <= material.stock_minimo && material.stock_minimo > 0;
          console.log(`${material.nombre}: disponible=${material.stock_disponible}, minimo=${material.stock_minimo}, alerta=${isLowStock}`);
          return isLowStock;
        });
        
        console.log('Materiales con stock bajo:', lowStockMaterials);
        setAlerts(lowStockMaterials);
      }
    } catch (error) {
      console.error('Error cargando alertas:', error);
      setAlerts([]);
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
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                onClick={loadAlerts}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#007bff' }}
                title="Recargar alertas"
              >
                <i className="fas fa-sync-alt"></i>
              </button>
              <button 
                className="close-dropdown"
                onClick={() => setShowDropdown(false)}
              >
                ×
              </button>
            </div>
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
                      <p className="alert-detail">SKU: {alert.codigo}</p>
                      <p className="alert-detail">Almacén: {alert.almacen}</p>
                      <p className="stock-info">
                        Stock: <span className="stock-low">{alert.stock_actual}</span> / 
                        Mínimo: {alert.stock_minimo} {alert.unidad}
                      </p>
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