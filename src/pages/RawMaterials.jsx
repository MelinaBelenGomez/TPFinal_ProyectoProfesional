import { useState, useEffect } from 'react';
import RawMaterialService from '../services/rawMaterialService';
import ProductionServiceAxios from '../services/productionServiceAxios';
import '../styles/rawMaterials.css';

const RawMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('nombre');
  const [centros, setCentros] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [stockData, setStockData] = useState({
    sku: '',
    idAlmacen: '',
    cantidad: ''
  });
  const [newMaterial, setNewMaterial] = useState({
    codigo: '',
    nombre: '',
    categoria: '',
    stock_actual: '',
    stock_minimo: '',
    unidad: 'kg',
    precio_unitario: '',
    proveedor: '',
    fecha_vencimiento: ''
  });

  useEffect(() => {
    loadMaterials();
    loadInfrastructure();
  }, []);

  const loadInfrastructure = async () => {
    const [centrosResponse, almacenesResponse] = await Promise.all([
      ProductionServiceAxios.getCentros(),
      ProductionServiceAxios.getAlmacenes()
    ]);
    
    if (centrosResponse.success) setCentros(centrosResponse.data);
    if (almacenesResponse.success) setAlmacenes(almacenesResponse.data);
  };

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const response = await ProductionServiceAxios.getRawMaterialsWithStock();
      if (response.success) {
        setMaterials(response.data);
      } else {
        console.error('Error cargando materias primas:', response.message);
        setMaterials([]);
      }
    } catch (error) {
      console.error('Error cargando materias primas:', error);
      setMaterials([]);
    }
    setLoading(false);
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    
    // Primero crear el producto (materia prima)
    const productResponse = await ProductionServiceAxios.createProduct({
      sku: newMaterial.codigo,
      nombre: newMaterial.nombre,
      descripcion: `${newMaterial.categoria} - ${newMaterial.proveedor}`,
      unidad_medida: newMaterial.unidad,
      categoria: newMaterial.categoria
    });
    
    if (productResponse.success) {
      setNewMaterial({
        codigo: '',
        nombre: '',
        categoria: '',
        stock_actual: '',
        stock_minimo: '',
        unidad: 'kg',
        precio_unitario: '',
        proveedor: '',
        fecha_vencimiento: ''
      });
      setShowAddForm(false);
      alert('✅ Materia prima creada exitosamente');
      // Recargar materiales desde el backend
      loadMaterials();
    } else {
      alert('❌ Error al crear materia prima: ' + productResponse.message);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    
    // Primero habilitar el producto en el almacén
    const habilitarResponse = await ProductionServiceAxios.habilitarProducto(stockData.sku, stockData.idAlmacen);
    
    if (habilitarResponse.success) {
      // Luego incrementar el stock
      const stockResponse = await ProductionServiceAxios.incrementarStock(
        stockData.sku, 
        stockData.idAlmacen, 
        parseInt(stockData.cantidad)
      );
      
      if (stockResponse.success) {
        alert('✅ Stock agregado exitosamente');
        setStockData({ sku: '', idAlmacen: '', cantidad: '' });
        setShowStockForm(false);
        // Recargar materiales para mostrar el stock actualizado
        loadMaterials();
      } else {
        alert('❌ Error al agregar stock: ' + stockResponse.message);
      }
    } else {
      alert('❌ Error al habilitar producto: ' + habilitarResponse.message);
    }
  };

  const handleUpdateStock = async (materialId, newStock) => {
    // Por ahora deshabilitado - necesitaría implementar endpoint de actualización
    alert('⚠️ Función no disponible. Use "Agregar Stock" para incrementar.');
    setEditingStock(null);
  };

  const handleDeleteMaterial = async (materialId) => {
    // Por ahora deshabilitado - necesitaría implementar endpoint de eliminación
    alert('⚠️ Función no disponible desde el backend.');
  };

  const getStatusColor = (estado) => {
    return estado === 'DISPONIBLE' ? '#28a745' : '#dc3545';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando materia prima...</p>
      </div>
    );
  }

  return (
    <div className="raw-materials-container">
      <div className="page-header">
        <h1><i className="fas fa-seedling"></i> Gestión de Materia Prima</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <i className="fas fa-plus"></i> Agregar Material
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowStockForm(true)}
          >
            <i className="fas fa-warehouse"></i> Agregar Stock
          </button>
        </div>
      </div>

      <div className="filters-section" style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Buscar material..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '200px' }}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="all">Todas las categorías</option>
            {RawMaterialService.getCategories().map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="all">Todos los estados</option>
            <option value="DISPONIBLE">DISPONIBLE</option>
            <option value="AGOTADO">AGOTADO</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="nombre">Ordenar por nombre</option>
            <option value="categoria">Ordenar por categoría</option>
            <option value="stock_actual">Ordenar por stock</option>
            <option value="precio_unitario">Ordenar por precio</option>
          </select>
        </div>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Agregar Nueva Materia Prima</h3>
              <button 
                className="btn-close"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddMaterial}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Código:</label>
                  <input
                    type="text"
                    value={newMaterial.codigo}
                    onChange={(e) => setNewMaterial({...newMaterial, codigo: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    value={newMaterial.nombre}
                    onChange={(e) => setNewMaterial({...newMaterial, nombre: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Categoría:</label>
                  <select
                    value={newMaterial.categoria}
                    onChange={(e) => setNewMaterial({...newMaterial, categoria: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {RawMaterialService.getCategories().map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Stock Actual:</label>
                  <input
                    type="number"
                    value={newMaterial.stock_actual}
                    onChange={(e) => setNewMaterial({...newMaterial, stock_actual: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock Mínimo:</label>
                  <input
                    type="number"
                    value={newMaterial.stock_minimo}
                    onChange={(e) => setNewMaterial({...newMaterial, stock_minimo: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unidad:</label>
                  <select
                    value={newMaterial.unidad}
                    onChange={(e) => setNewMaterial({...newMaterial, unidad: e.target.value})}
                  >
                    {RawMaterialService.getUnits().map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Precio Unitario:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMaterial.precio_unitario}
                    onChange={(e) => setNewMaterial({...newMaterial, precio_unitario: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Proveedor:</label>
                  <input
                    type="text"
                    value={newMaterial.proveedor}
                    onChange={(e) => setNewMaterial({...newMaterial, proveedor: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha Vencimiento:</label>
                  <input
                    type="date"
                    value={newMaterial.fecha_vencimiento}
                    onChange={(e) => setNewMaterial({...newMaterial, fecha_vencimiento: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Agregar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="materials-grid">
        {materials
          .filter(material => {
            const matchesSearch = material.nombre.toLowerCase().includes(searchFilter.toLowerCase()) ||
                                material.codigo.toLowerCase().includes(searchFilter.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || material.categoria === categoryFilter;
            const matchesStatus = statusFilter === 'all' || material.estado === statusFilter;
            return matchesSearch && matchesCategory && matchesStatus;
          })
          .sort((a, b) => {
            if (sortBy === 'stock_actual' || sortBy === 'precio_unitario') {
              return b[sortBy] - a[sortBy];
            }
            return a[sortBy].localeCompare(b[sortBy]);
          })
          .map(material => (
          <div key={material.id} className="material-card">
            <div className="material-header">
              <h3>{material.nombre}</h3>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(material.estado) }}
              >
                {material.estado}
              </span>
            </div>
            
            <div className="material-info">
              <p><strong>Código:</strong> {material.codigo}</p>
              <p><strong>Categoría:</strong> {material.categoria}</p>
              <p><strong>Proveedor:</strong> {material.proveedor}</p>
              <p><strong>Precio:</strong> ${material.precio_unitario}</p>
              <p><strong>Vencimiento:</strong> {material.fecha_vencimiento}</p>
            </div>

            <div className="stock-section">
              <div className="stock-info">
                <span className="stock-label">Stock:</span>
                {editingStock === material.id ? (
                  <div className="stock-edit">
                    <input
                      type="number"
                      defaultValue={material.stock_actual}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateStock(material.id, e.target.value);
                        }
                      }}
                      onBlur={(e) => handleUpdateStock(material.id, e.target.value)}
                      autoFocus
                    />
                    <span>{material.unidad}</span>
                  </div>
                ) : (
                  <span 
                    className="stock-value"
                    onClick={() => setEditingStock(material.id)}
                  >
                    {material.stock_actual} {material.unidad}
                    <i className="fas fa-edit"></i>
                  </span>
                )}
              </div>
              <div className="stock-min">
                Mínimo: {material.stock_minimo} {material.unidad}
              </div>
            </div>

            <div className="material-actions">
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteMaterial(material.id)}
              >
                <i className="fas fa-trash"></i> Eliminar
              </button>
            </div>
          </div>
        ))}
        {materials.filter(material => {
          const matchesSearch = material.nombre.toLowerCase().includes(searchFilter.toLowerCase()) ||
                              material.codigo.toLowerCase().includes(searchFilter.toLowerCase());
          const matchesCategory = categoryFilter === 'all' || material.categoria === categoryFilter;
          const matchesStatus = statusFilter === 'all' || material.estado === statusFilter;
          return matchesSearch && matchesCategory && matchesStatus;
        }).length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <i className="fas fa-search" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
            <p>No se encontraron materiales con los filtros aplicados</p>
          </div>
        )}
      </div>

      {/* Modal Agregar Stock */}
      {showStockForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Agregar Stock a Almacén</h3>
              <button 
                className="btn-close"
                onClick={() => setShowStockForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddStock}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Materia Prima (SKU):</label>
                  <select
                    value={stockData.sku}
                    onChange={(e) => setStockData({...stockData, sku: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar materia prima...</option>
                    {materials.map(material => (
                      <option key={material.codigo} value={material.codigo}>
                        {material.codigo} - {material.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Almacén:</label>
                  <select
                    value={stockData.idAlmacen}
                    onChange={(e) => setStockData({...stockData, idAlmacen: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar almacén...</option>
                    {almacenes.filter(a => a.estado === 'ACTIVO').map(almacen => (
                      <option key={almacen.idAlmacen} value={almacen.idAlmacen}>
                        {almacen.nombre} - {centros.find(c => c.idCentro === almacen.idCentro)?.sucursal}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cantidad:</label>
                  <input
                    type="number"
                    min="1"
                    value={stockData.cantidad}
                    onChange={(e) => setStockData({...stockData, cantidad: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStockForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Agregar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {almacenes.length === 0 && (
        <div style={{ padding: '20px', background: '#fff3cd', borderRadius: '5px', margin: '20px 0' }}>
          <p>⚠️ <strong>No hay almacenes disponibles</strong></p>
          <p>Primero crea almacenes en la sección de Infraestructura para poder gestionar stock.</p>
        </div>
      )}
    </div>
  );
};

export default RawMaterials;