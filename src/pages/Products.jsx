import { useState, useEffect } from "react";
import ProductionServiceAxios from '../services/productionServiceAxios';

const Products = () => {
  // --- Estados para los campos del formulario ---
  const [sku, setSku] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("");
  const [categoria, setCategoria] = useState("");

  // --- Estados para datos del backend ---
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Estados para gestión de categorías ---
  const [newCategory, setNewCategory] = useState({ nombre: '', descripcion: '' });
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // 🔗 CONECTADO AL BACKEND
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await ProductionServiceAxios.getAvailableProducts();
      if (response.success) {
        setProductos(response.data);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await ProductionServiceAxios.getCategories();
      setCategorias(categoriesData);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  // --- Función para crear categoría ---
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.nombre || !newCategory.descripcion) {
      alert('Complete todos los campos de la categoría');
      return;
    }

    const response = await ProductionServiceAxios.createCategory(newCategory);
    if (response.success) {
      alert(response.message);
      setNewCategory({ nombre: '', descripcion: '' });
      setShowCategoryForm(false);
      loadCategories(); // Recargar categorías
    } else {
      alert(response.message);
    }
  };

  // --- Función para validar SKU único ---
  const validarSKU = (skuInput) => {
    const skuExists = productos.some(p => p.sku.toLowerCase() === skuInput.toLowerCase());
    return !skuExists;
  };

  // --- Función que se ejecuta al enviar el formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sku || !nombre || !descripcion || !unidadMedida || !categoria) {
      alert("Por favor completa todos los campos");
      return;
    }

    // Validar SKU único
    if (!validarSKU(sku)) {
      alert(`El SKU "${sku}" ya existe. Por favor usa un SKU diferente.`);
      return;
    }

    const productData = {
      sku: sku.toUpperCase(), // Convertir a mayúsculas
      nombre,
      descripcion,
      unidad_medida: unidadMedida,
      categoria
    };

    const response = await ProductionServiceAxios.createProduct(productData);
    if (response.success) {
      alert(response.message);
      limpiarFormulario();
      loadProducts(); // Recargar productos
    } else {
      alert(response.message);
    }
  };

  // --- Función para limpiar los campos del formulario ---
  const limpiarFormulario = () => {
    setSku("");
    setNombre("");
    setDescripcion("");
    setUnidadMedida("");
    setCategoria("");
  };

  // --- Función para eliminar un producto ---
  const eliminarProducto = async (sku) => {
    const confirmacion = window.confirm("¿Seguro que deseas eliminar este producto?");
    if (confirmacion) {
      const response = await ProductionServiceAxios.deleteProduct(sku);
      if (response.success) {
        alert(response.message);
        loadProducts(); // Recargar productos
      } else {
        alert(response.message);
      }
    }
  };

  return (
    <div className="product-create-container">
      <div className="header">
        <h2>Gestión de Productos</h2>
        <p>Crear, editar o eliminar productos del sistema</p>
      </div>

      {/* --- FORMULARIO --- */}
      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>SKU (Código único) *</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            placeholder="Ej: MIX-BERRIES-500, MP-FRUTILLA-001"
            style={{
              borderColor: sku && !validarSKU(sku) ? '#dc3545' : '#ced4da'
            }}
          />
          {sku && !validarSKU(sku) && (
            <small style={{ color: '#dc3545', fontSize: '12px' }}>
              ⚠️ Este SKU ya existe
            </small>
          )}
          {sku && validarSKU(sku) && (
            <small style={{ color: '#28a745', fontSize: '12px' }}>
              ✅ SKU disponible
            </small>
          )}
        </div>

        <div className="form-group">
          <label>Nombre del producto</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Mix de berries"
          />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Mezcla de frutillas, frambuesas y arándanos"
          ></textarea>
        </div>

        <div className="form-group">
          <label>Categoría</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">-- Seleccionar categoría --</option>
              {categorias.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
            <button 
              type="button" 
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              style={{ padding: '8px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              ➕ Nueva
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Unidad de medida</label>
          <select
            value={unidadMedida}
            onChange={(e) => setUnidadMedida(e.target.value)}
          >
            <option value="">-- Seleccionar unidad de medida --</option>
            <option value="gramos">Gramos (g)</option>
            <option value="kilogramos">Kilogramos (kg)</option>
            <option value="litros">Litros (L)</option>
            <option value="unidades">Unidades</option>
            <option value="cajas">Cajas</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="btn-crear"
          disabled={!sku || !validarSKU(sku)}
          style={{
            opacity: (!sku || !validarSKU(sku)) ? 0.6 : 1,
            cursor: (!sku || !validarSKU(sku)) ? 'not-allowed' : 'pointer'
          }}
        >
          Crear Producto
        </button>
        <button
          type="button"
          className="btn-cancelar"
          onClick={limpiarFormulario}
          style={{ marginLeft: "10px" }}
        >
          Limpiar
        </button>
      </form>

      {/* Formulario para crear categoría */}
      {showCategoryForm && (
        <div className="card" style={{ marginTop: '20px', background: '#f8f9fa' }}>
          <h3>➕ Crear Nueva Categoría</h3>
          <form onSubmit={handleCreateCategory}>
            <div className="form-group">
              <label>Nombre de la categoría</label>
              <input
                type="text"
                value={newCategory.nombre}
                onChange={(e) => setNewCategory({...newCategory, nombre: e.target.value})}
                placeholder="Ej: Materia Prima"
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <input
                type="text"
                value={newCategory.descripcion}
                onChange={(e) => setNewCategory({...newCategory, descripcion: e.target.value})}
                placeholder="Ej: Ingredientes y materias primas"
              />
            </div>
            <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', marginRight: '10px' }}>
              Crear Categoría
            </button>
            <button 
              type="button" 
              onClick={() => setShowCategoryForm(false)}
              style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Sección de SKUs existentes para referencia */}
      {productos.length > 0 && (
        <div className="card" style={{ marginTop: '20px', background: '#fff3cd' }}>
          <h4>📝 SKUs Existentes (para referencia)</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
            {productos.map((p, index) => (
              <span 
                key={index}
                style={{
                  background: '#ffc107',
                  color: '#212529',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}
              >
                {p.sku}
              </span>
            ))}
          </div>
          <small style={{ color: '#856404', marginTop: '8px', display: 'block' }}>
            💡 Sugerencia: Usa prefijos como MP- para materias primas, MIX- para mezclas, etc.
          </small>
        </div>
      )}

      {/* --- LISTA DE PRODUCTOS CREADOS --- */}
      <div className="products-list card" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>📦 Productos en la Base de Datos</h3>
          <button 
            onClick={loadProducts}
            style={{ background: '#17a2b8', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}
          >
            🔄 Recargar
          </button>
        </div>
        
        {loading ? (
          <p>🔄 Cargando productos...</p>
        ) : productos.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p, index) => (
                <tr key={index}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#007bff' }}>{p.sku}</td>
                  <td>{p.nombre}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.unidadMedida}</td>
                  <td>{p.idCategoria}</td>
                  <td>
                    <button 
                      onClick={() => eliminarProducto(p.sku)}
                      style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px' }}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '5px', textAlign: 'center' }}>
            <p>📊 <strong>No hay productos creados</strong></p>
            <p>Usa el formulario de arriba para crear el primer producto.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
