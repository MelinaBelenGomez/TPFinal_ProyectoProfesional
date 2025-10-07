import { useState } from 'react';

const ProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.name && formData.category && formData.price && formData.stock) {
      alert(`Producto "${formData.name}" agregado correctamente a la categoría ${formData.category}.\nPrecio: $${formData.price}\nStock: ${formData.stock} unidades`);
      setFormData({ name: '', category: '', price: '', stock: '' });
    } else {
      alert('Por favor complete todos los campos obligatorios.');
    }
  };

  return (
    <div className="card" style={{marginTop: '1.5rem'}}>
      <h3>Agregar Nuevo Producto</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre del Producto</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Arándanos congelados"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Categoría</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Seleccione una categoría</option>
            <option value="frutas">Frutas</option>
            <option value="hortalizas">Hortalizas</option>
            <option value="mezclas">Mezclas</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Precio ($)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            placeholder="0.00"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="stock">Stock Inicial</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="0"
          />
        </div>
        
        <button type="submit">Agregar Producto</button>
      </form>
    </div>
  );
};

export default ProductForm;