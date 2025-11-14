import { useState, useEffect } from 'react';
import axios from 'axios';

const Production = ({ user }) => {
  const [productionOrders, setProductionOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productFilter, setProductFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('idOp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [productionConfig, setProductionConfig] = useState(null);

  // Cargar productos y órdenes al iniciar
  useEffect(() => {
    loadProducts();
    loadProductionOrders();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Obtener productos que tienen BOM (productos fabricables)
      const response = await axios.get('http://localhost:8081/bom/productos-fabricables');
      const productsWithUI = response.data.map(product => ({
        ...product,
        name: product.nombre,
        description: product.descripcion || 'Producto congelado',
        unidadMedida: product.unidadMedida || 'unidades',
        icon: getProductIcon(product.sku),
        color: getProductColor(product.sku)
      }));
      setProducts(productsWithUI);
      
      // Cargar configuración de producción
      await loadProductionConfig();
    } catch (error) {
      console.error('Error cargando productos:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      alert(`Error al cargar productos fabricables: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadProductionOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8081/ordenes-produccion/consultar/todas');
      console.log('Órdenes cargadas:', response.data); // Debug
      setProductionOrders(response.data);
    } catch (error) {
      console.error('Error cargando órdenes:', error);
    }
  };

  const getProductIcon = (sku) => {
    // Iconos más estéticos para productos
    const iconMap = {
      'FRZ-MIX-BER-001': 'fas fa-seedling',
      'FRZ-MIX-TRP-002': 'fas fa-leaf',
      'FRZ-PLP-BER-003': 'fas fa-apple-alt',
      'FRZ-PLP-TRP-004': 'fas fa-lemon',
      'FRZ-HRT-MIX-005': 'fas fa-carrot',
      'FRZ-SOP-CMB-006': 'fas fa-pepper-hot'
    };
    
    // Iconos por categorías de productos
    const categoryIcons = [
      'fas fa-apple-alt',    // Manzana
      'fas fa-lemon',        // Limón
      'fas fa-carrot',       // Zanahoria
      'fas fa-pepper-hot',   // Pimiento
      'fas fa-seedling',     // Planta
      'fas fa-leaf',         // Hoja
      'fas fa-tree',         // Árbol
      'fas fa-cannabis',     // Planta (alternativa)
      'fas fa-spa'           // Spa/natural
    ];
    
    // Si no hay mapeo específico, usar uno aleatorio basado en el SKU
    if (iconMap[sku]) {
      return iconMap[sku];
    }
    
    // Generar índice basado en el SKU para consistencia
    const skuHash = sku.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return categoryIcons[skuHash % categoryIcons.length];
  };

  const getProductColor = (sku) => {
    const colorMap = {
      'FRZ-MIX-BER-001': '#8e44ad',  // Púrpura (berries)
      'FRZ-MIX-TRP-002': '#f39c12',  // Naranja (tropical)
      'FRZ-PLP-BER-003': '#e74c3c',  // Rojo (berries)
      'FRZ-PLP-TRP-004': '#f1c40f',  // Amarillo (tropical)
      'FRZ-HRT-MIX-005': '#27ae60',  // Verde (vegetales)
      'FRZ-SOP-CMB-006': '#d35400'   // Naranja oscuro (sopa)
    };
    
    // Colores naturales para productos
    const naturalColors = [
      '#27ae60',  // Verde natural
      '#e74c3c',  // Rojo tomate
      '#f39c12',  // Naranja zanahoria
      '#8e44ad',  // Púrpura berries
      '#f1c40f',  // Amarillo limón
      '#2ecc71',  // Verde menta
      '#e67e22',  // Naranja calabaza
      '#9b59b6',  // Púrpura uva
      '#16a085'   // Verde aguacate
    ];
    
    if (colorMap[sku]) {
      return colorMap[sku];
    }
    
    // Generar color basado en el SKU para consistencia
    const skuHash = sku.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return naturalColors[skuHash % naturalColors.length];
  };

  const handleCreateOrder = async (product) => {
    if (!productionConfig) {
      alert('Error: No se ha cargado la configuración de producción. Ve a Configuración para establecer los parámetros.');
      return;
    }
    
    const cantidad = productionConfig.cantidad_base_orden;

    setLoading(true);
    
    try {
      // Datos que se envían al backend
      const orderData = {
        idAlmacen: 1, // ID del almacén por defecto
        sku: product.sku,
        cantidad: parseInt(cantidad),
        responsable: user.username
      };

      const response = await axios.post('http://localhost:8081/ordenes-produccion/crear', orderData);
      
      // Recargar órdenes para mostrar la nueva
      await loadProductionOrders();
      
      alert(
        `✅ Orden creada exitosamente\n\n` +
        `SKU: ${product.sku}\n` +
        `Producto: ${product.name}\n` +
        `Cantidad: ${cantidad} ${product.unidadMedida}\n` +
        `Estado: PLANIFICADA\n\n` +
        `Para comenzar la producción, usa el botón "Activar" en la tabla de órdenes.`
      );
      
    } catch (error) {
      console.error('Error creando orden:', error);
      alert('❌ Error al crear la orden de producción');
    } finally {
      setLoading(false);
    }
  };

  const cancelarOrden = async (idOp) => {
    if (!confirm(
      '⚠️ ¿Estás seguro de cancelar esta orden?\n\n' +
      'Esto hará lo siguiente:\n' +
      '• Marcará la orden como CANCELADA\n' +
      '• Cancelará todos los lotes en proceso\n' +
      '• Liberará las reservas de materiales\n' +
      '• Los lotes desaparecerán de las estaciones de trabajo\n\n' +
      'Esta acción NO se puede deshacer.'
    )) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.put('http://localhost:8081/ordenes-produccion/cancelar', {
        idOp: idOp,
        responsable: user.username
      });
      
      await loadProductionOrders();
      
      // Mostrar resumen de lo que se canceló
      const mensaje = response.data.mensaje || 
        '✅ Orden cancelada exitosamente\n\n' +
        '• Estado cambiado a CANCELADA\n' +
        '• Lotes marcados como CANCELADO\n' +
        '• Reservas de materiales liberadas\n' +
        '• Operarios notificados del cambio';
      
      alert(mensaje);
      
    } catch (error) {
      console.error('Error cancelando orden:', error);
      alert('❌ Error al cancelar la orden: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const activarOrdenManual = async (order) => {
    // Usar la cantidad de la configuración de producción (no la de la orden individual)
    const cantidadProducir = productionConfig.cantidad_base_orden;
    
    // Obtener peso real del producto desde BOM
    let pesoUnitario = 500; // Por defecto 500g
    try {
      const bomResponse = await axios.get(`http://localhost:8081/bom/${order.sku}`);
      pesoUnitario = bomResponse.data.reduce((total, item) => total + (item.cantPorUnidad || 0), 0);
      if (pesoUnitario === 0) {
        pesoUnitario = 500; // Fallback si BOM está vacío
      }
    } catch (error) {
      console.warn('No se pudo obtener BOM, usando peso por defecto');
    }
    
    // Calcular cuántos lotes se crearán
    const pesoTotalOrden = (cantidadProducir * pesoUnitario) / 1000; // Convertir a kg
    const pesoLote = pesoTotalOrden / productionConfig.numero_lotes_fijo;
    const totalLotes = productionConfig.numero_lotes_fijo;
    
    console.log('Debug activación:', { 
      cantidadOrden: order.cantidad,
      cantidadProducir, 
      pesoUnitario, 
      pesoTotalOrden, 
      pesoLote, 
      totalLotes 
    });
    
    // Validar si es un número excesivo de lotes
    let mensaje = `¿Activar la orden ${order.idOp}?\n\n`;
    mensaje += `📊 Información de lotes:\n`;
    mensaje += `• Total de lotes: ${totalLotes}\n`;
    mensaje += `• Peso por lote: ${pesoLote.toFixed(1)} kg\n`;
    mensaje += `• Peso total: ${pesoTotalOrden.toFixed(1)} kg\n\n`;
    
    // Advertencias según cantidad de lotes y peso por lote
    if (totalLotes > 100 || pesoLote < 1) {
      mensaje += `⚠️ ADVERTENCIA CRÍTICA:\n`;
      if (totalLotes > 100) {
        mensaje += `• ${totalLotes} lotes pueden sobrecargar el sistema\n`;
      }
      if (pesoLote < 1) {
        mensaje += `• Lotes muy pequeños (${pesoLote.toFixed(1)} kg) son ineficientes\n`;
      }
      mensaje += `Recomendación: Ajustar configuración en Ajustes.\n\n`;
      mensaje += `¿Continuar de todas formas?`;
    } else if (totalLotes > 50 || pesoLote < 2) {
      mensaje += `⚠️ ADVERTENCIA:\n`;
      if (totalLotes > 50) {
        mensaje += `• ${totalLotes} lotes es una cantidad considerable\n`;
      }
      if (pesoLote < 2) {
        mensaje += `• Lotes pequeños (${pesoLote.toFixed(1)} kg) pueden ser ineficientes\n`;
      }
      mensaje += `¿Continuar?`;
    } else {
      mensaje += `Esto reservará los materiales y creará ${totalLotes} lotes para producción.`;
    }
    
    if (!confirm(mensaje)) {
      return;
    }
    
    try {
      setLoading(true);
      
      await axios.put('http://localhost:8081/ordenes-produccion/activar', {
        idOp: order.idOp,
        responsable: user.username
      }, {
        timeout: 60000 // 60 segundos
      });
      
      await loadProductionOrders();
      alert(`✅ Orden activada exitosamente\n\n• Materiales reservados\n• ${totalLotes} lotes creados\n• Peso por lote: ${pesoLote.toFixed(1)} kg\n• Peso total: ${pesoTotalOrden.toFixed(1)} kg`);
      
    } catch (error) {
      console.error('Error activando orden:', error);
      
      // Recargar órdenes por si acaso se activó en el backend
      await loadProductionOrders();
      
      // Verificar si realmente se activó
      const updatedOrders = await axios.get('http://localhost:8081/ordenes-produccion/consultar/todas');
      const activatedOrder = updatedOrders.data.find(o => o.idOp === order.idOp && o.estado === 'activa');
      
      if (activatedOrder) {
        alert('✅ Orden activada exitosamente (el proceso tardó más de lo esperado)');
      } else {
        alert('❌ Error al activar la orden: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const activarOrden = async (orderData, product) => {
    try {
      setLoading(true);
      
      console.log('Activando orden:', orderData); // Debug
      
      // Activar la orden en el backend
      const activateData = {
        idOp: orderData.idOp,
        responsable: user.username
      };
      
      console.log('Datos de activación:', activateData); // Debug
      
      await axios.put('http://localhost:8081/ordenes-produccion/activar', activateData, {
        timeout: 30000 // 30 segundos
      });
      
      // Recargar órdenes para mostrar el cambio de estado
      await loadProductionOrders();
      
      alert(
        `🚀 ¡Producción iniciada!\n\n` +
        `✅ Materiales reservados automáticamente\n` +
        `📋 Orden enviada a la estación de LAVADO\n` +
        `👥 Los operarios pueden comenzar a trabajar`
      );
      
    } catch (error) {
      console.error('Error activando orden:', error);
      alert(
        `⚠️ La orden fue creada pero no se pudo activar\n\n` +
        `Posibles causas:\n` +
        `• No hay suficientes materias primas en stock\n` +
        `• Error de conexión con el servidor\n\n` +
        `Puedes activarla manualmente desde la tabla de órdenes`
      );
    } finally {
      setLoading(false);
    }
  };

  const loadProductionConfig = async () => {
    try {
      const response = await axios.get('http://localhost:8081/config-produccion');
      const savedSku = localStorage.getItem('skuSeleccionado');
      
      setProductionConfig({
        cantidad_base_orden: response.data.cantidadBaseOrden,
        numero_lotes_fijo: response.data.numeroLotesFijo,
        sku_referencia: savedSku || 'MIX-BERRIES-500G'
      });
    } catch (error) {
      console.error('Error cargando configuración:', error);
      const savedSku = localStorage.getItem('skuSeleccionado');
      // Configuración por defecto si hay error
      setProductionConfig({
        cantidad_base_orden: 500,
        numero_lotes_fijo: 10,
        sku_referencia: savedSku || 'MIX-BERRIES-500G'
      });
    }
  };
  
  const calculateWeight = (cantidad, skuReferencia) => {
    // Simular peso unitario basado en BOM
    const pesosPorSku = {
      'MIX-BERRIES-500G': 0.5, // 500g
      'MIX-TROPICAL-1KG': 1.0  // 1000g
    };
    const pesoUnitario = pesosPorSku[skuReferencia] || 0.5;
    return (cantidad * pesoUnitario).toFixed(1);
  };



  return (
    <>
      <style>{`
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          color: white;
        }
        .status-planificada {
          background-color: #ffc107;
          color: black;
        }
        .status-activa {
          background-color: #28a745;
        }
        .status-consumida {
          background-color: #6f42c1;
        }
        .status-pausada {
          background-color: #fd7e14;
        }
        .status-cancelada {
          background-color: #dc3545;
        }
        .status-unknown {
          background-color: #6c757d;
        }
      `}</style>
    <div className="production-container">
      <div className="production-header">
        <h2>Órdenes de Producción</h2>
        <p>Gestiona los lotes de producción de productos congelados</p>
        
        {productionConfig && (
          <div style={{
            background: '#e7f3ff',
            padding: '15px',
            borderRadius: '5px',
            border: '1px solid #b3d9ff',
            marginTop: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <i className="fas fa-cogs" style={{ color: '#0066cc', marginRight: '8px' }}></i>
              <strong style={{ color: '#0066cc' }}>Configuración Actual:</strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', fontSize: '14px' }}>
              <div>
                <strong>Cantidad por orden:</strong> {productionConfig.cantidad_base_orden} unidades
              </div>
              <div>
                <strong>Peso por orden:</strong> {calculateWeight(productionConfig.cantidad_base_orden, productionConfig.sku_referencia)} kg
              </div>
              <div>
                <strong>Número de lotes:</strong> {productionConfig.numero_lotes_fijo} lotes
              </div>
              <div style={{ color: '#6c757d' }}>
                <em>Configurar en Ajustes → Configuración de Producción</em>
              </div>
            </div>
          </div>
        )}
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
            <div className="stat-value">{productionOrders.filter(o => o.estado?.toLowerCase() === 'planificada').length}</div>
            <div className="stat-label">Planificadas</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">
            <i className="fas fa-cogs"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{productionOrders.filter(o => o.estado?.toLowerCase() === 'activa').length}</div>
            <div className="stat-label">Activas</div>
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
          ) : products.length === 0 ? (
            <div className="no-products-message" style={{ padding: '20px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px' }}>
              <p>📦 No hay productos fabricables disponibles</p>
              <p>Para crear órdenes de producción, primero necesitas:</p>
              <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                <li>Crear productos finales en la página de Productos</li>
                <li>Definir sus recetas (BOM) con materias primas</li>
              </ul>
            </div>
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
                    <strong>Cantidad configurada:</strong>
                    <span style={{ 
                      marginLeft: '8px', 
                      padding: '4px 8px',
                      background: '#e9ecef',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      {productionConfig ? productionConfig.cantidad_base_orden : 'Cargando...'} {product.unidadMedida}
                    </span>
                  </div>
                  {productionConfig && (
                    <div className="detail-item">
                      <strong>Peso total:</strong>
                      <span style={{ 
                        marginLeft: '8px',
                        color: '#007bff',
                        fontWeight: 'bold'
                      }}>
                        {calculateWeight(productionConfig.cantidad_base_orden, productionConfig.sku_referencia)} kg
                      </span>
                      <span style={{ 
                        marginLeft: '8px',
                        fontSize: '12px',
                        color: '#6c757d'
                      }}>
                        ({productionConfig.numero_lotes_fijo} lotes)
                      </span>
                    </div>
                  )}
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
                <option value="planificada">PLANIFICADA</option>
                <option value="activa">ACTIVA</option>
                <option value="consumida">CONSUMIDA</option>
                <option value="pausada">PAUSADA</option>
                <option value="cancelada">CANCELADA</option>
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
                <option value="idOp">Por ID</option>
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
                <th>ID</th>
                <th>SKU</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th>Responsable</th>
                <th>Almacén</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productionOrders
                .filter(order => {
                  const matchesSearch = order.idOp.toString().includes(orderFilter.toLowerCase()) ||
                                      order.sku.toLowerCase().includes(orderFilter.toLowerCase());
                  const matchesStatus = statusFilter === 'all' || order.estado?.toLowerCase() === statusFilter.toLowerCase();
                  return matchesSearch && matchesStatus;
                })
                .sort((a, b) => {
                  let aValue, bValue;
                  
                  switch(sortBy) {
                    case 'idOp':
                      aValue = a.idOp;
                      bValue = b.idOp;
                      break;
                    case 'sku':
                      aValue = a.sku;
                      bValue = b.sku;
                      break;
                    case 'cantidad':
                      aValue = a.cantidad;
                      bValue = b.cantidad;
                      break;
                    case 'fecha_creacion':
                      aValue = new Date(a.fechaCreacion || 0);
                      bValue = new Date(b.fechaCreacion || 0);
                      break;
                    default:
                      aValue = a.idOp;
                      bValue = b.idOp;
                  }
                  
                  if (typeof aValue === 'string') {
                    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                  }
                  
                  return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                })
                .map((order) => (
                <tr key={order.idOp}>
                  <td className="order-code">{order.idOp}</td>
                  <td className="sku-code">{order.sku}</td>
                  <td>{order.cantidad}</td>
                  <td>
                    {order.estado ? (
                      <span className={`status-badge status-${order.estado.toLowerCase()}`}>
                        {order.estado.toUpperCase()}
                      </span>
                    ) : (
                      <span className="status-badge status-unknown">SIN ESTADO</span>
                    )}
                  </td>
                  <td>{order.responsable}</td>
                  <td>{order.idAlmacen}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {order.estado?.toLowerCase() === 'planificada' && (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => activarOrdenManual(order)}
                          title="Activar orden y reservar materiales"
                        >
                          <i className="fas fa-play"></i> Activar
                        </button>
                      )}
                      {order.estado?.toLowerCase() === 'activa' && (
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => cancelarOrden(order.idOp)}
                          title="Cancelar orden y liberar materiales"
                        >
                          <i className="fas fa-times"></i> Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  );
};

export default Production;