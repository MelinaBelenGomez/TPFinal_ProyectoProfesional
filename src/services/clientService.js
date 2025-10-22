// Service para gestionar clientes y sus pedidos
class ClientService {
  
  static delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clientes simulados
  static mockClients = [
    {
      id: 1,
      nombre: 'Supermercado Central',
      email: 'compras@supercentral.com',
      telefono: '+54 11 4567-8901',
      direccion: 'Av. Corrientes 1234, CABA',
      tipo: 'MAYORISTA',
      estado: 'ACTIVO',
      fecha_registro: '2024-01-15T00:00:00Z'
    },
    {
      id: 2,
      nombre: 'Distribuidora Norte',
      email: 'pedidos@distnorte.com',
      telefono: '+54 11 5678-9012',
      direccion: 'Ruta 9 Km 45, San Isidro',
      tipo: 'DISTRIBUIDOR',
      estado: 'ACTIVO',
      fecha_registro: '2024-02-20T00:00:00Z'
    },
    {
      id: 3,
      nombre: 'Restaurante Gourmet',
      email: 'chef@gourmet.com',
      telefono: '+54 11 6789-0123',
      direccion: 'Palermo Soho, CABA',
      tipo: 'HORECA',
      estado: 'ACTIVO',
      fecha_registro: '2024-03-10T00:00:00Z'
    },
    {
      id: 4,
      nombre: 'Cadena de Heladerías',
      email: 'compras@helados.com',
      telefono: '+54 11 7890-1234',
      direccion: 'Belgrano, CABA',
      tipo: 'MAYORISTA',
      estado: 'INACTIVO',
      fecha_registro: '2024-04-05T00:00:00Z'
    }
  ];

  // Pedidos simulados por cliente
  static mockOrders = [
    {
      id: 1,
      cliente_id: 1,
      numero_pedido: 'PED-2025-001',
      fecha_pedido: '2025-01-10T00:00:00Z',
      estado: 'ENTREGADO',
      total: 125000,
      productos: [
        { nombre: 'Mix de Berries', cantidad: 50, precio_unitario: 1500 },
        { nombre: 'Mix Tropical', cantidad: 30, precio_unitario: 1200 }
      ]
    },
    {
      id: 2,
      cliente_id: 1,
      numero_pedido: 'PED-2025-002',
      fecha_pedido: '2025-01-14T00:00:00Z',
      estado: 'EN_PROCESO',
      total: 89000,
      productos: [
        { nombre: 'Pulpa Mix Berries', cantidad: 40, precio_unitario: 1800 },
        { nombre: 'Zanahoria Congelada', cantidad: 25, precio_unitario: 800 }
      ]
    },
    {
      id: 3,
      cliente_id: 2,
      numero_pedido: 'PED-2025-003',
      fecha_pedido: '2025-01-12T00:00:00Z',
      estado: 'ENTREGADO',
      total: 245000,
      productos: [
        { nombre: 'Mix de Berries', cantidad: 100, precio_unitario: 1500 },
        { nombre: 'Mix Tropical', cantidad: 80, precio_unitario: 1200 }
      ]
    },
    {
      id: 4,
      cliente_id: 2,
      numero_pedido: 'PED-2025-004',
      fecha_pedido: '2025-01-15T00:00:00Z',
      estado: 'PENDIENTE',
      total: 156000,
      productos: [
        { nombre: 'Mezcla de Huerta', cantidad: 60, precio_unitario: 1000 },
        { nombre: 'Brócoli Congelado', cantidad: 40, precio_unitario: 1200 }
      ]
    },
    {
      id: 5,
      cliente_id: 3,
      numero_pedido: 'PED-2025-005',
      fecha_pedido: '2025-01-13T00:00:00Z',
      estado: 'ENTREGADO',
      total: 45000,
      productos: [
        { nombre: 'Mix de Berries Premium', cantidad: 15, precio_unitario: 2000 },
        { nombre: 'Mango Congelado', cantidad: 10, precio_unitario: 1500 }
      ]
    },
    {
      id: 6,
      cliente_id: 4,
      numero_pedido: 'PED-2025-006',
      fecha_pedido: '2025-01-08T00:00:00Z',
      estado: 'CANCELADO',
      total: 78000,
      productos: [
        { nombre: 'Mix Tropical', cantidad: 50, precio_unitario: 1200 },
        { nombre: 'Piña Congelada', cantidad: 20, precio_unitario: 900 }
      ]
    }
  ];

  // Obtener todos los clientes
  static async getAllClients() {
    await this.delay();
    
    try {
      return {
        success: true,
        data: this.mockClients,
        total: this.mockClients.length
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener clientes',
        message: error.message
      };
    }
  }

  // Obtener pedidos de un cliente específico
  static async getClientOrders(clientId) {
    await this.delay();
    
    try {
      const clientOrders = this.mockOrders.filter(order => order.cliente_id === clientId);
      
      return {
        success: true,
        data: clientOrders,
        total: clientOrders.length
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener pedidos del cliente',
        message: error.message
      };
    }
  }

  // Obtener clientes con resumen de pedidos
  static async getClientsWithOrderSummary() {
    await this.delay();
    
    try {
      const clientsWithSummary = this.mockClients.map(client => {
        const clientOrders = this.mockOrders.filter(order => order.cliente_id === client.id);
        
        const totalPedidos = clientOrders.length;
        const totalVentas = clientOrders
          .filter(order => order.estado === 'ENTREGADO')
          .reduce((sum, order) => sum + order.total, 0);
        
        const ultimoPedido = clientOrders.length > 0 
          ? clientOrders.sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido))[0]
          : null;

        return {
          ...client,
          resumen: {
            total_pedidos: totalPedidos,
            total_ventas: totalVentas,
            ultimo_pedido: ultimoPedido?.fecha_pedido || null,
            pedidos_pendientes: clientOrders.filter(o => o.estado === 'PENDIENTE' || o.estado === 'EN_PROCESO').length
          }
        };
      });

      return {
        success: true,
        data: clientsWithSummary,
        total: clientsWithSummary.length
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener resumen de clientes',
        message: error.message
      };
    }
  }

  // Obtener estadísticas generales
  static async getClientStats() {
    await this.delay(200);
    
    try {
      const totalClientes = this.mockClients.length;
      const clientesActivos = this.mockClients.filter(c => c.estado === 'ACTIVO').length;
      const totalPedidos = this.mockOrders.length;
      const ventasTotales = this.mockOrders
        .filter(order => order.estado === 'ENTREGADO')
        .reduce((sum, order) => sum + order.total, 0);

      const tipoStats = ['MAYORISTA', 'DISTRIBUIDOR', 'HORECA'].map(tipo => ({
        tipo,
        cantidad: this.mockClients.filter(c => c.tipo === tipo).length
      }));

      return {
        success: true,
        data: {
          total_clientes: totalClientes,
          clientes_activos: clientesActivos,
          total_pedidos: totalPedidos,
          ventas_totales: ventasTotales,
          por_tipo: tipoStats
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener estadísticas',
        message: error.message
      };
    }
  }

  // Obtener tipos de cliente disponibles
  static getClientTypes() {
    return [
      { value: 'MAYORISTA', label: 'Mayorista' },
      { value: 'DISTRIBUIDOR', label: 'Distribuidor' },
      { value: 'HORECA', label: 'Horeca (Hoteles/Restaurantes)' }
    ];
  }

  // Obtener estados de pedido
  static getOrderStates() {
    return [
      { value: 'PENDIENTE', label: 'Pendiente', color: '#ffc107' },
      { value: 'EN_PROCESO', label: 'En Proceso', color: '#17a2b8' },
      { value: 'ENTREGADO', label: 'Entregado', color: '#28a745' },
      { value: 'CANCELADO', label: 'Cancelado', color: '#dc3545' }
    ];
  }
}

export default ClientService;