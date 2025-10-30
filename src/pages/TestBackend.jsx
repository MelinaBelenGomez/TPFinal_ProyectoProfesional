import { useState, useEffect } from 'react';
import ProductionServiceAxios from '../services/productionServiceAxios';

const TestBackend = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({ nombre: '', descripcion: '' });

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const categoriesData = await ProductionServiceAxios.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
    setLoading(false);
  };

  const loadProducts = async () => {
    try {
      const response = await ProductionServiceAxios.getAvailableProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.nombre || !newCategory.descripcion) {
      alert('Complete todos los campos');
      return;
    }

    const response = await ProductionServiceAxios.createCategory(newCategory);
    if (response.success) {
      alert(response.message);
      setNewCategory({ nombre: '', descripcion: '' });
      loadCategories(); // Recargar categorías
    } else {
      alert(response.message);
    }
  };

  const handleDeleteCategory = async (nombre) => {
    if (window.confirm(`¿Eliminar categoría "${nombre}"?`)) {
      const response = await ProductionServiceAxios.deleteCategory(nombre);
      if (response.success) {
        alert(response.message);
        loadCategories(); // Recargar categorías
      } else {
        alert(response.message);
      }
    }
  };

  return (
    <div className="test-backend-container">
      <div className="header">
        <h2>🔗 Test Backend Endpoints</h2>
        <p>Prueba de conexión con el backend Spring Boot</p>
      </div>

      {/* Sección Categorías */}
      <div className="card">
        <h3>📂 Categorías</h3>
        
        {/* Formulario crear categoría */}
        <form onSubmit={handleCreateCategory} style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Nombre de la categoría"
              value={newCategory.nombre}
              onChange={(e) => setNewCategory({...newCategory, nombre: e.target.value})}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Descripción"
              value={newCategory.descripcion}
              onChange={(e) => setNewCategory({...newCategory, descripcion: e.target.value})}
            />
          </div>
          <button type="submit">➕ Crear Categoría</button>
        </form>

        {/* Lista de categorías */}
        {loading ? (
          <p>🔄 Cargando categorías desde la base de datos...</p>
        ) : (
          <div>
            <h4>Categorías en la base de datos:</h4>
            {categories.length > 0 ? (
              <ul>
                {categories.map((cat, index) => (
                  <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                    <span>📁 {cat}</span>
                    <button 
                      onClick={() => handleDeleteCategory(cat)}
                      style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px' }}
                    >
                      🗑️ Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
                <p>📊 <strong>Base de datos vacía</strong></p>
                <p>No hay categorías creadas. Usa el formulario de arriba para crear la primera categoría.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección Productos */}
      <div className="card">
        <h3>📦 Productos</h3>
        <button onClick={loadProducts}>🔄 Recargar Productos</button>
        
        {products.length > 0 ? (
          <table style={{ width: '100%', marginTop: '10px' }}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Unidad</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <td>{product.sku}</td>
                  <td>{product.nombre}</td>
                  <td>{product.descripcion}</td>
                  <td>{product.unidadMedida}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
            <p>📊 <strong>Base de datos vacía</strong></p>
            <p>No hay productos creados. Primero crea categorías, luego productos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestBackend;