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

  // --- Estados para filtros ---
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    unidadMedida: '',
    tipoProducto: '' // 'materia-prima', 'producto-final', ''
  });

  // --- Estados para BOM ---
  const [ingredientes, setIngredientes] = useState([]);
  const [materiasPrimas, setMateriasPrimas] = useState([]);

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
        // Filtrar materias primas para el BOM
        const mp = response.data.filter(p => p.sku.startsWith('MP-'));
        setMateriasPrimas(mp);
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

  // --- Función para obtener nombre de categoría por ID ---
  const getNombreCategoria = (idCategoria) => {
    // Mapeo básico basado en los datos que insertaste
    const mapeoCategoria = {
      1: 'Materia Prima',
      2: 'Producto Final'
    };
    return mapeoCategoria[idCategoria] || `Categoría ${idCategoria}`;
  };

  // --- Obtener categorías únicas de los productos ---
  const categoriasDeProductos = [...new Set(productos.map(p => getNombreCategoria(p.idCategoria)))].filter(Boolean);

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

    // Validar BOM para productos finales
    if (categoria === 'Producto Final') {
      if (ingredientes.length === 0) {
        alert('Los productos finales deben tener al menos un ingrediente en su receta (BOM)');
        return;
      }
      
      // Validar que todos los ingredientes estén completos
      const ingredientesIncompletos = ingredientes.filter(ing => !ing.sku || !ing.cantidad || ing.cantidad <= 0);
      if (ingredientesIncompletos.length > 0) {
        alert(`Hay ${ingredientesIncompletos.length} ingrediente(s) incompleto(s). Por favor completa todos los campos.`);
        return;
      }
    }

    const productData = {
      sku: sku.toUpperCase(),
      nombre,
      descripcion,
      unidad_medida: unidadMedida,
      categoria
    };

    // Crear producto
    const response = await ProductionServiceAxios.createProduct(productData);
    if (response.success) {
      // Si es producto final, crear BOM
      if (categoria === 'Producto Final' && ingredientes.length > 0) {
        try {
          await crearBomProducto(sku.toUpperCase());
          alert(`Producto y BOM creados exitosamente\n- Producto: ${sku.toUpperCase()}\n- Ingredientes: ${ingredientes.length}`);
        } catch (bomError) {
          alert(`Producto creado, pero error en BOM: ${bomError.message}\nPuedes agregar el BOM manualmente después.`);
        }
      } else {
        alert('Producto creado exitosamente');
      }
      
      limpiarFormulario();
      loadProducts();
    } else {
      alert(response.message);
    }
  };

  // --- Función para crear BOM del producto ---
  const crearBomProducto = async (skuProducto) => {
    console.log(`🧱 Creando BOM para ${skuProducto} con ${ingredientes.length} ingredientes`);
    
    try {
      for (let i = 0; i < ingredientes.length; i++) {
        const ingrediente = ingredientes[i];
        
        // Validar que el ingrediente esté completo
        if (!ingrediente.sku || !ingrediente.cantidad) {
          console.warn(`⚠️ Ingrediente ${i + 1} incompleto, saltando...`);
          continue;
        }
        
        const bomData = {
          skuProductoFinal: skuProducto,
          skuMaterial: ingrediente.sku,
          cantPorUnidad: parseInt(ingrediente.cantidad)
        };
        
        console.log(`📝 Creando entrada BOM ${i + 1}/${ingredientes.length}:`, bomData);
        
        const response = await ProductionServiceAxios.createBomEntry(bomData);
        if (!response.success) {
          console.error(`❌ Error en ingrediente ${i + 1}:`, response.message);
          throw new Error(`Error al agregar ${ingrediente.sku}: ${response.message}`);
        }
        
        console.log(`✅ Entrada BOM ${i + 1} creada exitosamente`);
      }
      
      console.log(`🎉 BOM completo creado para ${skuProducto}`);
    } catch (error) {
      console.error('❌ Error creando BOM:', error);
      throw error;
    }
  };

  // --- Función para limpiar los campos del formulario ---
  const limpiarFormulario = () => {
    setSku("");
    setNombre("");
    setDescripcion("");
    setUnidadMedida("");
    setCategoria("");
    setIngredientes([]);
  };

  // --- Funciones para manejar ingredientes del BOM ---
  const agregarIngrediente = () => {
    setIngredientes([...ingredientes, { sku: '', cantidad: '' }]);
  };

  const eliminarIngrediente = (index) => {
    const nuevosIngredientes = ingredientes.filter((_, i) => i !== index);
    setIngredientes(nuevosIngredientes);
  };

  const actualizarIngrediente = (index, campo, valor) => {
    const nuevosIngredientes = [...ingredientes];
    nuevosIngredientes[index][campo] = valor;
    setIngredientes(nuevosIngredientes);
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

  // --- Función para filtrar productos ---
  const productosFiltrados = productos.filter(producto => {
    const cumpleBusqueda = !filtros.busqueda || 
      producto.sku.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      producto.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const cumpleCategoria = !filtros.categoria || 
      getNombreCategoria(producto.idCategoria) === filtros.categoria;
    
    const cumpleUnidad = !filtros.unidadMedida || 
      producto.unidadMedida === filtros.unidadMedida;
    
    const cumpleTipo = !filtros.tipoProducto || 
      (filtros.tipoProducto === 'materia-prima' && producto.sku.startsWith('MP-')) ||
      (filtros.tipoProducto === 'producto-final' && !producto.sku.startsWith('MP-'));
    
    return cumpleBusqueda && cumpleCategoria && cumpleUnidad && cumpleTipo;
  });

  // --- Función para limpiar filtros ---
  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      categoria: '',
      unidadMedida: '',
      tipoProducto: ''
    });
  };

  // --- Obtener unidades de medida únicas ---
  const unidadesMedida = [...new Set(productos.map(p => p.unidadMedida))].filter(Boolean);

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

        {/* Sección BOM - Solo para Productos Finales */}
        {categoria === 'Producto Final' && (
          <div className="bom-section" style={{ 
            marginTop: '20px', 
            padding: '15px', 
            border: '2px solid #007bff', 
            borderRadius: '8px', 
            background: '#f8f9ff' 
          }}>
            <h4 style={{ color: '#007bff', marginBottom: '15px' }}>🧱 Receta del Producto (BOM)</h4>
            <p style={{ marginBottom: '15px', color: '#6c757d' }}>Define qué materias primas y en qué cantidad necesita este producto:</p>
            
            {ingredientes.map((ingrediente, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                gap: '10px', 
                alignItems: 'center', 
                marginBottom: '10px',
                padding: '10px',
                background: 'white',
                borderRadius: '5px',
                border: '1px solid #dee2e6'
              }}>
                <select
                  value={ingrediente.sku}
                  onChange={(e) => actualizarIngrediente(index, 'sku', e.target.value)}
                  style={{ flex: 2, padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                >
                  <option value="">-- Seleccionar materia prima --</option>
                  {materiasPrimas.map((mp, mpIndex) => (
                    <option key={mpIndex} value={mp.sku}>{mp.sku} - {mp.nombre}</option>
                  ))}
                </select>
                
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={ingrediente.cantidad}
                  onChange={(e) => actualizarIngrediente(index, 'cantidad', parseInt(e.target.value) || '')}
                  style={{ flex: 1, padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                  min="1"
                />
                
                <span style={{ fontSize: '12px', color: '#6c757d', minWidth: '60px' }}>gramos</span>
                
                <button 
                  type="button"
                  onClick={() => eliminarIngrediente(index)}
                  style={{ 
                    background: '#dc3545', 
                    color: 'white', 
                    border: 'none', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ❌
                </button>
              </div>
            ))}
            
            <button 
              type="button"
              onClick={agregarIngrediente}
              style={{ 
                background: '#28a745', 
                color: 'white', 
                border: 'none', 
                padding: '10px 15px', 
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              ➕ Agregar Ingrediente
            </button>
            
            {ingredientes.length === 0 && (
              <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '10px' }}>
                ⚠️ Los productos finales requieren al menos un ingrediente
              </p>
            )}
          </div>
        )}

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
          <small style={{ color: '#856404', marginTop: '4px', display: 'block' }}>
            🔍 Puedes usar estos SKUs en los filtros de búsqueda de la tabla de abajo.
          </small>
        </div>
      )}

      {/* --- LISTA DE PRODUCTOS CREADOS --- */}
      <div className="products-list card" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>📦 Productos en la Base de Datos ({productosFiltrados.length} de {productos.length})</h3>
          <button 
            onClick={loadProducts}
            style={{ background: '#17a2b8', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}
          >
            🔄 Recargar
          </button>
        </div>

        {/* Filtros */}
        <div className="filtros-container" style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>🔍 Filtros de Búsqueda</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {/* Búsqueda general */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Búsqueda general</label>
              <input
                type="text"
                placeholder="Buscar por SKU, nombre o descripción..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
              />
            </div>

            {/* Filtro por categoría */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Categoría</label>
              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
              >
                <option value="">Todas las categorías</option>
                {categoriasDeProductos.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Filtro por unidad de medida */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Unidad de medida</label>
              <select
                value={filtros.unidadMedida}
                onChange={(e) => setFiltros({...filtros, unidadMedida: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
              >
                <option value="">Todas las unidades</option>
                {unidadesMedida.map((unidad, index) => (
                  <option key={index} value={unidad}>{unidad}</option>
                ))}
              </select>
            </div>

            {/* Filtro por tipo de producto */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Tipo de producto</label>
              <select
                value={filtros.tipoProducto}
                onChange={(e) => setFiltros({...filtros, tipoProducto: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
              >
                <option value="">Todos los tipos</option>
                <option value="materia-prima">🌱 Materias Primas (MP-)</option>
                <option value="producto-final">📦 Productos Finales</option>
              </select>
            </div>
          </div>

          {/* Botón limpiar filtros */}
          <div style={{ marginTop: '15px', textAlign: 'right' }}>
            <button
              onClick={limpiarFiltros}
              style={{ 
                background: '#6c757d', 
                color: 'white', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🧹 Limpiar Filtros
            </button>
          </div>
        </div>
        
        {loading ? (
          <p>🔄 Cargando productos...</p>
        ) : productos.length > 0 ? (
          productosFiltrados.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#e9ecef' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>SKU</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Nombre</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Descripción</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Unidad</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Tipo</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((p, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ 
                        padding: '12px', 
                        fontFamily: 'monospace', 
                        fontWeight: 'bold', 
                        color: p.sku.startsWith('MP-') ? '#28a745' : '#007bff'
                      }}>
                        {p.sku.startsWith('MP-') && '🌱 '}{p.sku}
                      </td>
                      <td style={{ padding: '12px' }}>{p.nombre}</td>
                      <td style={{ padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.descripcion}</td>
                      <td style={{ padding: '12px' }}>{p.unidadMedida}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: p.sku.startsWith('MP-') ? '#d4edda' : '#d1ecf1',
                          color: p.sku.startsWith('MP-') ? '#155724' : '#0c5460'
                        }}>
                          {p.sku.startsWith('MP-') ? 'Materia Prima' : 'Producto Final'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button 
                          onClick={() => eliminarProducto(p.sku)}
                          style={{ 
                            background: '#dc3545', 
                            color: 'white', 
                            border: 'none', 
                            padding: '6px 12px', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '20px', background: '#fff3cd', borderRadius: '5px', textAlign: 'center', border: '1px solid #ffeaa7' }}>
              <p>🔍 <strong>No se encontraron productos con los filtros aplicados</strong></p>
              <p>Intenta ajustar los criterios de búsqueda o limpiar los filtros.</p>
            </div>
          )
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
