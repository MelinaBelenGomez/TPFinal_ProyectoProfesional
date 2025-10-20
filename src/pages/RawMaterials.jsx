import { useState, useEffect } from 'react';
import RawMaterialService from '../services/rawMaterialService';
import '../styles/rawMaterials.css';

const RawMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
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
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    const response = await RawMaterialService.getAllRawMaterials();
    if (response.success) {
      setMaterials(response.data);
    }
    setLoading(false);
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    const response = await RawMaterialService.addRawMaterial(newMaterial);
    if (response.success) {
      setMaterials([...materials, response.data]);
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
    }
  };

  const handleUpdateStock = async (materialId, newStock) => {
    const response = await RawMaterialService.updateStock(materialId, newStock);
    if (response.success) {
      setMaterials(materials.map(m => 
        m.id === materialId ? response.data : m
      ));
      setEditingStock(null);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (confirm('¿Está seguro de eliminar esta materia prima?')) {
      const response = await RawMaterialService.deleteRawMaterial(materialId);
      if (response.success) {
        setMaterials(materials.filter(m => m.id !== materialId));
      }
    }
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
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <i className="fas fa-plus"></i> Agregar Material
        </button>
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
        {materials.map(material => (
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
      </div>
    </div>
  );
};

export default RawMaterials;