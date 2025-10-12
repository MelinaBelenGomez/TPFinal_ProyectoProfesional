import { useState, useEffect } from 'react';

const Products = () => {
  const [salesData, setSalesData] = useState([
    { product: 'Frutillas', Stock: 100 },
    { product: 'Frambuesas', Stock: 55 },
    { product: 'Ananá', Stock: 65 },
    { product: 'Moras', Stock: 455 },
    { product: 'May', Stock: 43 },
    { product: 'Jun', Stock: 33 }
  ]);

};
export default Products;