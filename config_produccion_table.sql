-- Crear tabla de configuración de producción
CREATE TABLE config_produccion (
    id SERIAL PRIMARY KEY,
    cantidad_base_orden INT NOT NULL DEFAULT 500,
    numero_lotes_fijo INT NOT NULL DEFAULT 10,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_por VARCHAR(50)
);

-- Insertar configuración por defecto
INSERT INTO config_produccion (cantidad_base_orden, numero_lotes_fijo, modificado_por) 
VALUES (500, 10, 'SISTEMA');