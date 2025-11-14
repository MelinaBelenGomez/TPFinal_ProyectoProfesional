import { useState, useEffect } from 'react';
import axios from 'axios';

const Reports = () => {
  const [ordenesReporte, setOrdenesReporte] = useState([]);
  const [estadisticasGlobales, setEstadisticasGlobales] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadReportes();
  }, []);

  const loadOrderDetails = async (idOp) => {
    setLoadingDetails(true);
    try {
      const [materialesRes, resumenRes] = await Promise.all([
        axios.get(`http://localhost:8081/material-op/materiales-orden/${idOp}`),
        axios.get(`http://localhost:8081/material-op/resumen-orden-registro/${idOp}`)
      ]);
      
      console.log('Materiales recibidos:', materialesRes.data); // Debug
      console.log('Resumen desde registro_desperdicio:', resumenRes.data); // Debug
      
      setOrderDetails({
        materiales: materialesRes.data,
        resumen: [resumenRes.data] // Convertir a array para mantener compatibilidad
      });
    } catch (error) {
      console.error('Error cargando detalles:', error);
      setOrderDetails({ materiales: [], resumen: [] });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleShowDetails = async (orden) => {
    setSelectedOrder(orden);
    setShowModal(true);
    await loadOrderDetails(orden.idOp);
  };

  const loadReportes = async () => {
    try {
      const [ordenesRes, statsRes] = await Promise.all([
        axios.get('http://localhost:8081/material-op/reporte-ordenes'),
        axios.get('http://localhost:8081/material-op/estadisticas-desperdicio')
      ]);
      
      console.log('Datos de reportes:', ordenesRes.data); // Debug
      console.log('Estadísticas de desperdicio:', statsRes.data); // Debug
      setOrdenesReporte(ordenesRes.data);
      
      // Procesar estadísticas desde registro_desperdicio
      if (statsRes.data && statsRes.data.length > 0) {
        setEstadisticasGlobales({
          motivoMasFrecuente: statsRes.data[0].motivo,
          vecesMotivo: statsRes.data[0].cantidad
        });
      }
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
    <>
      <style>{`
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          color: white;
        }
        .status-planificada {
          background-color: #ffc107;
          color: black;
        }
        .status-activa {
          background-color: #28a745;
        }
        .status-consumida {
          background-color: #6f42c1;
        }
        .status-pausada {
          background-color: #fd7e14;
        }
        .status-cancelada {
          background-color: #dc3545;
        }
        .status-unknown {
          background-color: #6c757d;
        }
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
        .btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .btn-info {
          background-color: #17a2b8;
          color: white;
        }
        .btn-info:hover {
          background-color: #138496;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #ddd;
        }
        .btn-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }
        .modal-body {
          padding: 20px;
        }
        .materials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .material-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          background: white;
        }
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        .pie-chart-section {
          margin: 30px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .pie-chart-section h4 {
          text-align: center;
          margin-bottom: 20px;
        }
      `}</style>
    <div className="reports-container">
      <div className="reports-header">
        <h2>Reportes de Desperdicios</h2>
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
        <h3>Órdenes de Producción - Desperdicios</h3>
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenesReporte.map((orden, index) => {
                  const desperdicioKg = (orden.totalDesperdiciado / 1000).toFixed(2);
                  
                  return (
                    <tr key={index}>
                      <td><strong>#{orden.idOp}</strong></td>
                      <td>{orden.sku}</td>
                      <td>
                        <span className={`status-badge status-${orden.estado?.toLowerCase() || 'unknown'}`}>
                          {orden.estado?.toUpperCase() || 'SIN ESTADO'}
                        </span>
                      </td>
                      <td>{desperdicioKg} kg</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-info"
                          onClick={() => handleShowDetails(orden)}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          <i className="fas fa-chart-pie"></i> Ver Detalles
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3> Detalles de Desperdicio - Orden #{selectedOrder.idOp}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {loadingDetails ? (
                <div className="loading-message">
                  <i className="fas fa-spinner fa-spin"></i> Cargando detalles...
                </div>
              ) : orderDetails ? (
                <>
                  <div className="order-summary">
                    <h4>Resumen General</h4>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <strong>Producto:</strong> {selectedOrder.sku}
                      </div>
                      <div className="summary-item">
                        <strong>Estado:</strong> 
                        <span className={`status-badge status-${selectedOrder.estado?.toLowerCase()}`}>
                          {selectedOrder.estado}
                        </span>
                      </div>
                      <div className="summary-item">
                        <strong>Desperdicio Total:</strong> {(selectedOrder.totalDesperdiciado / 1000).toFixed(2)} kg
                      </div>
                    </div>
                  </div>

                  {/* Gráfico de Torta */}
                  {(() => {
                    const totalReservado = orderDetails.materiales?.reduce((sum, m) => sum + (m.cantidadReservada || 0), 0) || 0;
                    const totalDesperdiciado = orderDetails.materiales?.reduce((sum, m) => sum + (m.cantidadDesperdiciada || 0), 0) || 0;
                    const totalUtilizado = totalReservado - totalDesperdiciado;
                    const porcentajeDesperdicio = totalReservado > 0 ? ((totalDesperdiciado / totalReservado) * 100).toFixed(1) : 0;
                    
                    if (totalReservado === 0) return null;
                    
                    return (
                      <div className="pie-chart-section">
                        <h4>Eficiencia de Materiales</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', justifyContent: 'center' }}>
                          <div className="pie-chart" style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            background: `conic-gradient(#28a745 0deg ${(totalUtilizado/totalReservado)*360}deg, #dc3545 ${(totalUtilizado/totalReservado)*360}deg 360deg)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}>
                            <div style={{
                              width: '80px',
                              height: '80px',
                              borderRadius: '50%',
                              background: 'white',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>{porcentajeDesperdicio}%</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>Desperdicio</div>
                            </div>
                          </div>
                          <div className="pie-legend">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                              <div style={{ width: '16px', height: '16px', backgroundColor: '#28a745', borderRadius: '3px' }}></div>
                              <span>Material Utilizado: {(totalUtilizado/1000).toFixed(2)} kg</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '16px', height: '16px', backgroundColor: '#dc3545', borderRadius: '3px' }}></div>
                              <span>Material Desperdiciado: {(totalDesperdiciado/1000).toFixed(2)} kg</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="materials-section">
                    <h4>Desperdicio por Material</h4>
                    {orderDetails.materiales && orderDetails.materiales.length > 0 ? (
                      <div className="materials-grid">
                        {orderDetails.materiales.map((material, index) => {
                          const porcentajeDesperdicio = material.cantidadReservada > 0 
                            ? ((material.cantidadDesperdiciada / material.cantidadReservada) * 100).toFixed(1)
                            : 0;
                          
                          return (
                            <div key={index} className="material-card">
                              <div className="material-header">
                                <strong>{material.sku}</strong>
                                <span className="percentage">{porcentajeDesperdicio}%</span>
                              </div>
                              <div className="material-details">
                                <div>Reservado: {material.cantidadReservada}g</div>
                                <div>Desperdiciado: {material.cantidadDesperdiciada}g</div>
                                <div>Pendiente: {material.cantidadPendiente}g</div>
                              </div>
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill"
                                  style={{ 
                                    width: `${porcentajeDesperdicio}%`,
                                    backgroundColor: porcentajeDesperdicio > 20 ? '#dc3545' : 
                                                   porcentajeDesperdicio > 10 ? '#ffc107' : '#28a745'
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p>No hay datos de materiales disponibles</p>
                    )}
                  </div>

                  {orderDetails.resumen && orderDetails.resumen.length > 0 && (
                    <div className="waste-summary">
                      <h4>Análisis de Desperdicios</h4>
                      <div className="waste-stats">
                        <div className="stat-item">
                          <i className="fas fa-exclamation-triangle"></i>
                          <span>Material más desperdiciado: <strong>{orderDetails.resumen[0]?.skuMayorDesperdicio}</strong></span>
                        </div>
                        <div className="stat-item">
                          <i className="fas fa-chart-bar"></i>
                          <span>Motivo más frecuente: <strong>{orderDetails.resumen[0]?.motivoPrincipal?.replace('_', ' ')}</strong></span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p>No se pudieron cargar los detalles</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Reports;