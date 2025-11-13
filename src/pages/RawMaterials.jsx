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
  const [availableProducts, setAvailableProducts] = useState([]);
  const [stockData, setStockData] = useState({
    sku: '',
    idAlmacen: '',
    cantidad: ''
  });
  const [newMaterial, setNewMaterial] = useState({
    codigo: '',
    nombre: '',
    categoria: '',
    descripcion: '',
    stock_inicial: '',
    cantidad_minima: '',
    unidad: 'kg',
    idAlmacen: ''
  });

  useEffect(() => {
    loadMaterials();
    loadInfrastructure();
    loadAvailableProducts();
  }, []);

  const loadInfrastructure = async () => {
    const [centrosResponse, almacenesResponse] = await Promise.all([
      ProductionServiceAxios.getCentros(),
      ProductionServiceAxios.getAlmacenes()
    ]);
    
    if (centrosResponse.success) setCentros(centrosResponse.data);
    if (almacenesResponse.success) setAlmacenes(almacenesResponse.data);
  };

  const loadAvailableProducts = async () => {
    const response = await ProductionServiceAxios.getProductsAvailableForStock();
    if (response.success) {
      setAvailableProducts(response.data);
    }
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
    
    const response = await ProductionServiceAxios.createRawMaterial(newMaterial);
    
    if (response.success) {
      setNewMaterial({
        codigo: '',
        nombre: '',
        categoria: '',
        descripcion: '',
        stock_inicial: '',
        cantidad_minima: '',
        unidad: 'kg',
        idAlmacen: ''
      });
      setShowAddForm(false);
      alert('✅ Materia prima creada exitosamente');
      loadMaterials();
      loadAvailableProducts(); // Recargar productos disponibles
    } else {
      alert('❌ Error al crear materia prima: ' + response.message);
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
            disabled={materials.length === 0}
          >
            <i className="fas fa-warehouse"></i> Incrementar Stock
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
                  <label>Producto (SKU):</label>
                  <select
                    value={newMaterial.codigo}
                    onChange={(e) => {
                      const selectedProduct = availableProducts.find(p => p.sku === e.target.value);
                      setNewMaterial({
                        ...newMaterial, 
                        codigo: e.target.value,
                        nombre: selectedProduct ? selectedProduct.nombre : '',
                        categoria: selectedProduct ? selectedProduct.idCategoria : '',
                        unidad: selectedProduct ? selectedProduct.unidadMedida : 'kg'
                      });
                    }}
                    required
                  >
                    <option value="">Seleccionar producto...</option>
                    {availableProducts.map(product => (
                      <option key={product.sku} value={product.sku}>
                        {product.sku} - {product.nombre}
                      </option>
                    ))}
                  </select>
                  {availableProducts.length === 0 && (
                    <small style={{color: '#666', fontSize: '12px'}}>
                      No hay productos disponibles. Crea productos primero en la sección Productos.
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    value={newMaterial.nombre}
                    onChange={(e) => setNewMaterial({...newMaterial, nombre: e.target.value})}
                    disabled
                    style={{backgroundColor: '#f8f9fa'}}
                    placeholder="Se completa automáticamente"
                  />
                </div>

                <div className="form-group">
                  <label>Descripción:</label>
                  <input
                    type="text"
                    value={newMaterial.descripcion}
                    onChange={(e) => setNewMaterial({...newMaterial, descripcion: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Almacén:</label>
                  <select
                    value={newMaterial.idAlmacen}
                    onChange={(e) => setNewMaterial({...newMaterial, idAlmacen: e.target.value})}
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
                  <label>Stock Inicial:</label>
                  <input
                    type="number"
                    min="0"
                    value={newMaterial.stock_inicial}
                    onChange={(e) => setNewMaterial({...newMaterial, stock_inicial: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cantidad Mínima:</label>
                  <input
                    type="number"
                    min="0"
                    value={newMaterial.cantidad_minima || ''}
                    onChange={(e) => setNewMaterial({...newMaterial, cantidad_minima: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Unidad:</label>
                  <input
                    type="text"
                    value={newMaterial.unidad}
                    disabled
                    style={{backgroundColor: '#f8f9fa'}}
                    placeholder="Se completa automáticamente"
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
              <p><strong>Almacén:</strong> {material.almacen}</p>
              <p><strong>Unidad:</strong> {material.unidad}</p>
            </div>

            <div className="stock-section">
              <div className="stock-info">
                <div className="stock-row">
                  <span className="stock-label">Total:</span>
                  <span className="stock-value">{material.stock_actual} {material.unidad}</span>
                </div>
                <div className="stock-row">
                  <span className="stock-label">Disponible:</span>
                  <span className="stock-value">{material.stock_disponible} {material.unidad}</span>
                </div>
                {material.stock_reservado > 0 && (
                  <div className="stock-row">
                    <span className="stock-label">Reservado:</span>
                    <span className="stock-value">{material.stock_reservado} {material.unidad}</span>
                  </div>
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
              <h3>Incrementar Stock Existente</h3>
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
                    onChange={(e) => {
                      const selectedMaterial = materials.find(m => m.codigo === e.target.value);
                      setStockData({
                        ...stockData, 
                        sku: e.target.value,
                        idAlmacen: selectedMaterial ? selectedMaterial.idAlmacen : ''
                      });
                    }}
                    required
                  >
                    <option value="">Seleccionar materia prima...</option>
                    {materials.map(material => (
                      <option key={material.codigo} value={material.codigo}>
                        {material.codigo} - {material.nombre} (Almacén: {material.almacen})
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
                    disabled={!stockData.sku}
                  >
                    <option value="">Seleccionar almacén...</option>
                    {stockData.sku ? (
                      // Solo mostrar almacenes donde existe esta materia prima
                      materials
                        .filter(m => m.codigo === stockData.sku)
                        .map(material => {
                          const almacen = almacenes.find(a => a.idAlmacen === material.idAlmacen);
                          const centro = centros.find(c => c.idCentro === almacen?.idCentro);
                          return (
                            <option key={almacen.idAlmacen} value={almacen.idAlmacen}>
                              {almacen.nombre} - {centro?.sucursal} (Stock actual: {material.stock_actual} {material.unidad})
                            </option>
                          );
                        })
                    ) : (
                      <option value="" disabled>Primero selecciona una materia prima</option>
                    )}
                  </select>
                  {stockData.sku && materials.filter(m => m.codigo === stockData.sku).length === 0 && (
                    <small style={{color: '#dc3545', fontSize: '12px'}}>
                      Esta materia prima no existe en ningún almacén. Primero créala.
                    </small>
                  )}
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