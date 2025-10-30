import { useState, useEffect } from 'react';
import WorkflowService from '../services/workflowService';

const WorkStation = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stageInfo, setStageInfo] = useState(null);
const [showErrorForm, setShowErrorForm] = useState(null); // guarda el ID de la orden con el form abierto

const [errorData, setErrorData] = useState({
  lote: '',
  estado: '',
  observaciones: ''
});

  useEffect(() => {
    loadOrders();
    loadStageInfo();
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await WorkflowService.getOrdersForRole(user.role);
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error cargando órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStageInfo = () => {
    const info = WorkflowService.getStageInfo(user.role);
    setStageInfo(info);
  };

  const handleCompleteStage = async (order) => {  
    const confirmMessage = `¿Confirmar que completaste la etapa de ${stageInfo.title} para la orden ${order.codigo}?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await WorkflowService.completeStage({
        id_op: order.id_op,
        estado_actual: order.estado,
        usuario_operario: user.username,
        observaciones: ''
      });

      if (response.success) {
        alert(`✅ ${response.message}`);
        // Recargar órdenes para actualizar la lista
        await loadOrders();
      } else {
        alert(`❌ Error: ${response.message}`);
      }
    } catch (error) {
      console.error('Error completando etapa:', error);
      alert('❌ Error al completar la etapa');
    } finally {
      setLoading(false);
    }
  };

  if (!stageInfo) {
    return (
      <div className="workstation-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          No se encontró información para tu rol: {user.role}
        </div>
      </div>
    );
  }

  return (
    <div className="workstation-container">
      <div className="workstation-header">
        <div className="stage-info">
          <div className="stage-icon" style={{ backgroundColor: stageInfo.color }}>
            <i className={stageInfo.icon}></i>
          </div>
          <div className="stage-details">
            <h2>{stageInfo.title}</h2>
            <p>{stageInfo.description}</p>
            <span className="operator-name">Operario: {user.nombre_completo}</span>
          </div>
        </div>
      </div>

      

      <div className="workstation-stats">
        <div className="stat-card card">
          <div className="stat-icon">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{orders.length}</div>
            <div className="stat-label">Órdenes Pendientes</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">
            <i className="fas fa-arrow-right"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stageInfo.nextStage}</div>
            <div className="stat-label">Siguiente Etapa</div>
          </div>
        </div>
      </div>

     
      <div className="orders-section">
        <h3>Órdenes en tu Estación</h3>
        
        {loading ? (
          <div className="loading-message">
            <i className="fas fa-spinner fa-spin"></i> Cargando órdenes...
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-message card">
            <i className="fas fa-check-circle"></i>
            <h4>¡Excelente trabajo!</h4>
            <p>No hay órdenes pendientes en tu estación.</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order.id_op} className="order-card card">
                <div className="order-header">
                  <div className="order-code">{order.codigo}</div>
                  <div className="order-status">
                    <span className="status-badge status-warning">{order.estado}</span>
                  </div>
                </div>
                
                <div className="order-details">
                  <h4>{order.producto_nombre}</h4>
                  <div className="order-info">
                    <div className="info-item">
                      <i className="fas fa-barcode"></i>
                      <span>SKU: {order.sku}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-boxes"></i>
                      <span>Cantidad: {order.cantidad} unidades</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-calendar"></i>
                      <span>Creada: {new Date(order.fecha_creacion).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>
                <div className="order-actions">
                <button 
                  className="complete-btn"
                  onClick={() => handleCompleteStage(order)}
                  disabled={loading}
                >
                  <i className="fas fa-check"></i>
                  Completar {stageInfo.title}
                </button>

                {/* Botón de reportar error, solo para ciertos perfiles */}
                {(
                  <button 
                    className="error-btn" 
                    onClick={() => setShowErrorForm(order)}
                    disabled={loading}
                  >
                    ⚠️ Reportar Error
                  </button>

                )}



                {showErrorForm && (
                  <div className="modal-overlay">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h3>Reportar Error - Orden {showErrorForm.codigo}</h3>
                        <button 
                          className="btn-close"
                          onClick={() => setShowErrorForm(null)}
                        >
                          ×
                        </button>
                      </div>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        console.log("Datos de error reportado:", {
                          orden: showErrorForm.codigo,
                          ...errorData
                        });
                        alert("✅ Error reportado");
                        setShowErrorForm(null);
                        setErrorData({ lote: '', estado: '', observaciones: '' });
                      }}>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Orden:</label>
                            <input type="text" value={showErrorForm.codigo} disabled />
                          </div>

                          <div className="form-group">
                            <label>Lote:</label>
                            <input
                              type="text"
                              value={errorData.lote}
                              onChange={(e) => setErrorData({...errorData, lote: e.target.value})}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label>Estado:</label>
                            <select
                              value={errorData.estado}
                              onChange={(e) => setErrorData({...errorData, estado: e.target.value})}
                              required
                            >
                              <option value="">Seleccionar...</option>
                              <option value="cancelado">Cancelado</option>
                              <option value="pausado">Pausado</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Observaciones:</label>
                            <textarea
                              value={errorData.observaciones}
                              onChange={(e) => setErrorData({...errorData, observaciones: e.target.value})}
                              rows="3"
                            ></textarea>
                          </div>
                        </div>

                        <div className="form-actions">
                          <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={() => setShowErrorForm(null)}
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                          >
                            Guardar y Salir
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                  
                )}


              </div>


              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkStation;