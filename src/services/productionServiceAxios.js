import axios from 'axios';

// Service usando Axios básico - sin configuraciones complicadas
class ProductionServiceAxios {
  
  // URL del backend
  static baseURL = 'http://localhost:8081';
  
  static delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 🔗 CONECTADO AL BACKEND: Obtener producto por SKU
  static async getProductBySku(sku) {
    try {
      // Axios básico: axios.get(url)
      const response = await axios.get(`${this.baseURL}/productos/${sku}`);
      
      // response.data contiene la respuesta del servidor
      return {
        success: true,
        data: {
          sku: response.data.sku,
          nombre: response.data.nombre,
          descripcion: response.data.descripcion,
          unidad_medida: response.data.unidadMedida,
          categoria: response.data.idCategoria
        }
      };
    } catch (error) {
      // Si hay error (404, 500, etc.)
      return {
        success: false,
        message: 'Producto no encontrado'
      };
    }
  }

  // 🔗 CONECTADO AL BACKEND: Crear producto
  static async createProduct(productData) {
    try {
      // Axios básico: axios.post(url, data)
      await axios.post(`${this.baseURL}/productos`, {
        sku: productData.sku,
        nombreCategoria: productData.categoria,
        nombre: productData.nombre,
        unidadMedida: productData.unidad_medida,
        descripcion: productData.descripcion
      });

      return {
        success: true,
        message: 'Producto creado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al crear producto'
      };
    }
  }

  // 🔗 CONECTADO AL BACKEND: Eliminar producto
  static async deleteProduct(sku) {
    try {
      // Axios básico: axios.delete(url)
      await axios.delete(`${this.baseURL}/productos/${sku}`);
      
      return {
        success: true,
        message: 'Producto eliminado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al eliminar producto'
      };
    }
  }

  // 🔗 CONECTADO AL BACKEND: Obtener todos los productos
  static async getAvailableProducts() {
    try {
      const response = await axios.get(`${this.baseURL}/productos/todos`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener productos'
      };
    }
  }

  // 📦 SIMULADO: Crear orden de producción
  static async createProductionOrder(orderData) {
    await this.delay();
    
    try {
      const payload = {
        sku: orderData.sku,
        cantidad: orderData.cantidad,
        id_centro_produccion: orderData.id_centro_produccion,
        usuario_responsable: orderData.responsable
      };

      console.log('📤 Enviando al backend (simulado):', payload);

      const response = {
        success: true,
        data: {
          id_op: Math.floor(Math.random() * 1000) + 1,
          codigo: `OP-${Date.now().toString().slice(-6)}`,
          sku: payload.sku,
          cantidad: payload.cantidad,
          id_centro_produccion: payload.id_centro_produccion,
          estado: 'CREADA',
          fecha_creacion: new Date().toISOString(),
          usuario_responsable: payload.usuario_responsable
        },
        message: 'Orden de producción creada exitosamente'
      };

      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear la orden de producción',
        message: error.message
      };
    }
  }

  // 🔗 CONECTADO AL BACKEND: Obtener categorías disponibles
  static async getCategories() {
    try {
      const response = await axios.get(`${this.baseURL}/categorias`);
      return response.data.map(cat => cat.nombre);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return []; // Devolver array vacío si hay error
    }
  }

  // 🔗 CONECTADO AL BACKEND: Crear categoría
  static async createCategory(categoryData) {
    try {
      await axios.post(`${this.baseURL}/categorias`, {
        nombre: categoryData.nombre,
        descripcion: categoryData.descripcion
      });
      return {
        success: true,
        message: 'Categoría creada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al crear categoría'
      };
    }
  }

  // 🔗 CONECTADO AL BACKEND: Eliminar categoría
  static async deleteCategory(nombre) {
    try {
      await axios.delete(`${this.baseURL}/categorias/${nombre}`);
      return {
        success: true,
        message: 'Categoría eliminada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al eliminar categoría'
      };
    }
  }

  // 🔗 CONECTADO AL BACKEND: Obtener BOM de un producto
  static async getBom(sku) {
    try {
      const response = await axios.get(`${this.baseURL}/bom/${sku}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener BOM'
      };
    }
  }

  // 🔗 CONECTADO AL BACKEND: Crear entrada BOM
  static async createBomEntry(bomData) {
    try {
      await axios.post(`${this.baseURL}/bom`, {
        skuProductoFinal: bomData.skuProductoFinal,
        skuMaterial: bomData.skuMaterial,
        cantPorUnidad: bomData.cantPorUnidad
      });
      return {
        success: true,
        message: 'Ingrediente agregado al BOM'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al agregar ingrediente'
      };
    }
  }

  // 🔗 CONECTADO AL BACKEND: Eliminar BOM completo
  static async deleteBom(sku) {
    try {
      await axios.delete(`${this.baseURL}/bom/${sku}`);
      return {
        success: true,
        message: 'BOM eliminado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al eliminar BOM'
      };
    }
  }

  // 🔗 CONECTADO AL BACKEND: Obtener centros de producción
  static async getCentros() {
    try {
      const response = await axios.get(`${this.baseURL}/centros-produccion`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener centros'
      };
    }
  }

  // 🔗 CONECTADO AL BACKEND: Crear centro de producción
  static async createCentro(centroData) {
    try {
      await axios.post(`${this.baseURL}/centros-produccion`, {
        sucursal: centroData.sucursal,
        descripcion: centroData.descripcion
      });
      return {
        success: true,
        message: 'Centro de producción creado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al crear centro de producción'
      };
    }
  }

  // 🔗 CONECTADO AL BACKEND: Obtener almacenes
  static async getAlmacenes() {
    try {
      const response = await axios.get(`${this.baseURL}/almacenes`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener almacenes'
      };
    }
  }

  // 🔗 CONECTADO AL BACKEND: Crear almacén
  static async createAlmacen(almacenData) {
    try {
      await axios.post(`${this.baseURL}/almacenes`, {
        nombre: almacenData.nombre,
        capacidad: almacenData.capacidad,
        estado: almacenData.estado,
        idCentro: almacenData.idCentro
      });
      return {
        success: true,
        message: 'Almacén creado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al crear almacén'
      };
    }
  }

  // 🔗 CONECTADO AL BACKEND: Habilitar producto en almacén
  static async habilitarProducto(sku, idAlmacen) {
    try {
      await axios.put(`${this.baseURL}/stock/habilitar-producto`, {
        sku: sku,
        idAlmacen: idAlmacen
      });
      return {
        success: true,
        message: 'Producto habilitado en almacén'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al habilitar producto'
      };
    }
  }

  // 🔗 CONECTADO AL BACKEND: Incrementar stock
  static async incrementarStock(sku, idAlmacen, cantidad) {
    try {
      await axios.put(`${this.baseURL}/stock/incrementar`, {
        sku: sku,
        idAlmacen: idAlmacen,
        cantidad: cantidad
      });
      return {
        success: true,
        message: 'Stock incrementado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al incrementar stock'
      };
    }
  }

  // 🔗 CONECTADO AL BACKEND: Consultar stock de producto en almacén
  static async consultarStock(sku, idAlmacen) {
    try {
      const response = await axios.get(`${this.baseURL}/stock/consultar-producto-almacen`, {
        params: { sku: sku, idAlmacen: idAlmacen }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al consultar stock'
      };
    }
  }

  // 🔗 CONECTADO AL BACKEND: Obtener materias primas con stock
  static async getRawMaterialsWithStock() {
    try {
      const [productsResponse, almacenesResponse] = await Promise.all([
        this.getAvailableProducts(),
        this.getAlmacenes()
      ]);
      
      if (productsResponse.success && almacenesResponse.success) {
        const materials = [];
        
        for (const product of productsResponse.data) {
          let totalStock = 0;
          let stockDetails = [];
          
          for (const almacen of almacenesResponse.data) {
            try {
              const stockResponse = await this.consultarStock(product.sku, almacen.idAlmacen);
              if (stockResponse.success && stockResponse.data) {
                totalStock += stockResponse.data.stockTotal || 0;
                stockDetails.push({
                  almacen: almacen.nombre,
                  stock: stockResponse.data.stockTotal || 0,
                  minimo: stockResponse.data.cantidadMinima || 0
                });
              }
            } catch (error) {
              // Si no hay stock en este almacén, continuar
            }
          }
          
          materials.push({
            id: product.sku,
            codigo: product.sku,
            nombre: product.nombre,
            categoria: product.idCategoria || 'Sin categoría',
            stock_actual: totalStock,
            stock_minimo: Math.min(...stockDetails.map(s => s.minimo)) || 10,
            unidad: product.unidadMedida || 'kg',
            precio_unitario: 0,
            proveedor: 'Backend',
            fecha_vencimiento: new Date().toISOString().split('T')[0],
            estado: totalStock > 0 ? 'DISPONIBLE' : 'AGOTADO',
            stockDetails: stockDetails
          });
        }
        
        return {
          success: true,
          data: materials
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener datos'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener materias primas'
      };
    }
  }
}

export default ProductionServiceAxios;