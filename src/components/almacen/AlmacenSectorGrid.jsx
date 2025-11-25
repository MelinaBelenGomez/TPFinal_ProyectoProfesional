import React, { useState, useEffect } from 'react';
import ProductionServiceAxios from '../../services/productionServiceAxios';
import './AlmacenSectorGrid.css';

const AlmacenSectorGrid = ({ almacenId, sku, onSectorAssigned }) => {
  const [sectores, setSectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningSectorId, setAssigningSectorId] = useState(null);

  // Cargar sectores del almacén cuando cambian las props
  useEffect(() => {
    const loadData = async () => {
      if (!almacenId) return;

      setLoading(true);
      try {
        await loadSectores(almacenId);
      } catch (error) {
        console.error('Error al cargar datos del almacén:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [almacenId]);

  const loadSectores = async (idAlmacen) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8081/api/sectores-almacen/${idAlmacen}`);
      if (response.ok) {
        const data = await response.json();
        setSectores(data);
      } else {
        console.error('Error al cargar sectores:', await response.text());
      }
    } catch (error) {
      console.error('Error al cargar sectores:', error);
    } finally {
      // el loading general se maneja en loadData
    }
  };

  const handleAssignSector = async (sector) => {
    if (!almacenId || !sku) return;

    try {
      // el DTO SectorConStockDTO expone el id real del sector en la propiedad idSector
      const idSector = sector.idSector;

      setAssigningSectorId(idSector);
      const response = await ProductionServiceAxios.asignarSectorStock(sku, almacenId, idSector);

      if (!response.success) {
        alert(response.message || 'Error al asignar sector');
        return;
      }

      // Recargar sectores para reflejar el cambio
      await loadSectores(almacenId);

      if (onSectorAssigned) {
        onSectorAssigned(sector);
      }
    } catch (error) {
      console.error('Error al asignar sector:', error);
      alert('Error al asignar sector');
    } finally {
      setAssigningSectorId(null);
    }
  };

  if (loading && !almacenId) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="asg-spinner" />
        <p>Cargando datos del almacén...</p>
      </div>
    );
  }

  // calcular filas y columnas máximas para armar el plano
  const maxFila = sectores.reduce((max, s) => (s.fila && s.fila > max ? s.fila : max), 0);
  const maxColumna = sectores.reduce((max, s) => (s.columna && s.columna > max ? s.columna : max), 0);

  return (
    <div className="sector-grid-container">
      <h3>Ubicación en sectores del almacén</h3>

      {!almacenId && (
        <p>Seleccione un almacén para ver los sectores.</p>
      )}

      {loading ? (
        <div className="sector-grid-loading">
          <div className="asg-spinner" />
          <p>Cargando sectores...</p>
        </div>
      ) : (
        <>
          <div className="sector-grid-wrapper">
            <div
              className="sector-grid"
              style={maxColumna ? { gridTemplateColumns: `repeat(${maxColumna}, 1fr)` } : undefined}
            >
              {sectores.map((sector) => {
                const isCurrent = sku && sector.skuProducto === sku;

                const classes = [
                  'sector-item',
                  isCurrent ? 'sector-item-current' : null,
                  sector.tipoProducto ? `sector-tipo-${String(sector.tipoProducto).toLowerCase()}` : null
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <div
                    key={String(sector.idSector)}
                    className={classes}
                    style={
                      sector.fila && sector.columna
                        ? { gridRow: sector.fila, gridColumn: sector.columna }
                        : undefined
                    }
                    onClick={() => handleAssignSector(sector)}
                  >
                    {isCurrent && (
                      <div className="sector-current-label">AQUÍ</div>
                    )}
                    <div className="sector-card-header">
                      <span className="sector-title">{sector.nombre || `Sector ${sector.fila}-${sector.columna}`}</span>
                      <span className="sector-tipo">{sector.tipoProducto || 'Sin tipo'}</span>
                    </div>
                    <div className="sector-card-content">
                      <div className="sector-info">
                        <div className="sector-condicion">
                          {sector.condicion || 'Sin condición'}
                        </div>
                        {sector.skuProducto ? (
                          <>
                            <div className="sector-producto">
                              <strong>SKU:</strong> {sector.skuProducto}
                            </div>
                            <div className="sector-stock">
                              <strong>Stock:</strong> {sector.stockDisponible || 0} unidades
                            </div>
                            {isCurrent && (
                              <div className="sector-actual">
                                <span className="sector-pin" />
                                <em>Sector actual de esta materia prima</em>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="sector-vacio">
                            <em>Espacio disponible (clic para asignar aquí)</em>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {assigningSectorId && (
                <div className="sector-grid-loading">
                  <div className="asg-spinner asg-spinner-small" /> Asignando sector...
                </div>
              )}
            </div>
          </div>

          {/* Lista resumen de sectores con materia prima */}
          {sectores.some(s => s.skuProducto) && (
            <div className="sector-list">
              <h4>Materias primas por sector</h4>
              {sectores
                .filter(s => s.skuProducto)
                .map(s => (
                  <div key={`list-${s.idSector}`} className="sector-list-item">
                    <div className="sector-list-main">
                      <span
                        className={[
                          'sector-color-dot',
                          s.tipoProducto ? `sector-tipo-${String(s.tipoProducto).toLowerCase()}` : ''
                        ].join(' ').trim()}
                      />
                      <span className="sector-list-title">
                        Sector F{s.fila}-C{s.columna} — {s.condicion || 'Sin condición'}
                      </span>
                    </div>
                    <div className="sector-list-sub">
                      SKU: {s.skuProducto} · Stock: {s.stockDisponible || 0} unidades
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default React.memo(AlmacenSectorGrid);