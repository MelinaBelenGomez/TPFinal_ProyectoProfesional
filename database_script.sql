-- Tabla para resumen de desperdicios por orden de producción
CREATE TABLE resumen_desperdicio (
    id SERIAL PRIMARY KEY,
    id_op INT NOT NULL REFERENCES orden_produccion(id_op),
    motivo_principal VARCHAR(50) NOT NULL,
    sku_mayor_desperdicio VARCHAR(50) NOT NULL REFERENCES producto(sku),
    gramos_desperdiciados INT NOT NULL DEFAULT 0,
    UNIQUE(id_op)
);