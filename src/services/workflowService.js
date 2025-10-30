// Service para gestionar el flujo de trabajo de producción
class WorkflowService {
  
  static delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Órdenes simuladas en la base de datos
  static mockOrders = [
    {
      id_op: 1,
      codigo: 'OP-001234',
      sku: 'FRZ-MIX-BER-001',
      producto_nombre: 'Mix de Berries',
      cantidad: 200,
      estado: 'CREADA',
      fecha_creacion: '2025-01-15T08:00:00Z',
      usuario_responsable: 'admin'
    },
    {
      id_op: 2,
      codigo: 'OP-001235',
      sku: 'FRZ-MIX-TRP-002',
      producto_nombre: 'Mix Tropical',
      cantidad: 150,
      estado: 'LAVADO',
      fecha_creacion: '2025-01-15T09:30:00Z',
      usuario_responsable: 'admin'
    },
    {
      id_op: 3,
      codigo: 'OP-001236',
      sku: 'FRZ-PLP-BER-003',
      producto_nombre: 'Pulpa Mix Berries',
      cantidad: 100,
      estado: 'CLASIFICACION',
      fecha_creacion: '2025-01-15T10:15:00Z',
      usuario_responsable: 'admin'
    },
    {
      id_op: 4,
      codigo: 'OP-001237',
      sku: 'FRZ-HRT-MIX-005',
      producto_nombre: 'Mezcla de Huerta',
      cantidad: 180,
      estado: 'PELADO',
      fecha_creacion: '2025-01-15T11:00:00Z',
      usuario_responsable: 'admin'
    }
  ];

  // Definir qué estados puede ver cada rol
  static getVisibleStatesForRole(role) {
    const stateMap = {
      'operario_lavado': ['CREADA'],
      'operario_clasificacion': ['LAVADO'],
      'pelado_trozado': ['CLASIFICACION'],
      'operario_escurrido': ['PELADO'],
      'operario_congelacion': ['ESCURRIDO'],
      'operario_empaquetado': ['CONGELACION'],
      'admin': ['CREADA', 'LAVADO', 'CLASIFICACION', 'PELADO', 'ESCURRIDO', 'CONGELACION', 'EMPAQUETADO', 'TERMINADA']
    };
    
    return stateMap[role] || [];
  }

  // Definir el siguiente estado en el flujo
  static getNextState(currentState) {
    const stateFlow = {
      'CREADA': 'LAVADO',
      'LAVADO': 'CLASIFICACION',
      'CLASIFICACION': 'PELADO',
      'PELADO': 'ESCURRIDO',
      'ESCURRIDO': 'CONGELACION',
      'CONGELACION': 'EMPAQUETADO',
      'EMPAQUETADO': 'TERMINADA'
    };
    
    return stateFlow[currentState];
  }


  // Obtener órdenes para un rol específico
  static async getOrdersForRole(userRole) {
    await this.delay();
    
    try {
      const visibleStates = this.getVisibleStatesForRole(userRole);
      
      // Filtrar órdenes según el rol
      const filteredOrders = this.mockOrders.filter(order => 
        visibleStates.includes(order.estado)
      );

      return {
        success: true,
        data: filteredOrders,
        total: filteredOrders.length
      };

    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener órdenes',
        message: error.message
      };
    }
  }

  // Avanzar una orden al siguiente estado
  static async completeStage(orderData) {
    await this.delay();
    
    try {
      // PAYLOAD que se envía al backend
      const payload = {
        id_op: orderData.id_op,
        estado_actual: orderData.estado_actual,
        usuario_operario: orderData.usuario_operario,
        observaciones: orderData.observaciones || ''
      };

      console.log('📤 Completando etapa:', payload);

      // Buscar la orden en el mock
      const orderIndex = this.mockOrders.findIndex(o => o.id_op === payload.id_op);
      
      if (orderIndex === -1) {
        return {
          success: false,
          error: 'ORDER_NOT_FOUND',
          message: 'Orden no encontrada'
        };
      }

      const order = this.mockOrders[orderIndex];
      
      // Verificar que el estado actual coincida
      if (order.estado !== payload.estado_actual) {
        return {
          success: false,
          error: 'INVALID_STATE',
          message: `La orden ya no está en estado ${payload.estado_actual}`
        };
      }

      // Obtener siguiente estado
      const nextState = this.getNextState(order.estado);
      
      if (!nextState) {
        return {
          success: false,
          error: 'NO_NEXT_STATE',
          message: 'No hay siguiente etapa para esta orden'
        };
      }

      // Actualizar orden en el mock
      this.mockOrders[orderIndex] = {
        ...order,
        estado: nextState,
        fecha_ultima_actualizacion: new Date().toISOString()
      };

      // Respuesta del backend
      const response = {
        success: true,
        data: {
          id_op: order.id_op,
          codigo: order.codigo,
          estado_anterior: payload.estado_actual,
          estado_nuevo: nextState,
          fecha_actualizacion: new Date().toISOString(),
          usuario_operario: payload.usuario_operario
        },
        message: `Etapa ${payload.estado_actual} completada. Orden avanzada a ${nextState}`
      };

      console.log('✅ Etapa completada:', response);
      return response;

    } catch (error) {
      return {
        success: false,
        error: 'COMPLETE_STAGE_ERROR',
        message: 'Error al completar la etapa'
      };
    }
  }

  // Obtener información de la etapa actual para un rol
  static getStageInfo(role) {
    const stageInfo = {
      'operario_lavado': {
        title: 'Lavado y Desinfección',
        description: 'Lavar y desinfectar la materia prima',
        icon: 'fas fa-tint',
        color: '#17a2b8',
        nextStage: 'Clasificación'
      },
      'operario_clasificacion': {
        title: 'Clasificación y Selección',
        description: 'Clasificar y seleccionar manualmente los productos',
        icon: 'fas fa-search',
        color: '#28a745',
        nextStage: 'Pelado'
      },
      'pelado_trozado': {
        title: 'Pelado y Trozado',
        description: 'Pelar y realizar corte controlado',
        icon: 'fas fa-cut',
        color: '#ffc107',
        nextStage: 'Escurrido'
      },
      'operario_escurrido': {
        title: 'Escurrido y Preenfriamiento',
        description: 'Eliminar excesos de agua y preenfriar',
        icon: 'fas fa-snowflake',
        color: '#6f42c1',
        nextStage: 'Congelación'
      },
      'operario_congelacion': {
        title: 'Congelación Rápida',
        description: 'Proceso crítico de congelación IQF',
        icon: 'fas fa-thermometer-empty',
        color: '#dc3545',
        nextStage: 'Empaquetado'
      },
      'operario_empaquetado': {
        title: 'Empaquetado Final',
        description: 'Empaquetado y preparación para distribución',
        icon: 'fas fa-box',
        color: '#fd7e14',
        nextStage: 'Terminado'
      }
    };
    
    return stageInfo[role] || null;
  }

  
}

export default WorkflowService;