// Simulación de API para órdenes de producción
class ProductionService {
  
  static delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Crear orden de producción - DATOS QUE SE ENVÍAN AL BACKEND
  static async createProductionOrder(orderData) {
    await this.delay();
    
    try {
      // PAYLOAD: Solo estos datos se envían al backend
      const payload = {
        sku: orderData.sku,                           // SKU del producto
        cantidad: orderData.cantidad,                 // Cantidad fija del lote
        id_centro_produccion: orderData.id_centro_produccion, // Centro de producción
        id_ceco: orderData.id_ceco,                   // Centro de costo
        usuario_responsable: orderData.responsable    // Usuario que crea la orden
      };

      console.log('📤 Enviando al backend:', payload);

      // Simulación de respuesta del backend
      const response = {
        success: true,
        data: {
          id_op: Math.floor(Math.random() * 1000) + 1,
          codigo: `OP-${Date.now().toString().slice(-6)}`,
          sku: payload.sku,
          cantidad: payload.cantidad,
          id_centro_produccion: payload.id_centro_produccion,
          id_ceco: payload.id_ceco,
          estado: 'CREADA',
          fecha_creacion: new Date().toISOString(),
          usuario_responsable: payload.usuario_responsable
        },
        message: 'Orden de producción creada exitosamente'
      };

      console.log('📥 Respuesta del backend:', response);
      return response;

    } catch (error) {
      return {
        success: false,
        error: 'Error al crear la orden de producción',
        message: error.message
      };
    }
  }

  // Obtener productos disponibles
  static async getAvailableProducts() {
    await this.delay();
    
    const products = [
      {
        sku: 'FRZ-MIX-BER-001',
        nombre: 'Mix de Berries',
        descripcion: 'Arándanos, frutillas, moras',
        unidad_medida: 'unidades',
        cantidad_por_lote: 200
      },
      {
        sku: 'FRZ-MIX-TRP-002',
        nombre: 'Mix Tropical',
        descripcion: 'Mango, maracuyá, kiwi',
        unidad_medida: 'unidades',
        cantidad_por_lote: 150
      },
      {
        sku: 'FRZ-PLP-BER-003',
        nombre: 'Pulpa Mix Berries',
        descripcion: 'Pulpa congelada de berries',
        unidad_medida: 'unidades',
        cantidad_por_lote: 100
      },
      {
        sku: 'FRZ-PLP-TRP-004',
        nombre: 'Pulpa Tropical',
        descripcion: 'Pulpa congelada tropical',
        unidad_medida: 'unidades',
        cantidad_por_lote: 100
      },
      {
        sku: 'FRZ-HRT-MIX-005',
        nombre: 'Mezcla de Huerta',
        descripcion: 'Brócoli, repollo, coliflor',
        unidad_medida: 'unidades',
        cantidad_por_lote: 180
      },
      {
        sku: 'FRZ-SOP-CMB-006',
        nombre: 'Combo para Sopa',
        descripcion: 'Zapallo, cebolla, zanahoria, choclo, papa',
        unidad_medida: 'unidades',
        cantidad_por_lote: 220
      }
    ];

    return {
      success: true,
      data: products
    };
  }
}

export default ProductionService;