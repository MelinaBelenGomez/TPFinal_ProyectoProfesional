import { useState, useEffect } from 'react';
import ProductionService from '../services/productionService';

const Production = ({ user }) => {
  const [productionOrders, setProductionOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productFilter, setProductFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('fecha_creacion');
  const [sortOrder, setSortOrder] = useState('desc');

  // Cargar productos desde el service
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await ProductionService.getAvailableProducts();
      if (response.success) {
        // Mapear productos del backend con iconos y colores para UI
        const productsWithUI = response.data.map(product => ({
          ...product,
          name: product.nombre,
          description: product.descripcion,
          cantidadFija: product.cantidad_por_lote,
          unidadMedida: product.unidad_medida,
          // Iconos y colores para UI
          icon: getProductIcon(product.sku),
          color: getProductColor(product.sku)
        }));
        setProducts(productsWithUI);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductIcon = (sku) => {
    const iconMap = {
      'FRZ-MIX-BER-001': 'fas fa-seedling',
      'FRZ-MIX-TRP-002': 'fas fa-leaf',
      'FRZ-PLP-BER-003': 'fas fa-blender',
      'FRZ-PLP-TRP-004': 'fas fa-blender',
      'FRZ-HRT-MIX-005': 'fas fa-carrot',
      'FRZ-SOP-CMB-006': 'fas fa-soup'
    };
    return iconMap[sku] || 'fas fa-box';
  };

  const getProductColor = (sku) => {
    const colorMap = {
      'FRZ-MIX-BER-001': '#8e44ad',
      'FRZ-MIX-TRP-002': '#f39c12',
      'FRZ-PLP-BER-003': '#e74c3c',
      'FRZ-PLP-TRP-004': '#f1c40f',
      'FRZ-HRT-MIX-005': '#27ae60',
      'FRZ-SOP-CMB-006': '#d35400'
    };
    return colorMap[sku] || '#6c757d';
  };

  const handleCreateOrder = async (product) => {
    setLoading(true);
    
    try {
      // Datos que se envían al backend
      const orderData = {
        sku: product.sku,
        cantidad: product.cantidadFija,
        id_centro_produccion: 1,
        responsable: user.username
      };

      const response = await ProductionService.createProductionOrder(orderData);
      
      if (response.success) {
        // Agregar orden a la lista local
        const newOrder = {
          ...response.data,
          producto: product
        };
        
        setProductionOrders([...productionOrders, newOrder]);
        alert(`✅ Orden creada exitosamente\n\nCódigo: ${response.data.codigo}\nSKU: ${response.data.sku}\nCantidad: ${response.data.cantidad} ${product.unidadMedida}\nResponsable: ${response.data.usuario_responsable}`);
      } else {
        alert(`❌ Error: ${response.error}`);
      }
    } catch (error) {
      console.error('Error creando orden:', error);
      alert('❌ Error al crear la orden de producción');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="production-container">
      <div className="production-header">
        <h2>Órdenes de Producción</h2>
        <p>Gestiona los lotes de producción de productos congelados</p>
      </div>

      <div className="production-stats">
        <div className="stat-card card">
          <div className="stat-icon">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{productionOrders.length}</div>
            <div className="stat-label">Órdenes Activas</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{productionOrders.filter(o => o.estado === 'CREADA').length}</div>
            <div className="stat-label">Creadas</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">
            <i className="fas fa-cogs"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{productionOrders.filter(o => o.estado === 'EN_PROCESO').length}</div>
            <div className="stat-label">En Proceso</div>
          </div>
        </div>
      </div>

      <div className="products-grid">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Selecciona el tipo de producto a producir:</h3>
          <input
            type="text"
            placeholder="🔍 Buscar producto..."
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '200px' }}
          />
        </div>
        <div className="product-cards">
          {loading ? (
            <div className="loading-message">Cargando productos...</div>
          ) : (
            products
              .filter(product => 
                product.name.toLowerCase().includes(productFilter.toLowerCase()) ||
                product.sku.toLowerCase().includes(productFilter.toLowerCase())
              )
              .map((product) => (
            <div key={product.sku} className="product-card card">
              <div className="product-header" style={{ backgroundColor: product.color }}>
                <i className={product.icon}></i>
              </div>
              <div className="product-info">
                <h4>{product.name}</h4>
                <p>{product.description}</p>
                <div className="product-details">
                  <div className="detail-item">
                    <strong>SKU:</strong> {product.sku}
                  </div>
                  <div className="detail-item">
                    <strong>Cantidad por lote:</strong> {product.cantidadFija} {product.unidadMedida}
                  </div>
                </div>
                <button 
                  className="create-order-btn"
                  onClick={() => handleCreateOrder(product)}
                  disabled={loading}
                >
                  <i className="fas fa-plus"></i> {loading ? 'Creando...' : 'Crear Orden'}
                </button>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {productionOrders.length > 0 && (
        <div className="orders-list card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Órdenes de Producción Creadas</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="🔍 Buscar orden..."
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="all">Todos los estados</option>
                <option value="CREADA">CREADA</option>
                <option value="EN_PROCESO">EN_PROCESO</option>
                <option value="TERMINADA">TERMINADA</option>
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="fecha_creacion">Por fecha</option>
                <option value="codigo">Por código</option>
                <option value="sku">Por SKU</option>
                <option value="cantidad">Por cantidad</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>SKU</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th>Responsable</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {productionOrders
                .filter(order => {
                  const matchesSearch = order.codigo.toLowerCase().includes(orderFilter.toLowerCase()) ||
                                      order.sku.toLowerCase().includes(orderFilter.toLowerCase()) ||
                                      order.producto.name.toLowerCase().includes(orderFilter.toLowerCase());
                  const matchesStatus = statusFilter === 'all' || order.estado === statusFilter;
                  const matchesDate = !dateFilter || order.fecha_creacion.startsWith(dateFilter);
                  return matchesSearch && matchesStatus && matchesDate;
                })
                .sort((a, b) => {
                  let aValue = a[sortBy];
                  let bValue = b[sortBy];
                  
                  if (sortBy === 'cantidad') {
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                  }
                  if (sortBy === 'fecha_creacion') {
                    return sortOrder === 'asc' ? new Date(aValue) - new Date(bValue) : new Date(bValue) - new Date(aValue);
                  }
                  return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                })
                .map((order) => (
                <tr key={order.id_op}>
                  <td className="order-code">{order.codigo}</td>
                  <td className="sku-code">{order.sku}</td>
                  <td>{order.producto.name}</td>
                  <td>{order.cantidad} {order.producto.unidadMedida}</td>
                  <td>
                    <span className="status-badge status-info">{order.estado}</span>
                  </td>
                  <td>{order.usuario_responsable}</td>
                  <td>{new Date(order.fecha_creacion).toLocaleDateString('es-ES')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Production;