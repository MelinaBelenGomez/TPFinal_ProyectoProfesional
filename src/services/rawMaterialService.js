// Service para gestionar materia prima
class RawMaterialService {
  
  static delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Materia prima simulada
  static mockRawMaterials = [
    {
      id: 1,
      codigo: 'MP-001',
      nombre: 'Frutillas',
      categoria: 'Berries',
      stock_actual: 150,
      stock_minimo: 50,
      unidad: 'kg',
      precio_unitario: 2500,
      proveedor: 'Frutas del Valle',
      fecha_vencimiento: '2025-02-15',
      estado: 'DISPONIBLE'
    },
    {
      id: 2,
      codigo: 'MP-002',
      nombre: 'Arándanos',
      categoria: 'Berries',
      stock_actual: 80,
      stock_minimo: 30,
      unidad: 'kg',
      precio_unitario: 4200,
      proveedor: 'Frutas del Valle',
      fecha_vencimiento: '2025-02-20',
      estado: 'DISPONIBLE'
    },
    {
      id: 3,
      codigo: 'MP-003',
      nombre: 'Mango',
      categoria: 'Tropical',
      stock_actual: 25,
      stock_minimo: 40,
      unidad: 'kg',
      precio_unitario: 1800,
      proveedor: 'Tropical Fresh',
      fecha_vencimiento: '2025-01-30',
      estado: 'STOCK_BAJO'
    },
    {
      id: 4,
      codigo: 'MP-004',
      nombre: 'Piña',
      categoria: 'Tropical',
      stock_actual: 120,
      stock_minimo: 60,
      unidad: 'kg',
      precio_unitario: 1200,
      proveedor: 'Tropical Fresh',
      fecha_vencimiento: '2025-02-10',
      estado: 'DISPONIBLE'
    },
    {
      id: 5,
      codigo: 'MP-005',
      nombre: 'Zanahoria',
      categoria: 'Verduras',
      stock_actual: 200,
      stock_minimo: 80,
      unidad: 'kg',
      precio_unitario: 800,
      proveedor: 'Huerta Orgánica',
      fecha_vencimiento: '2025-02-25',
      estado: 'DISPONIBLE'
    },
    {
      id: 6,
      codigo: 'MP-006',
      nombre: 'Brócoli',
      categoria: 'Verduras',
      stock_actual: 15,
      stock_minimo: 30,
      unidad: 'kg',
      precio_unitario: 1200,
      proveedor: 'Huerta Orgánica',
      fecha_vencimiento: '2025-01-28',
      estado: 'STOCK_BAJO'
    }
  ];

  // Obtener toda la materia prima
  static async getAllRawMaterials() {
    await this.delay();
    
    try {
      return {
        success: true,
        data: this.mockRawMaterials,
        total: this.mockRawMaterials.length
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener materia prima',
        message: error.message
      };
    }
  }

  // Agregar nueva materia prima
  static async addRawMaterial(materialData) {
    await this.delay();
    
    try {
      const newId = Math.max(...this.mockRawMaterials.map(m => m.id)) + 1;
      
      const newMaterial = {
        id: newId,
        codigo: materialData.codigo,
        nombre: materialData.nombre,
        categoria: materialData.categoria,
        stock_actual: parseInt(materialData.stock_actual),
        stock_minimo: parseInt(materialData.stock_minimo),
        unidad: materialData.unidad,
        precio_unitario: parseFloat(materialData.precio_unitario),
        proveedor: materialData.proveedor,
        fecha_vencimiento: materialData.fecha_vencimiento,
        estado: parseInt(materialData.stock_actual) > parseInt(materialData.stock_minimo) ? 'DISPONIBLE' : 'STOCK_BAJO'
      };

      this.mockRawMaterials.push(newMaterial);

      return {
        success: true,
        data: newMaterial,
        message: 'Materia prima agregada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al agregar materia prima',
        message: error.message
      };
    }
  }

  // Actualizar stock de materia prima
  static async updateStock(materialId, newStock) {
    await this.delay();
    
    try {
      const materialIndex = this.mockRawMaterials.findIndex(m => m.id === materialId);
      
      if (materialIndex === -1) {
        return {
          success: false,
          error: 'MATERIAL_NOT_FOUND',
          message: 'Materia prima no encontrada'
        };
      }

      const material = this.mockRawMaterials[materialIndex];
      const updatedMaterial = {
        ...material,
        stock_actual: parseInt(newStock),
        estado: parseInt(newStock) > material.stock_minimo ? 'DISPONIBLE' : 'STOCK_BAJO'
      };

      this.mockRawMaterials[materialIndex] = updatedMaterial;

      return {
        success: true,
        data: updatedMaterial,
        message: 'Stock actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar stock',
        message: error.message
      };
    }
  }

  // Eliminar materia prima
  static async deleteRawMaterial(materialId) {
    await this.delay();
    
    try {
      const materialIndex = this.mockRawMaterials.findIndex(m => m.id === materialId);
      
      if (materialIndex === -1) {
        return {
          success: false,
          error: 'MATERIAL_NOT_FOUND',
          message: 'Materia prima no encontrada'
        };
      }

      const deletedMaterial = this.mockRawMaterials.splice(materialIndex, 1)[0];

      return {
        success: true,
        data: deletedMaterial,
        message: 'Materia prima eliminada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al eliminar materia prima',
        message: error.message
      };
    }
  }

  // Obtener categorías disponibles
  static getCategories() {
    return ['Berries', 'Tropical', 'Verduras', 'Frutas', 'Otros'];
  }

  // Obtener unidades disponibles
  static getUnits() {
    return ['kg', 'g', 'unidad', 'caja'];
  }

  // Obtener alertas de stock bajo
  static async getLowStockAlerts() {
    await this.delay(200);
    
    try {
      const lowStockMaterials = this.mockRawMaterials.filter(material => 
        material.estado === 'STOCK_BAJO'
      );

      return {
        success: true,
        data: lowStockMaterials,
        count: lowStockMaterials.length
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener alertas',
        message: error.message
      };
    }
  }
}

export default RawMaterialService;