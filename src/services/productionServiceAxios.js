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
}

export default ProductionServiceAxios;