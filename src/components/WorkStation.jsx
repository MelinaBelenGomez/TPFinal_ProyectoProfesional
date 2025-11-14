import { useState, useEffect } from 'react';
import axios from 'axios';

const WorkStation = ({ user }) => {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stageInfo, setStageInfo] = useState(null);
  const [showWasteForm, setShowWasteForm] = useState(null);
  const [wasteData, setWasteData] = useState({
    motivo: '',
    materiales: [] // Array de {sku, nombre, desperdicio_gramos}
  });
  const [wasteStats, setWasteStats] = useState([]);
  const [bomMateriales, setBomMateriales] = useState([]);
  const [loadingBom, setLoadingBom] = useState(false);
  const [productionConfig, setProductionConfig] = useState(null);
  const [bomData, setBomData] = useState({});

  useEffect(() => {
    if (user?.rol === 'OPERARIO' && user?.estacion_asignada) {
      loadProductionConfig();
      loadLotes();
      loadStageInfo();
    }
  }, [user]);

  const loadLotes = async () => {
    setLoading(true);
    try {
      // Mapear estación del usuario a estación en BD
      const estacionBD = user.estacion_asignada === 'PELADO_TROZADO' ? 'PELADO' : user.estacion_asignada;
      const response = await axios.get(`http://localhost:8081/lotes/estacion/${estacionBD}`);
      // Filtrar solo lotes activos (no cancelados)
      const lotesData = response.data.filter(lote => 
        lote.estado !== 'CANCELADO' && lote.estado !== 'cancelado'
      );
      
      // Cargar datos de orden para cada lote único
      const ordenesUnicas = [...new Set(lotesData.map(lote => lote.idOp))];
      const ordenPromises = ordenesUnicas.map(async (idOp) => {
        try {
          const ordenResponse = await axios.get(`http://localhost:8081/ordenes-produccion/consultar/${idOp}`);
          const bomResponse = await axios.get(`http://localhost:8081/bom/${ordenResponse.data.sku}`);
          const pesoUnitario = bomResponse.data.reduce((total, item) => total + (item.cantPorUnidad || 0), 0);
          return { 
            idOp, 
            cantidad: ordenResponse.data.cantidad,
            pesoUnitario 
          };
        } catch (error) {
          console.error(`Error cargando datos para orden ${idOp}:`, error);
          return { idOp, cantidad: 500, pesoUnitario: 500 };
        }
      });
      
      const ordenResults = await Promise.all(ordenPromises);
      const ordenMap = {};
      ordenResults.forEach(result => {
        ordenMap[result.idOp] = result;
      });
      setBomData(ordenMap);
      
      setLotes(lotesData);
    } catch (error) {
      console.error('Error cargando lotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductionConfig = async () => {
    try {
      const response = await axios.get('http://localhost:8081/config-produccion');
      setProductionConfig({
        cantidad_base_orden: response.data.cantidadBaseOrden,
        numero_lotes_fijo: response.data.numeroLotesFijo
      });
    } catch (error) {
      console.error('Error cargando configuración:', error);
      setProductionConfig({
        cantidad_base_orden: 500,
        numero_lotes_fijo: 10
      });
    }
  };

  const calculateBatchWeight = (lote) => {
    if (!productionConfig || !bomData[lote.idOp]) {
      return '0.0';
    }
    
    const ordenData = bomData[lote.idOp];
    const cantidad = ordenData.cantidad || 500;
    const pesoUnitario = ordenData.pesoUnitario || 500;
    const numeroLotes = productionConfig.numero_lotes_fijo || 10;
    
    console.log('Debug peso lote:', { loteId: lote.idLote, cantidad, pesoUnitario, numeroLotes, ordenData });
    
    const pesoTotalOrden = (cantidad * pesoUnitario) / 1000;
    const pesoPorLote = pesoTotalOrden / numeroLotes;
    
    return pesoPorLote.toFixed(1);
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

  const handleShowWasteForm = async (lote) => {
    setLoadingBom(true);
    try {
      // Obtener la orden de producción para conseguir el SKU
      const ordenResponse = await axios.get(`http://localhost:8081/ordenes-produccion/consultar/${lote.idOp}`);
      const sku = ordenResponse.data.sku;
      
      // Obtener BOM del producto
      const bomResponse = await axios.get(`http://localhost:8081/bom/${sku}`);
      
      // Inicializar materiales con desperdicio en 0
      const materialesConDesperdicio = bomResponse.data.map(material => ({
        sku: material.skuMaterial,
        nombre: material.skuMaterial, // Podrías obtener el nombre del producto si lo necesitas
        desperdicio_gramos: 0
      }));
      
      setBomMateriales(materialesConDesperdicio);
      setWasteData({
        motivo: '',
        materiales: materialesConDesperdicio
      });
      
      // Cargar estadísticas de desperdicios
      loadWasteStats();
      setShowWasteForm(lote);
    } catch (error) {
      console.error('Error cargando BOM:', error);
      alert('❌ Error al cargar los materiales del producto');
    } finally {
      setLoadingBom(false);
    }
  };

  const loadWasteStats = async () => {
    try {
      const response = await axios.get('http://localhost:8081/material-op/estadisticas-desperdicio');
      setWasteStats(response.data.slice(0, 3)); // Top 3 motivos
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setWasteStats([]);
    }
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
              <p><em>Nota: Los lotes cancelados no aparecen en esta lista.</em></p>
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
                      <i className="fas fa-weight"></i>
                      <span>Peso: {calculateBatchWeight(lote)} kg</span>
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
                    onClick={() => handleShowWasteForm(lote)}
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
            <form onSubmit={async (e) => {
              e.preventDefault();
              
              try {
                // Registrar desperdicio para cada material
                for (const material of wasteData.materiales) {
                  if (material.desperdicio_gramos > 0) {
                    const payload = {
                      idOp: showWasteForm.idOp,
                      sku: material.sku,
                      cantidadDesperdiciada: material.desperdicio_gramos,
                      motivo: wasteData.motivo,
                      estacion: user.estacion_asignada,
                      operario: user.nombre || user.username
                    };
                    console.log('Enviando desperdicio:', payload);
                    await axios.put('http://localhost:8081/material-op/registrar-desperdicio', payload);
                  }
                }
                
                alert("✅ Desperdicio registrado exitosamente");
                setShowWasteForm(null);
                setWasteData({ motivo: '', materiales: [] });
                setBomMateriales([]);
              } catch (error) {
                console.error('Error registrando desperdicio:', error);
                const errorMsg = error.response?.data || error.message || 'Error desconocido';
                alert('❌ Error al registrar desperdicio: ' + errorMsg);
              }
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

                {/* Materiales del BOM */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Desperdicio por Material:</label>
                  {loadingBom ? (
                    <p>Cargando materiales...</p>
                  ) : (
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
                      {bomMateriales.map((material, index) => (
                        <div key={material.sku} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', padding: '8px', background: '#f8f9fa', borderRadius: '4px' }}>
                          <div style={{ flex: 1, marginRight: '10px' }}>
                            <strong>{material.sku}</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="Gramos"
                              value={material.desperdicio_gramos}
                              onChange={(e) => {
                                const nuevosMaterieles = [...wasteData.materiales];
                                nuevosMaterieles[index].desperdicio_gramos = parseInt(e.target.value) || 0;
                                setWasteData({...wasteData, materiales: nuevosMaterieles});
                              }}
                              style={{ width: '80px', padding: '4px' }}
                            />
                            <span>g</span>
                            <span style={{ color: '#6c757d', fontSize: '12px' }}>
                              ({(material.desperdicio_gramos / 1000).toFixed(3)} kg)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

                {/* Estadísticas de desperdicios más frecuentes */}
                {wasteStats.length > 0 && (
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>📊 Motivos más frecuentes de desperdicio:</label>
                    <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
                      {wasteStats.map((stat, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span>🔸 {stat.motivo.replace('_', ' ')}</span>
                          <span><strong>{stat.cantidad} registros</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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