import { useState } from 'react';

const ProductsTable = () => {
  const [filter, setFilter] = useState('');
  const [products] = useState([
    { name: 'Frutillas congeladas', category: 'Frutas', sales: '245 unidades', stock: '156 unidades' },
    { name: 'Espinacas congeladas', category: 'Hortalizas', sales: '189 unidades', stock: '78 unidades' },
    { name: 'Mix de berries', category: 'Frutas', sales: '167 unidades', stock: '92 unidades' },
    { name: 'Zanahorias baby', category: 'Hortalizas', sales: '134 unidades', stock: '115 unidades' }
  ]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleRowClick = (productName) => {
    alert(`Detalles del producto: ${productName}`);
  };

  return (
    <div className="card">
      <h3>Productos Populares</h3>
      <input
        type="text"
        placeholder="Buscar productos..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem',
          width: '100%'
        }}
      />
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Ventas</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product, index) => (
            <tr key={index} onClick={() => handleRowClick(product.name)} style={{cursor: 'pointer'}}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>{product.sales}</td>
              <td>{product.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;