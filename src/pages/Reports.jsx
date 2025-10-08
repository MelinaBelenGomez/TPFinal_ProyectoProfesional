import { useState, useEffect } from 'react';

const Reports = () => {
  const [salesData, setSalesData] = useState([
    { month: 'Ene', sales: 85 },
    { month: 'Feb', sales: 92 },
    { month: 'Mar', sales: 78 },
    { month: 'Abr', sales: 95 },
    { month: 'May', sales: 88 },
    { month: 'Jun', sales: 102 }
  ]);

  const [wastePercentage, setWastePercentage] = useState(12);
  const [productionLevel, setProductionLevel] = useState(87);

  useEffect(() => {
    const interval = setInterval(() => {
      setWastePercentage(prev => Math.max(5, Math.min(20, prev + (Math.random() - 0.5) * 2)));
      setProductionLevel(prev => Math.max(70, Math.min(100, prev + (Math.random() - 0.5) * 3)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const maxSales = Math.max(...salesData.map(d => d.sales));

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Reportes y Análisis</h2>
        <p>Dashboard de métricas y estadísticas del negocio</p>
      </div>

      <div className="reports-grid">
        <div className="chart-card card">
          <h3><i className="fas fa-chart-line"></i> Ventas Mensuales</h3>
          <div className="bar-chart">
            {salesData.map((data, index) => (
              <div key={index} className="bar-container">
                <div 
                  className="bar" 
                  style={{ height: `${(data.sales / maxSales) * 100}%` }}
                >
                  <span className="bar-value">{data.sales}k</span>
                </div>
                <span className="bar-label">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="metric-card card">
          <h3><i className="fas fa-trash-alt"></i> Desperdicio de Materia Prima</h3>
          <div className="circular-progress">
            <div 
              className="progress-circle waste"
              style={{ '--progress': wastePercentage }}
            >
              <span className="progress-value">{wastePercentage.toFixed(1)}%</span>
            </div>
          </div>
          <p className="metric-description">
            {wastePercentage < 10 ? 'Excelente control' : 
             wastePercentage < 15 ? 'Dentro del rango' : 'Requiere atención'}
          </p>
        </div>

        <div className="metric-card card">
          <h3><i className="fas fa-industry"></i> Nivel de Producción</h3>
          <div className="circular-progress">
            <div 
              className="progress-circle production"
              style={{ '--progress': productionLevel }}
            >
              <span className="progress-value">{productionLevel.toFixed(0)}%</span>
            </div>
          </div>
          <p className="metric-description">
            {productionLevel > 90 ? 'Producción óptima' : 
             productionLevel > 80 ? 'Producción normal' : 'Por debajo del objetivo'}
          </p>
        </div>

        <div className="summary-card card">
          <h3><i className="fas fa-clipboard-list"></i> Resumen Ejecutivo</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <i className="fas fa-arrow-up text-success"></i>
              <span>Ventas: +15% vs mes anterior</span>
            </div>
            <div className="summary-item">
              <i className="fas fa-users text-info"></i>
              <span>Clientes activos: 1,247</span>
            </div>
            <div className="summary-item">
              <i className="fas fa-box text-warning"></i>
              <span>Productos en stock: 89%</span>
            </div>
            <div className="summary-item">
              <i className="fas fa-truck text-primary"></i>
              <span>Pedidos pendientes: 23</span>
            </div>
          </div>
        </div>

        <div className="trends-card card">
          <h3><i className="fas fa-chart-area"></i> Tendencias de Productos</h3>
          <div className="trend-list">
            <div className="trend-item">
              <span className="product-name">Frutillas congeladas</span>
              <div className="trend-bar">
                <div className="trend-fill" style={{ width: '85%' }}></div>
              </div>
              <span className="trend-value">85%</span>
            </div>
            <div className="trend-item">
              <span className="product-name">Mix de berries</span>
              <div className="trend-bar">
                <div className="trend-fill" style={{ width: '72%' }}></div>
              </div>
              <span className="trend-value">72%</span>
            </div>
            <div className="trend-item">
              <span className="product-name">Espinacas congeladas</span>
              <div className="trend-bar">
                <div className="trend-fill" style={{ width: '68%' }}></div>
              </div>
              <span className="trend-value">68%</span>
            </div>
            <div className="trend-item">
              <span className="product-name">Zanahorias baby</span>
              <div className="trend-bar">
                <div className="trend-fill" style={{ width: '54%' }}></div>
              </div>
              <span className="trend-value">54%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;