import { useState } from 'react';

const Production = () => {
  const [productionOrders, setProductionOrders] = useState([]);

  const productTypes = [
    {
      id: 'mix-berries',
      name: 'Mix de Berries',
      description: 'Arándanos, frutillas, moras',
      icon: 'fas fa-seedling',
      color: '#8e44ad',
      ingredients: [
        { name: 'Arándanos', percentage: 40 },
        { name: 'Frutillas', percentage: 35 },
        { name: 'Moras', percentage: 25 }
      ]
    },
    {
      id: 'mix-tropical',
      name: 'Mix Tropical',
      description: 'Mango, maracuyá, kiwi',
      icon: 'fas fa-leaf',
      color: '#f39c12',
      ingredients: [
        { name: 'Mango', percentage: 50 },
        { name: 'Maracuyá', percentage: 30 },
        { name: 'Kiwi', percentage: 20 }
      ]
    },
    {
      id: 'pulpa-berries',
      name: 'Pulpa Mix Berries',
      description: 'Pulpa congelada de berries',
      icon: 'fas fa-blender',
      color: '#e74c3c',
      ingredients: [
        { name: 'Mix de Berries', percentage: 100 }
      ]
    },
    {
      id: 'pulpa-tropical',
      name: 'Pulpa Tropical',
      description: 'Pulpa congelada tropical',
      icon: 'fas fa-blender',
      color: '#f1c40f',
      ingredients: [
        { name: 'Mix Tropical', percentage: 100 }
      ]
    },
    {
      id: 'mezcla-huerta',
      name: 'Mezcla de Huerta',
      description: 'Brócoli, repollo, coliflor',
      icon: 'fas fa-carrot',
      color: '#27ae60',
      ingredients: [
        { name: 'Brócoli', percentage: 35 },
        { name: 'Repollo', percentage: 35 },
        { name: 'Coliflor', percentage: 30 }
      ]
    },
    {
      id: 'combo-sopa',
      name: 'Combo para Sopa',
      description: 'Zapallo, cebolla, zanahoria, choclo, papa',
      icon: 'fas fa-soup',
      color: '#d35400',
      ingredients: [
        { name: 'Zapallo', percentage: 25 },
        { name: 'Cebolla', percentage: 15 },
        { name: 'Zanahoria', percentage: 20 },
        { name: 'Choclo', percentage: 20 },
        { name: 'Papa', percentage: 20 }
      ]
    }
  ];

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderForm, setOrderForm] = useState({
    quantity: '',
    priority: 'normal',
    notes: ''
  });

  const handleCreateOrder = (product) => {
    setSelectedProduct(product);
    setOrderForm({ quantity: '', priority: 'normal', notes: '' });
  };

  const handleFormChange = (e) => {
    setOrderForm({
      ...orderForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    
    if (!orderForm.quantity) {
      alert('Por favor ingrese la cantidad a producir');
      return;
    }

    const newOrder = {
      id: `OP-${Date.now()}`,
      product: selectedProduct,
      quantity: parseFloat(orderForm.quantity),
      priority: orderForm.priority,
      notes: orderForm.notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
      currentStage: 'lavado',
      stages: {
        lavado: { completed: false, employee: null, completedAt: null },
        clasificacion: { completed: false, employee: null, completedAt: null },
        pelado: { completed: false, employee: null, completedAt: null },
        escurrido: { completed: false, employee: null, completedAt: null },
        congelacion: { completed: false, employee: null, completedAt: null },
        empaquetado: { completed: false, employee: null, completedAt: null }
      }
    };

    setProductionOrders([...productionOrders, newOrder]);
    setSelectedProduct(null);
    alert(`Orden de producción creada: ${newOrder.id}`);
  };

  const calculateIngredients = (product, quantity) => {
    return product.ingredients.map(ingredient => ({
      ...ingredient,
      amount: (quantity * ingredient.percentage / 100).toFixed(2)
    }));
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
            <div className="stat-value">{productionOrders.filter(o => o.status === 'pending').length}</div>
            <div className="stat-label">Pendientes</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">
            <i className="fas fa-cogs"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{productionOrders.filter(o => o.status === 'in-progress').length}</div>
            <div className="stat-label">En Proceso</div>
          </div>
        </div>
      </div>

      <div className="products-grid">
        <h3>Selecciona el tipo de producto a producir:</h3>
        <div className="product-cards">
          {productTypes.map((product) => (
            <div key={product.id} className="product-card card">
              <div className="product-header" style={{ backgroundColor: product.color }}>
                <i className={product.icon}></i>
              </div>
              <div className="product-info">
                <h4>{product.name}</h4>
                <p>{product.description}</p>
                <div className="ingredients-list">
                  {product.ingredients.map((ingredient, index) => (
                    <span key={index} className="ingredient-tag">
                      {ingredient.name} ({ingredient.percentage}%)
                    </span>
                  ))}
                </div>
                <button 
                  className="create-order-btn"
                  onClick={() => handleCreateOrder(product)}
                >
                  <i className="fas fa-plus"></i> Crear Orden
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

          {/* // Modal para crear orden de producción */}
          {/* //un modal es una ventana emergente que aparece sobre la interfaz principal para mostrar información adicional o solicitar acciones del usuario. */}
      {selectedProduct && (
        <div className="order-modal">
          <div className="modal-content card">
            <div className="modal-header">
              <h3>Crear Orden de Producción</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedProduct(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="selected-product">
                <h4>{selectedProduct.name}</h4>
                <p>{selectedProduct.description}</p>
              </div>

              <form onSubmit={handleSubmitOrder}>
                <div className="form-group">
                  <label htmlFor="quantity">Cantidad a producir (kg)</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={orderForm.quantity}
                    onChange={handleFormChange}
                    placeholder="Ej: 50"
                    step="0.1"
                    min="0.1"
                  />
                </div>

                {orderForm.quantity && (
                  <div className="ingredients-calculation">
                    <h5>Materia prima requerida:</h5>
                    {calculateIngredients(selectedProduct, parseFloat(orderForm.quantity)).map((ingredient, index) => (
                      <div key={index} className="ingredient-requirement">
                        <span>{ingredient.name}:</span>
                        <strong>{ingredient.amount} kg</strong>
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="notes">Notas adicionales</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={orderForm.notes}
                    onChange={handleFormChange}
                    placeholder="Instrucciones especiales..."
                    rows="3"
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setSelectedProduct(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="primary">
                    Crear Orden
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Production;