import { useState, useEffect } from 'react';
import axios from 'axios';

const Reports = () => {
  const [ordenesReporte, setOrdenesReporte] = useState([]);
  const [estadisticasGlobales, setEstadisticasGlobales] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportes();
  }, []);

  const loadReportes = async () => {
    try {
      const [ordenesRes, statsRes] = await Promise.all([
        axios.get('http://localhost:8081/material-op/reporte-ordenes'),
        axios.get('http://localhost:8081/material-op/estadisticas-globales')
      ]);
      
      setOrdenesReporte(ordenesRes.data);
      setEstadisticasGlobales(statsRes.data);
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading-message">
          <i className="fas fa-spinner fa-spin"></i> Cargando reportes...
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>📊 Reportes de Desperdicios</h2>
        <div className="global-stats">
          <div className="stat-item">
            <i className="fas fa-apple-alt"></i>
            <span>Fruta más desperdiciada: <strong>{estadisticasGlobales.skuMasDesperdiciado || 'N/A'}</strong></span>
            <span className="stat-value">({estadisticasGlobales.gramosMasDesperdiciado || 0}g)</span>
          </div>
          <div className="stat-item">
            <i className="fas fa-exclamation-triangle"></i>
            <span>Motivo más frecuente: <strong>{estadisticasGlobales.motivoMasFrecuente?.replace('_', ' ') || 'N/A'}</strong></span>
            <span className="stat-value">({estadisticasGlobales.vecesMotivo || 0} veces)</span>
          </div>
        </div>
      </div>

      <div className="orders-table-section">
        <h3>🗂️ Órdenes de Producción - Desperdicios</h3>
        {ordenesReporte.length === 0 ? (
          <div className="empty-message card">
            <i className="fas fa-info-circle"></i>
            <p>No hay órdenes activas o terminadas con desperdicios registrados</p>
          </div>
        ) : (
          <div className="table-container card">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Orden #</th>
                  <th>Producto</th>
                  <th>Estado</th>
                  <th>Desperdicio Total</th>
                  <th>Nivel</th>
                </tr>
              </thead>
              <tbody>
                {ordenesReporte.map((orden, index) => {
                  const desperdicioKg = (orden.totalDesperdiciado / 1000).toFixed(2);
                  const nivel = orden.totalDesperdiciado > 5000 ? 'Alto' : 
                               orden.totalDesperdiciado > 2000 ? 'Medio' : 'Bajo';
                  const nivelClass = nivel === 'Alto' ? 'nivel-alto' : 
                                   nivel === 'Medio' ? 'nivel-medio' : 'nivel-bajo';
                  
                  return (
                    <tr key={index}>
                      <td><strong>#{orden.idOp}</strong></td>
                      <td>{orden.sku}</td>
                      <td>
                        <span className={`status-badge status-${orden.estado.toLowerCase()}`}>
                          {orden.estado}
                        </span>
                      </td>
                      <td>{desperdicioKg} kg</td>
                      <td>
                        <span className={`nivel-badge ${nivelClass}`}>
                          {nivel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // Estilos adicionales para la tabla
  const styles = `
    .global-stats {
      display: flex;
      gap: 30px;
      margin-top: 15px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .stat-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .stat-item i {
      color: #007bff;
      font-size: 18px;
    }
    .stat-value {
      color: #28a745;
      font-weight: bold;
    }
    .orders-table-section {
      margin-top: 30px;
    }
    .table-container {
      overflow-x: auto;
    }
    .orders-table {
      width: 100%;
      border-collapse: collapse;
    }
    .orders-table th,
    .orders-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .orders-table th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    .nivel-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    .nivel-alto { background: #dc3545; color: white; }
    .nivel-medio { background: #ffc107; color: black; }
    .nivel-bajo { background: #28a745; color: white; }
  `;
  
  return (
    <>
      <style>{styles}</style>
      {/* Contenido del componente aquí */}
    </>
  );
};

export default Reports;