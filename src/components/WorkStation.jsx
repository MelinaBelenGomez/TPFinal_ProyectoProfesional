import { useState, useEffect } from 'react';
import axios from 'axios';

const WorkStation = ({ user }) => {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stageInfo, setStageInfo] = useState(null);
  const [showWasteForm, setShowWasteForm] = useState(null);
  const [wasteData, setWasteData] = useState({
    cantidadDesperdiciada: '',
    motivo: '',
    observaciones: ''
  });

  useEffect(() => {
    if (user?.rol === 'OPERARIO' && user?.estacion_asignada) {
      loadLotes();
      loadStageInfo();
    }
  }, [user]);

  const loadLotes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8081/lotes/estacion/${user.estacion_asignada}`);
      setLotes(response.data);
    } catch (error) {
      console.error('Error cargando lotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStageInfo = () => {
    const estacionesInfo = {
      'LAVADO': { title: 'Lavado', description: 'Lavar y desinfectar materia prima', color: '#007bff', icon: 'fas fa-tint', nextStageDisplay: 'Clasificación' },
      'CLASIFICACION': { title: 'Clasificación', description: 'Clasificar por tamaño y calidad', color: '#28a745', icon: 'fas fa-sort', nextStageDisplay: 'Pelado' },
      'PELADO': { title: 'Pelado', description: 'Pelar y preparar productos', color: '#ffc107', icon: 'fas fa-cut', nextStageDisplay: 'Escurrido' },
      'PELADO_TROZADO': { title: 'Pelado y Trozado', description: 'Pelar y trozar productos', color: '#ffc107', icon: 'fas fa-cut', nextStageDisplay: 'Escurrido' },
      'ESCURRIDO': { title: 'Escurrido', description: 'Escurrir exceso de agua', color: '#17a2b8', icon: 'fas fa-filter', nextStageDisplay: 'Congelación' },
      'CONGELACION': { title: 'Congelación', description: 'Congelar productos', color: '#6f42c1', icon: 'fas fa-snowflake', nextStageDisplay: 'Empaquetado' },
      'EMPAQUETADO': { title: 'Empaquetado', description: 'Empaquetar productos finales', color: '#fd7e14', icon: 'fas fa-box', nextStageDisplay: 'Finalizado' }
    };
    setStageInfo(estacionesInfo[user.estacion_asignada]);
  };

  const handleCompleteLote = async (lote) => {  
    const confirmMessage = `¿Confirmar que completaste el lote ${lote.idLote} en ${stageInfo.title}?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    
    try {
      await axios.put(`http://localhost:8081/lotes/completar/${lote.idLote}?idOperario=${user.id}`);
      alert(`✅ Lote completado y enviado a ${stageInfo.nextStageDisplay}`);
      await loadLotes();
    } catch (error) {
      console.error('Error completando lote:', error);
      alert('❌ Error al completar el lote');
    } finally {
      setLoading(false);
    }
  };

  // Verificar que el usuario sea operario y tenga estación asignada
  if (user?.rol !== 'OPERARIO') {
    return (
      <div className="workstation-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          Esta sección es solo para operarios
        </div>
      </div>
    );
  }

  if (!user?.estacion_asignada) {
    return (
      <div className="workstation-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          No tienes una estación asignada. Contacta al jefe de producción.
        </div>
      </div>
    );
  }

  if (!stageInfo) {
    return (
      <div className="workstation-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          No se encontró información para tu estación: {user.estacion_asignada}
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
            <span className="operator-name">Operario: {user.nombre}</span>
          </div>
        </div>
      </div>

      <div className="workstation-stats">
        <div className="stat-card card">
          <div className="stat-icon">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{lotes.length}</div>
            <div className="stat-label">Lotes Pendientes</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">
            <i className="fas fa-arrow-right"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stageInfo.nextStageDisplay}</div>
            <div className="stat-label">Siguiente Etapa</div>
          </div>
        </div>
      </div>

      <div className="orders-section">
        <h3>Lotes en tu Estación</h3>
        
        {loading ? (
          <div className="loading-message">
            <i className="fas fa-spinner fa-spin"></i> Cargando lotes...
          </div>
        ) : lotes.length === 0 ? (
          <div className="empty-message card">
            <i className="fas fa-check-circle"></i>
            <h4>¡Excelente trabajo!</h4>
            <p>No hay lotes pendientes en tu estación de {stageInfo.title}.</p>
            <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '5px', fontSize: '14px' }}>
              <p><strong>🔄 Flujo de trabajo:</strong></p>
              <p>Los lotes llegarán cuando el operario anterior complete su trabajo en la estación previa.</p>
            </div>
          </div>
        ) : (
          <div className="orders-grid">
            {lotes.map((lote) => (
              <div key={lote.idLote} className="order-card card">
                <div className="order-header">
                  <div className="order-code">Lote #{lote.idLote}</div>
                  <div className="order-status">
                    <span className="status-badge status-warning">{lote.estado}</span>
                  </div>
                </div>
                
                <div className="order-details">
                  <h4>Orden #{lote.idOp}</h4>
                  <div className="order-info">
                    <div className="info-item">
                      <i className="fas fa-boxes"></i>
                      <span>Unidades: {lote.unidadesLote}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>Estación: {lote.estacionActual}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-calendar"></i>
                      <span>Inicio: {new Date(lote.fechaInicio).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="order-actions">
                  <button 
                    className="complete-btn"
                    onClick={() => handleCompleteLote(lote)}
                    disabled={loading}
                  >
                    <i className="fas fa-check"></i>
                    Completar {stageInfo.title}
                  </button>

                  <button 
                    className="waste-btn" 
                    onClick={() => setShowWasteForm(lote)}
                    disabled={loading}
                    style={{ backgroundColor: '#ffc107', color: '#000', marginLeft: '10px' }}
                  >
                    🗑️ Registrar Desperdicio
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Modal Registrar Desperdicio */}
      {showWasteForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>🗑️ Registrar Desperdicio - Lote #{showWasteForm.idLote}</h3>
              <button 
                className="btn-close"
                onClick={() => setShowWasteForm(null)}
              >
                ×
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              console.log("Desperdicio registrado:", {
                idLote: showWasteForm.idLote,
                idOp: showWasteForm.idOp,
                estacion: showWasteForm.estacionActual,
                operario: user.nombre,
                ...wasteData
              });
              alert("✅ Desperdicio registrado exitosamente");
              setShowWasteForm(null);
              setWasteData({ cantidadDesperdiciada: '', motivo: '', observaciones: '' });
            }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Lote:</label>
                  <input 
                    type="text" 
                    value={`Lote #${showWasteForm.idLote} - Orden #${showWasteForm.idOp}`} 
                    disabled 
                    style={{backgroundColor: '#f8f9fa'}}
                  />
                </div>
                
                <div className="form-group">
                  <label>Estación:</label>
                  <input 
                    type="text" 
                    value={showWasteForm.estacionActual} 
                    disabled 
                    style={{backgroundColor: '#f8f9fa'}}
                  />
                </div>

                <div className="form-group">
                  <label>Cantidad Desperdiciada (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={wasteData.cantidadDesperdiciada}
                    onChange={(e) => setWasteData({...wasteData, cantidadDesperdiciada: e.target.value})}
                    placeholder="Ej: 2.5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Motivo del Desperdicio:</label>
                  <select
                    value={wasteData.motivo}
                    onChange={(e) => setWasteData({...wasteData, motivo: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar motivo...</option>
                    <option value="producto_defectuoso">Producto defectuoso</option>
                    <option value="contaminacion">Contaminación</option>
                    <option value="error_proceso">Error en el proceso</option>
                    <option value="caducidad">Producto caducado</option>
                    <option value="accidente">Accidente/Derrame</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Observaciones:</label>
                  <textarea
                    value={wasteData.observaciones}
                    onChange={(e) => setWasteData({...wasteData, observaciones: e.target.value})}
                    rows="3"
                    placeholder="Describe los detalles del desperdicio..."
                  ></textarea>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowWasteForm(null)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  💾 Registrar Desperdicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkStation;