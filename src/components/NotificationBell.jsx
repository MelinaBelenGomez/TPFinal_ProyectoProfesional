import { useState, useEffect, useRef } from 'react';
import ProductionServiceAxios from '../services/productionServiceAxios';

const NotificationBell = () => {
  const [alerts, setAlerts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!showDropdown) return;
      if (bellRef.current && bellRef.current.contains(e.target)) return;
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      setShowDropdown(false);
    };

    const handleResize = () => {
      if (showDropdown) positionDropdown();
    };

    window.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [showDropdown]);

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
    const newState = !showDropdown;
    setShowDropdown(newState);
    if (newState) {
      // wait for DOM to render dropdown then position it
      setTimeout(() => positionDropdown(), 0);
    }
  };

  const positionDropdown = () => {
    const btn = bellRef.current;
    const dd = dropdownRef.current;
    if (!btn || !dd) return;

    // Reset any inline width to allow natural sizing first
    dd.style.width = '';

    const btnRect = btn.getBoundingClientRect();
    const ddRect = dd.getBoundingClientRect();

    // Determine dropdown width but cap it to viewport with some padding
    const preferredWidth = Math.min(Math.max(ddRect.width, 200), 360);
    const maxAllowed = window.innerWidth - 16; // 8px padding each side
    const finalWidth = Math.min(preferredWidth, maxAllowed);

    // Compute left so dropdown stays inside viewport
    let left = btnRect.right - finalWidth;
    if (left < 8) left = 8;
    if (left + finalWidth > window.innerWidth - 8) left = window.innerWidth - finalWidth - 8;

    const top = btnRect.bottom + 8;

    dd.style.position = 'fixed';
    dd.style.left = `${left}px`;
    dd.style.top = `${top}px`;
    dd.style.right = 'auto';
    dd.style.width = `${finalWidth}px`;
    dd.style.zIndex = 1100;
  };

  return (
    <div className="notification-bell">
      <button 
        className="bell-button"
        onClick={toggleDropdown}
        ref={bellRef}
      >
        <i className="fas fa-bell"></i>
        {alerts.length > 0 && (
          <span className="notification-badge">{alerts.length}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown" ref={dropdownRef}>
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