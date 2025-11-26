import { useState, useEffect } from "react";
import ProductionServiceAxios from "../services/productionServiceAxios";
import * as XLSX from "xlsx";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

const Traceability = () => {
  const [mostrarLeyenda, setMostrarLeyenda] = useState(false);
  const [movimientos, setMovimientos] = useState([]);
  const [materialAsignado, setMaterialAsignado] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    sku: "",
    ordenProduccion: "",
    tipoMovimiento: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  useEffect(() => {
    loadTraceabilityData();
  }, []);

  const loadTraceabilityData = async () => {
    setLoading(true);
    try {
      const mov = await ProductionServiceAxios.getStockMovements();
      const mat = await ProductionServiceAxios.getAssignedMaterials();

      setMovimientos(mov.data || []);
      setMaterialAsignado(mat.data || []);
    } catch (error) {
      console.error("❌ Error cargando trazabilidad:", error);
    }
    setLoading(false);
  };

  // ======================================
  //  EXPORTAR EXCEL (solo movimientos)
  // ======================================
  const exportarMovimientos = () => {
    const wb = XLSX.utils.book_new();

    const wsMov = XLSX.utils.json_to_sheet(
      movimientosFiltrados.map((m) => ({
        Fecha: m.fecha,
        SKU: m.sku,
        Tipo: m.tipo_movimiento || m.tipoMovimiento || m.tipo,
        Cantidad: m.cantidad,
      }))
    );

    XLSX.utils.book_append_sheet(wb, wsMov, "Movimientos");

    XLSX.writeFile(wb, "movimientos_stock.xlsx");
  };

  // ======================================
  //  EXPORTAR EXCEL (solo materiales OP)
  // ======================================
  const exportarMateriales = () => {
    const wb = XLSX.utils.book_new();

    const wsMat = XLSX.utils.json_to_sheet(
      materialesFiltrados.map((m) => ({
        Fecha_Reserva: m.fechaReserva,
        OP: m.idOp,
        SKU: m.sku,
        Cantidad_Reservada: m.cantidadReservada,
      }))
    );

    XLSX.utils.book_append_sheet(wb, wsMat, "Materiales OP");

    XLSX.writeFile(wb, "materiales_op.xlsx");
  };
  
  // ======================================
  //              FILTROS
  // ======================================
  const movimientosFiltrados = movimientos.filter((m) => {
    const f = filtros;

    const cumpleSku =
      !f.sku || m.sku?.toLowerCase().includes(f.sku.toLowerCase());

    const cumpleOP =
      !f.ordenProduccion ||
      String(m.ordenProduccion || "")
        .toLowerCase()
        .includes(f.ordenProduccion.toLowerCase());

    const cumpleTipo =
      !f.tipoMovimiento ||
      m.tipo_movimiento?.toLowerCase() === f.tipoMovimiento.toLowerCase();

    const cumpleFechaDesde =
      !f.fechaDesde || new Date(m.fecha) >= new Date(f.fechaDesde);

    const cumpleFechaHasta =
      !f.fechaHasta || new Date(m.fecha) <= new Date(f.fechaHasta);

    return (
      cumpleSku &&
      cumpleOP &&
      cumpleTipo &&
      cumpleFechaDesde &&
      cumpleFechaHasta
    );
  });
  
  const materialesFiltrados = materialAsignado.filter((m) => {
    const f = filtros;

    const cumpleSku =
      !f.sku || m.sku?.toLowerCase().includes(f.sku.toLowerCase());

    const cumpleOP =
      !f.ordenProduccion ||
      String(m.idOp || "")
        .toLowerCase()
        .includes(f.ordenProduccion.toLowerCase());

    const fechaReserva = m.fechaReserva ? new Date(m.fechaReserva) : null;

    const cumpleFechaDesde =
      !f.fechaDesde ||
      (fechaReserva && fechaReserva >= new Date(f.fechaDesde));

    const cumpleFechaHasta =
      !f.fechaHasta ||
      (fechaReserva && fechaReserva <= new Date(f.fechaHasta));

    return cumpleSku && cumpleOP && cumpleFechaDesde && cumpleFechaHasta;
  });

  const limpiarFiltros = () => {
    setFiltros({
      sku: "",
      ordenProduccion: "",
      tipoMovimiento: "",
      fechaDesde: "",
      fechaHasta: "",
    });
  };
  // ======================================
//      DATOS PARA GRÁFICOS
// ======================================

// Movimientos por fecha
const movimientosPorFecha = Object.values(
  movimientosFiltrados.reduce((acc, m) => {
    const fecha = m.fecha;

    if (!acc[fecha]) {
      acc[fecha] = { fecha, ingreso: 0, liberacion: 0 };
    }

    const tipoReal = (m.tipo_movimiento || m.tipoMovimiento || m.tipo || "")
      .toString()
      .trim()
      .toUpperCase(); // 👈 clave

    if (tipoReal === "INGRESO") {
      acc[fecha].ingreso += Number(m.cantidad || 0);
    }

    if (tipoReal === "LIBERACION") {
      acc[fecha].liberacion += Number(m.cantidad || 0);
    }

    return acc;
  }, {})
);



// ================================
//   DATOS PARA GRÁFICO TORTA (OP)
// ================================
const materialesPorOP = Object.entries(
  materialesFiltrados.reduce((acc, m) => {
    acc[m.sku] = (acc[m.sku] || 0) + m.cantidadReservada;
    return acc;
  }, {})
).map(([sku, cantidad]) => ({
  name: sku,
  value: cantidad
}));

// Generador de color aleatorio
const generarColor = () =>
  "#" + Math.floor(Math.random() * 16777215).toString(16);

// Colores dinámicos (uno por material)
const coloresTorta = materialesPorOP.map(() => generarColor());


// Materiales más movidos ✅ ARREGLADO
const materialesMasMovidos = Object.entries(
  movimientosFiltrados.reduce((acc, m) => {
    acc[m.sku] = (acc[m.sku] || 0) + m.cantidad;
    return acc;
  }, {})
)
  .map(([key, value]) => ({ sku: key, cantidad: value }))
  .sort((a, b) => b.cantidad - a.cantidad)
  .slice(0, 5);

  // ======================================
  //                RENDER
  // ======================================
  return (
    <div className="traceability-container">
      <div className="header">
        <h2>📌 Trazabilidad</h2>
        <p>Consulta de movimientos de stock y materiales asignados</p>
      </div>

      {/* FILTROS */}
      <div className="card" style={{ marginTop: "10px", padding: "20px", background: "#f8f9fa" }}>
        <h3>🔍 Filtros</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            marginTop: "15px",
          }}
        >
          <div>
            <label>SKU</label>
            <input
              type="text"
              value={filtros.sku}
              onChange={(e) =>
                setFiltros({ ...filtros, sku: e.target.value })
              }
              placeholder="Ej: FRUTILLA1"
            />
          </div>

          <div>
            <label>Orden de Producción (OP)</label>
            <input
              type="text"
              value={filtros.ordenProduccion}
              onChange={(e) =>
                setFiltros({ ...filtros, ordenProduccion: e.target.value })
              }
              placeholder="Ej: 2"
            />
          </div>

          <div>
            <label>Tipo de Movimiento</label>
            <select
              value={filtros.tipoMovimiento}
              onChange={(e) =>
                setFiltros({ ...filtros, tipoMovimiento: e.target.value })
              }
            >
              <option value="">Todos</option>
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
              <option value="ajuste">Ajuste</option>
            </select>
          </div>

          <div>
            <label>Fecha Desde</label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) =>
                setFiltros({ ...filtros, fechaDesde: e.target.value })
              }
            />
          </div>

          <div>
            <label>Fecha Hasta</label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) =>
                setFiltros({ ...filtros, fechaHasta: e.target.value })
              }
            />
          </div>
        </div>

        <button
          onClick={limpiarFiltros}
          style={{
            marginTop: "15px",
            padding: "8px 15px",
            background: "#6c757d",
            color: "white",
            borderRadius: "5px",
            border: "none",
          }}
        >
          🧹 Limpiar filtros
        </button>
      </div>
          <div className="card" style={{ marginTop: "25px" }}>
  <h3>📊 Estadísticas de Stock</h3>

  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "30px",
    marginTop: "20px"
  }}>

    {/* INGRESOS VS EGRESOS */}
    <div>
      <h4>Ingresos vs Egresos</h4>
<LineChart width={320} height={250} data={movimientosPorFecha}>
  <XAxis dataKey="fecha" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="ingreso" name="Ingreso" />
  <Line type="monotone" dataKey="liberacion" name="Liberación" />
</LineChart>

    </div>

    {/* grafico torta */}
  <div>
  <h4>Materiales más usados en OP</h4>

<button
  onClick={() => setMostrarLeyenda(!mostrarLeyenda)}
  style={{
    marginBottom: "10px",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    background: "#6c757d",
    color: "white",
    cursor: "pointer"
  }}
>
  {mostrarLeyenda ? "Ocultar" : "Mostrar"} leyenda
</button>
  {mostrarLeyenda && (
  <div style={{ marginTop: "10px" }}>
    {materialesPorOP.map((m, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
        <div style={{
          width: "14px",
          height: "14px",
          backgroundColor: coloresTorta[i],
          borderRadius: "4px"
        }} />
        <span>{m.name}</span>
      </div>
    ))}
  </div>
)}


<PieChart width={320} height={250}>
  <Pie
    data={materialesPorOP}
    dataKey="value"
    nameKey="name"
    cx="50%"
    cy="50%"
    outerRadius={90}
  >
    {materialesPorOP.map((entry, index) => (
      <Cell key={index} fill={coloresTorta[index]} />
    ))}
  </Pie>

  <Tooltip />
</PieChart>

</div>

    {/* MATERIALES MÁS MOVIDOS */}
    <div>
      <h4>Materiales Más Movidos</h4>
      <BarChart width={320} height={250} data={materialesMasMovidos}>
        <XAxis dataKey="sku" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="cantidad" fill="#007bff" />
      </BarChart>
    </div>

  </div>
</div>

      {/* TABLA MOVIMIENTOS */}
      <div className="card" style={{ marginTop: "25px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
            alignItems: "center",
          }}
        >
          <h3>📦 Movimientos de Stock ({movimientosFiltrados.length})</h3>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={loadTraceabilityData}
              style={{
                padding: "8px 15px",
                background: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "5px",
              }}
            >
              🔄 Recargar
            </button>

            <button
              onClick={exportarMovimientos}
              style={{
                padding: "8px 15px",
                background: "#28a745",
                color: "white",
                borderRadius: "5px",
                border: "none",
              }}
            >
              📄 Excel
            </button>
          </div>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : movimientosFiltrados.length === 0 ? (
          <p>No hay movimientos para mostrar</p>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>SKU</th>
                <th>Tipo</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {movimientosFiltrados.map((m, i) => (
                <tr key={i}>
                  <td>{m.fecha}</td>
                  <td>{m.sku}</td>
                  <td>{m.tipo_movimiento || m.tipoMovimiento || m.tipo}</td>
                  <td>{m.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* TABLA MATERIAL ASIGNADO */}
      <div className="card" style={{ marginTop: "25px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
            alignItems: "center",
          }}
        >
          <h3>🧱 Material Asignado a OP ({materialesFiltrados.length})</h3>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={loadTraceabilityData}
              style={{
                padding: "8px 15px",
                background: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "5px",
              }}
            >
              🔄 Recargar
            </button>

            <button
              onClick={exportarMateriales}
              style={{
                padding: "8px 15px",
                background: "#28a745",
                color: "white",
                borderRadius: "5px",
                border: "none",
              }}
            >
              📄 Excel
            </button>
          </div>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : materialesFiltrados.length === 0 ? (
          <p>No hay materiales asignados para mostrar</p>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha Reserva</th>
                <th>OP</th>
                <th>SKU</th>
                <th>Cantidad Reservada</th>
              </tr>
            </thead>
            <tbody>
              {materialesFiltrados.map((m, i) => (
                <tr key={i}>
                  <td>{m.fechaReserva}</td>
                  <td>{m.idOp}</td>
                  <td>{m.sku}</td>
                  <td>{m.cantidadReservada}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Traceability;
