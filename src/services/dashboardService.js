const API_BASE_URL = 'http://localhost:8081';

export const dashboardService = {
  // Obtener órdenes activas
  async getActiveOrders() {
    try {
      const response = await fetch(`${API_BASE_URL}/ordenes-produccion/consultar/todas`);
      if (!response.ok) throw new Error('Error al obtener órdenes');
      const orders = await response.json();
      return orders.filter(order => order.estado === 'activa' || order.estado === 'planificada');
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  },

  // Obtener estado de estaciones de trabajo
  async getWorkStationsStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/lotes/debug/todos`);
      const estaciones = ['LAVADO', 'CLASIFICACION', 'PELADO', 'ESCURRIDO', 'CONGELACION', 'EMPAQUETADO'];
      
      if (!response.ok) {
        // Si no hay lotes, mostrar todas las estaciones libres
        return estaciones.map(estacion => ({
          nombre: estacion,
          lotesActivos: 0,
          ocupada: false
        }));
      }
      
      const lotes = await response.json();
      const estacionesStatus = estaciones.map(estacion => {
        const lotesEnEstacion = lotes.filter(lote => 
          lote.estacionActual === estacion && lote.estado === 'EN_PROCESO'
        );
        return {
          nombre: estacion,
          lotesActivos: lotesEnEstacion.length,
          ocupada: lotesEnEstacion.length > 0
        };
      });
      
      return estacionesStatus;
    } catch (error) {
      console.error('Error:', error);
      const estaciones = ['LAVADO', 'CLASIFICACION', 'PELADO', 'ESCURRIDO', 'CONGELACION', 'EMPAQUETADO'];
      return estaciones.map(estacion => ({
        nombre: estacion,
        lotesActivos: 0,
        ocupada: false
      }));
    }
  },

  // Obtener stock bajo
  async getLowStock() {
    try {
      const response = await fetch(`${API_BASE_URL}/stock/todos`);
      if (!response.ok) throw new Error('Error al obtener stock');
      const stock = await response.json();
      
      return stock.filter(item => 
        item.stockDisponible <= item.cantidadMinima && item.cantidadMinima > 0
      ).slice(0, 5);
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  },

  // Obtener estadísticas globales
  async getGlobalStats() {
    try {
      // Intentar obtener estadísticas del endpoint de material-op
      const statsResponse = await fetch(`${API_BASE_URL}/material-op/estadisticas-globales`);
      if (statsResponse.ok) {
        return await statsResponse.json();
      }
      
      // Si no funciona, calcular desde órdenes
      const ordersResponse = await fetch(`${API_BASE_URL}/ordenes-produccion/consultar/todas`);
      if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        return {
          totalOrdenes: orders.length,
          ordenesActivas: orders.filter(o => o.estado === 'activa').length,
          ordenesPlanificadas: orders.filter(o => o.estado === 'planificada').length,
          ordenesConsumidas: orders.filter(o => o.estado === 'consumida').length
        };
      }
      throw new Error('Error al obtener órdenes');
    } catch (error) {
      console.error('Error:', error);
      return {
        totalOrdenes: 0,
        ordenesActivas: 0,
        ordenesPlanificadas: 0,
        ordenesConsumidas: 0
      };
    }
  }
};