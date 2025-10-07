import { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    revenue: 24580,
    orders: 156,
    toPrepare: 12,
    toSend: 8
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        revenue: Math.max(0, prev.revenue + Math.floor(Math.random() * 10) - 3),
        orders: Math.max(0, prev.orders + Math.floor(Math.random() * 10) - 3),
        toPrepare: Math.max(0, prev.toPrepare + Math.floor(Math.random() * 10) - 3),
        toSend: Math.max(0, prev.toSend + Math.floor(Math.random() * 10) - 3)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <div className="card">
        <h3>Venta de Artículos</h3>
        <p>Ventas totales del mes actual</p>
        <div className="stats">
          <div className="stat">
            <div className="stat-value">${stats.revenue.toLocaleString()}</div>
            <div className="stat-label">Ingresos</div>
          </div>
          <div className="stat">
            <div className="stat-value">{stats.orders}</div>
            <div className="stat-label">Ordenes</div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3>Inventario/ Control de Stock</h3>
        <p>Productos con stock bajo</p>
        <ul>
          <li>Frutillas congeladas - 15 unidades</li>
          <li>Espinacas congeladas - 22 unidades</li>
          <li>Arándanos congelados - 18 unidades</li>
        </ul>
        <button style={{marginTop: '1rem'}}>Ver Inventario Completo</button>
      </div>
      
      <div className="card">
        <h3>Ordenes Pendientes</h3>
        <p>Ordenes que requieren atención</p>
        <div className="stats">
          <div className="stat">
            <div className="stat-value">{stats.toPrepare}</div>
            <div className="stat-label">Por preparar</div>
          </div>
          <div className="stat">
            <div className="stat-value">{stats.toSend}</div>
            <div className="stat-label">Pendientes de envio</div>
          </div>
        </div>
        <button style={{marginTop: '1rem'}}>Gestionar Ordenes</button>
      </div>
    </div>
  );
};

export default Dashboard;