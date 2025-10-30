import { useState, useEffect } from 'react';
import ProductionServiceAxios from '../services/productionServiceAxios';

const Infrastructure = () => {
  const [centros, setCentros] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCentro, setNewCentro] = useState({ sucursal: '', descripcion: '' });
  const [newAlmacen, setNewAlmacen] = useState({ nombre: '', capacidad: '', estado: 'ACTIVO', idCentro: '' });

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

    const response = await ProductionServiceAxios.createCentro(newCentro);
    if (response.success) {
      alert(response.message);
      setNewCentro({ sucursal: '', descripcion: '' });
      loadCentros();
    } else {
      alert(response.message);
    }
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

  return (
    <div className="infrastructure-container">
      <div className="header">
        <h2>🏭 Infraestructura</h2>
        <p>Gestión de centros de producción y almacenes</p>
      </div>

      {/* Sección Centros de Producción */}
      <div className="card">
        <h3>🏢 Centros de Producción</h3>
        
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
          <button type="submit">➕ Crear Centro</button>
        </form>

        {loading ? (
          <p>🔄 Cargando centros...</p>
        ) : (
          <div>
            <h4>Centros disponibles:</h4>
            {centros.length > 0 ? (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Sucursal</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {centros.map((centro) => (
                    <tr key={centro.idCentro}>
                      <td>{centro.idCentro}</td>
                      <td>🏢 {centro.sucursal}</td>
                      <td>{centro.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
                <p>📊 <strong>No hay centros creados</strong></p>
                <p>Crea el primer centro de producción usando el formulario de arriba.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección Almacenes */}
      <div className="card">
        <h3>🏪 Almacenes</h3>
        
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
          <h4>Almacenes disponibles:</h4>
          {almacenes.length > 0 ? (
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Capacidad</th>
                  <th>Estado</th>
                  <th>Centro</th>
                </tr>
              </thead>
              <tbody>
                {almacenes.map((almacen) => (
                  <tr key={almacen.idAlmacen}>
                    <td>{almacen.idAlmacen}</td>
                    <td>🏪 {almacen.nombre}</td>
                    <td>{almacen.capacidad}</td>
                    <td><span style={{color: almacen.estado === 'ACTIVO' ? 'green' : 'red'}}>{almacen.estado}</span></td>
                    <td>🏢 {centros.find(c => c.idCentro === almacen.idCentro)?.sucursal || 'N/A'}</td>
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
  );
};

export default Infrastructure;