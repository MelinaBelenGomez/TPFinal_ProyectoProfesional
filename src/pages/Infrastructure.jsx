import { useState, useEffect } from 'react';
import ProductionServiceAxios from '../services/productionServiceAxios';
import MapPicker from '../components/MapPicker';

const Infrastructure = () => {
  const [centros, setCentros] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCentro, setNewCentro] = useState({ sucursal: '', descripcion: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showMapPicker, setShowMapPicker] = useState(true);
  // include lat/lon in newCentro
  useEffect(() => {
    if (!newCentro.lat) setNewCentro(c => ({ ...c, lat: '' }));
    if (!newCentro.lon) setNewCentro(c => ({ ...c, lon: '' }));
  }, []);
  const [newAlmacen, setNewAlmacen] = useState({ nombre: '', capacidad: '', estado: 'ACTIVO', idCentro: '' });
  const [centroFilter, setCentroFilter] = useState('');
  const [almacenFilter, setAlmacenFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('all');

  useEffect(() => {
    loadCentros();
    loadAlmacenes();
  }, []);

  const loadCentros = async () => {
    setLoading(true);
    try {
      const response = await ProductionServiceAxios.getCentros();
      if (response.success) {
        setCentros(response.data);
      }
    } catch (error) {
      console.error('Error cargando centros:', error);
    }
    setLoading(false);
  };

  const loadAlmacenes = async () => {
    try {
      const response = await ProductionServiceAxios.getAlmacenes();
      if (response.success) {
        setAlmacenes(response.data);
      }
    } catch (error) {
      console.error('Error cargando almacenes:', error);
    }
  };

  const handleCreateCentro = async (e) => {
    e.preventDefault();
    if (!newCentro.sucursal || !newCentro.descripcion) {
      alert('Complete todos los campos');
      return;
    }

    // Convert lat/lon to numbers if present
    const payload = {
      ...newCentro,
      lat: newCentro.lat !== '' && newCentro.lat !== null ? parseFloat(newCentro.lat) : null,
      lon: newCentro.lon !== '' && newCentro.lon !== null ? parseFloat(newCentro.lon) : null
    };

    const response = await ProductionServiceAxios.createCentro(payload);
    if (response.success) {
      alert(response.message);
      setNewCentro({ sucursal: '', descripcion: '' });
      loadCentros();
    } else {
      alert(response.message);
    }
  };

  // Búsqueda simple usando Nominatim (OpenStreetMap)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery || searchQuery.trim() === '') return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error en búsqueda de direcciones', err);
      setSearchResults([]);
    }
  };

  const handleSelectSearch = (item) => {
    setNewCentro({ ...newCentro, lat: item.lat, lon: item.lon });
    setSearchResults([]);
    setSearchQuery(item.display_name || `${item.lat}, ${item.lon}`);
  };

  const handleCreateAlmacen = async (e) => {
    e.preventDefault();
    if (!newAlmacen.nombre || !newAlmacen.capacidad || !newAlmacen.idCentro) {
      alert('Complete todos los campos');
      return;
    }

    const response = await ProductionServiceAxios.createAlmacen(newAlmacen);
    if (response.success) {
      alert(response.message);
      setNewAlmacen({ nombre: '', capacidad: '', estado: 'ACTIVO', idCentro: '' });
      loadAlmacenes();
    } else {
      alert(response.message);
    }
  };

  // Modal para ver mapa
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapModalCoords, setMapModalCoords] = useState(null);
  const [mapModalTitle, setMapModalTitle] = useState('');

  const openMap = (coords, title) => {
    if (!coords || coords.lat == null || coords.lon == null) return;
    setMapModalCoords({ lat: parseFloat(coords.lat), lon: parseFloat(coords.lon) });
    setMapModalTitle(title || 'Ubicación');
    setMapModalOpen(true);
  };

  const closeMap = () => {
    setMapModalOpen(false);
    setMapModalCoords(null);
    setMapModalTitle('');
  };

  return (
    <>
    <div className="infrastructure-container">
      <div className="header">
        <h2>Infraestructura</h2>
        <p>Gestión de centros de producción y almacenes</p>
      </div>

      {/* Sección Centros de Producción */}
      <div className="card">
        <h3>Centros de Producción</h3>
        
        <form onSubmit={handleCreateCentro} style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Sucursal"
              value={newCentro.sucursal}
              onChange={(e) => setNewCentro({...newCentro, sucursal: e.target.value})}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Descripción"
              value={newCentro.descripcion}
              onChange={(e) => setNewCentro({...newCentro, descripcion: e.target.value})}
            />
          </div>
          <div style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
            <input
              type="text"
              placeholder="Buscar dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{flex: 1}}
            />
            <button onClick={handleSearch} style={{padding: '6px 10px'}}>Buscar</button>
          </div>
          {searchResults.length > 0 && (
            <div style={{maxHeight: '150px', overflowY: 'auto', background: '#fff', border: '1px solid #ddd', padding: '6px', marginBottom: '8px'}}>
              {searchResults.map((r, idx) => (
                <div key={idx} style={{padding: '6px', cursor: 'pointer'}} onClick={() => handleSelectSearch(r)}>
                  <strong>{r.display_name}</strong>
                  <div style={{fontSize: '12px', color: '#666'}}>{r.lat}, {r.lon}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{marginBottom: '8px'}}>
            <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '6px'}}>
              <button type="button" onClick={() => setShowMapPicker(s => !s)} style={{padding: '6px 10px'}}>{showMapPicker ? 'Ocultar mapa' : 'Marcar en mapa'}</button>
            </div>
            {showMapPicker && (
              <div style={{height: '300px'}}>
                <MapPicker height="100%" initialLat={-34.6} initialLon={-58.4} selected={newCentro.lat && newCentro.lon ? {lat: parseFloat(newCentro.lat), lon: parseFloat(newCentro.lon)} : null} onSelect={(coords) => setNewCentro({...newCentro, lat: coords.lat, lon: coords.lon})} />
              </div>
            )}
          </div>

          <div style={{display: 'flex', gap: '8px', marginBottom: '12px'}}>
            <input
              type="number"
              step="any"
              placeholder="Latitud"
              value={newCentro.lat}
              onChange={(e) => setNewCentro({...newCentro, lat: e.target.value})}
              style={{flex: 1}}
            />
            <input
              type="number"
              step="any"
              placeholder="Longitud"
              value={newCentro.lon}
              onChange={(e) => setNewCentro({...newCentro, lon: e.target.value})}
              style={{flex: 1}}
            />
          </div>
          <button type="submit">➕ Crear Centro</button>
        </form>

        {loading ? (
          <p>🔄 Cargando centros...</p>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4>Centros disponibles:</h4>
              <input
                type="text"
                placeholder="🔍 Buscar por sucursal..."
                value={centroFilter}
                onChange={(e) => setCentroFilter(e.target.value)}
                style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
              />
            </div>
            {centros.filter(centro => 
              centro.sucursal.toLowerCase().includes(centroFilter.toLowerCase())
            ).length > 0 ? (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ cursor: 'pointer' }}>ID</th>
                    <th style={{ cursor: 'pointer' }}>Sucursal</th>
                    <th style={{ cursor: 'pointer' }}>Descripción</th>
                    <th style={{ cursor: 'pointer' }}>Mapa</th>
                  </tr>
                </thead>
                <tbody>
                  {centros
                    .filter(centro => centro.sucursal.toLowerCase().includes(centroFilter.toLowerCase()))
                    .sort((a, b) => a.sucursal.localeCompare(b.sucursal))
                    .map((centro) => (
                    <tr key={centro.idCentro}>
                      <td>{centro.idCentro}</td>
                      <td>🏢 {centro.sucursal}</td>
                      <td>{centro.descripcion}</td>
                      <td>
                        {centro.lat && centro.lon ? (
                          <button onClick={() => openMap({ lat: parseFloat(centro.lat), lon: parseFloat(centro.lon) }, centro.sucursal)}>Ver mapa</button>
                        ) : (
                          <span style={{color: '#888'}}>Sin ubicación</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
                <p> <strong>No hay centros creados</strong></p>
                <p>Crea el primer centro de producción usando el formulario de arriba.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección Almacenes */}
      <div className="card">
        <h3>Almacenes</h3>
        
        <form onSubmit={handleCreateAlmacen} style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Nombre del almacén"
              value={newAlmacen.nombre}
              onChange={(e) => setNewAlmacen({...newAlmacen, nombre: e.target.value})}
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="Capacidad"
              value={newAlmacen.capacidad}
              onChange={(e) => setNewAlmacen({...newAlmacen, capacidad: e.target.value})}
            />
          </div>
          <div className="form-group">
            <select
              value={newAlmacen.estado}
              onChange={(e) => setNewAlmacen({...newAlmacen, estado: e.target.value})}
            >
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
          </div>
          <div className="form-group">
            <select
              value={newAlmacen.idCentro}
              onChange={(e) => setNewAlmacen({...newAlmacen, idCentro: e.target.value})}
            >
              <option value="">Seleccionar centro de producción</option>
              {centros.map((centro) => (
                <option key={centro.idCentro} value={centro.idCentro}>
                  {centro.sucursal} - {centro.descripcion}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={centros.length === 0}>
            ➕ Crear Almacén
          </button>
        </form>

        {centros.length === 0 && (
          <div style={{ padding: '10px', background: '#fff3cd', borderRadius: '5px', marginBottom: '10px' }}>
            <p>⚠️ <strong>Primero crea un centro de producción</strong></p>
            <p>Los almacenes deben estar asociados a un centro de producción.</p>
          </div>
        )}

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
            <h4>Almacenes disponibles:</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="🔍 Buscar almacén..."
                value={almacenFilter}
                onChange={(e) => setAlmacenFilter(e.target.value)}
                style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
              />
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
              >
                <option value="all">Todos los estados</option>
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>
          </div>
          {almacenes
            .filter(almacen => 
              almacen.nombre.toLowerCase().includes(almacenFilter.toLowerCase()) &&
              (estadoFilter === 'all' || almacen.estado === estadoFilter)
            ).length > 0 ? (
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }}>ID</th>
                  <th style={{ cursor: 'pointer' }}>Nombre</th>
                  <th style={{ cursor: 'pointer' }}>Capacidad</th>
                  <th style={{ cursor: 'pointer' }}>Estado</th>
                  <th style={{ cursor: 'pointer' }}>Centro</th>
                    <th style={{ cursor: 'pointer' }}>Mapa</th>
                </tr>
              </thead>
              <tbody>
                {almacenes
                  .filter(almacen => 
                    almacen.nombre.toLowerCase().includes(almacenFilter.toLowerCase()) &&
                    (estadoFilter === 'all' || almacen.estado === estadoFilter)
                  )
                  .sort((a, b) => a.nombre.localeCompare(b.nombre))
                  .map((almacen) => (
                  <tr key={almacen.idAlmacen}>
                    <td>{almacen.idAlmacen}</td>
                    <td>🏪 {almacen.nombre}</td>
                    <td>{almacen.capacidad}</td>
                    <td><span style={{color: almacen.estado === 'ACTIVO' ? 'green' : 'red'}}>{almacen.estado}</span></td>
                    <td>🏢 {centros.find(c => c.idCentro === almacen.idCentro)?.sucursal || 'N/A'}</td>
                    <td>
                      {(() => {
                        const centro = centros.find(c => c.idCentro === almacen.idCentro);
                        if (centro && centro.lat && centro.lon) {
                          return <button onClick={() => openMap({ lat: parseFloat(centro.lat), lon: parseFloat(centro.lon) }, centro.sucursal)}>Ver mapa</button>
                        }
                        return <span style={{color: '#888'}}>Sin ubicación</span>
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
              <p>📊 <strong>No hay almacenes creados</strong></p>
              <p>Crea el primer almacén usando el formulario de arriba.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    {mapModalOpen && (
      <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
        <div style={{width: '90%', maxWidth: '900px', height: '70%', background: '#fff', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
            <h3 style={{margin: 0}}>{mapModalTitle}</h3>
            <button onClick={closeMap} style={{padding: '6px 10px'}}>Cerrar</button>
          </div>
          <div style={{flex: 1}}>
            {mapModalCoords ? (
              <div style={{height: '100%'}}>
                <MapPicker height="100%" initialLat={mapModalCoords.lat} initialLon={mapModalCoords.lon} selected={{lat: mapModalCoords.lat, lon: mapModalCoords.lon}} interactive={false} />
              </div>
            ) : (
              <div>Coordenadas no disponibles</div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Infrastructure;