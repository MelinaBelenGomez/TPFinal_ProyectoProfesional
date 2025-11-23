import { useState, useEffect } from "react";
import ProductionServiceAxios from "../services/productionServiceAxios";

const Traceability = () => {

    // --- Datos desde backend ---
    const [movimientos, setMovimientos] = useState([]);       // movimientos de stock
    const [materialAsignado, setMaterialAsignado] = useState([]); // material asignado a OP
    const [loading, setLoading] = useState(false);

    // --- Estados para filtros ---
    const [filtros, setFiltros] = useState({
        sku: "",
        ordenProduccion: "",
        tipoMovimiento: "",
        fechaDesde: "",
        fechaHasta: "",
    });

    // ----------------------
    //    CARGA INICIAL
    // ----------------------
    useEffect(() => {
        loadTraceabilityData();
    }, []);

    const loadTraceabilityData = async () => {
        setLoading(true);
        try {
            const mov = await ProductionServiceAxios.getStockMovements(); // GET movimientos
            const mat = await ProductionServiceAxios.getAssignedMaterials(); // GET materiales OP
            setMovimientos(mov.data || []);
            setMaterialAsignado(mat.data || []);
        } catch (error) {
            console.error("❌ Error cargando trazabilidad:", error);
        }
        setLoading(false);
    };

    // ----------------------
    //     FILTRO UNIFICADO
    // ----------------------
    const movimientosFiltrados = movimientos.filter((m) => {
        const f = filtros;

        const cumpleSku =
            !f.sku || m.sku.toLowerCase().includes(f.sku.toLowerCase());

        const cumpleOP =
            !f.ordenProduccion ||
            String(m.ordenProduccion || "")
                .toLowerCase()
                .includes(f.ordenProduccion.toLowerCase());

        const cumpleTipo =
            !f.tipoMovimiento || m.tipo === f.tipoMovimiento;

        const cumpleFechaDesde =
            !f.fechaDesde || new Date(m.fecha) >= new Date(f.fechaDesde);

        const cumpleFechaHasta =
            !f.fechaHasta || new Date(m.fecha) <= new Date(f.fechaHasta);

        return cumpleSku && cumpleOP && cumpleTipo && cumpleFechaDesde && cumpleFechaHasta;
    });

    const materialesFiltrados = materialAsignado.filter((m) => {
        const f = filtros;

        const cumpleSku =
            !f.sku || m.skuMaterial.toLowerCase().includes(f.sku.toLowerCase());

        const cumpleOP =
            !f.ordenProduccion ||
            String(m.ordenProduccion)
                .toLowerCase()
                .includes(f.ordenProduccion.toLowerCase());

        const cumpleFechaDesde =
            !f.fechaDesde || new Date(m.fecha) >= new Date(f.fechaDesde);

        const cumpleFechaHasta =
            !f.fechaHasta || new Date(m.fecha) <= new Date(f.fechaHasta);

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

    // ----------------------
    //     RENDER
    // ----------------------
    return (
        <div className="traceability-container">

            <div className="header">
                <h2>📌 Trazabilidad</h2>
                <p>Consulta de movimientos de stock y materiales asignados</p>
            </div>

            {/* --- FILTROS --- */}
            <div
                className="card"
                style={{ marginTop: "10px", padding: "20px", background: "#f8f9fa" }}
            >
                <h3>🔍 Filtros</h3>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "15px",
                        marginTop: "15px",
                    }}
                >
                    {/* SKU */}
                    <div>
                        <label>SKU</label>
                        <input
                            type="text"
                            value={filtros.sku}
                            onChange={(e) =>
                                setFiltros({ ...filtros, sku: e.target.value })
                            }
                            placeholder="Ej: MP-FRUTILLA-001"
                        />
                    </div>

                    {/* Orden de producción */}
                    <div>
                        <label>Orden de Producción (OP)</label>
                        <input
                            type="text"
                            value={filtros.ordenProduccion}
                            onChange={(e) =>
                                setFiltros({ ...filtros, ordenProduccion: e.target.value })
                            }
                            placeholder="Ej: 1203"
                        />
                    </div>

                    {/* Tipo de movimiento */}
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

                    {/* Fecha desde */}
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

                    {/* Fecha hasta */}
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

            {/* ==============================
            TABLA DE MOVIMIENTOS
          ============================== */}
            <div className="card" style={{ marginTop: "25px" }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "15px",
                    }}
                >
                    <h3>📦 Movimientos de Stock ({movimientosFiltrados.length})</h3>
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
                                <th>Orden Prod.</th>
                                <th>Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimientosFiltrados.map((m, i) => (
                                <tr key={i}>
                                    <td>{m.fecha}</td>
                                    <td>{m.sku}</td>
                                    <td>{m.tipo}</td>
                                    <td>{m.cantidad}</td>
                                    <td>{m.ordenProduccion || "-"}</td>
                                    <td>{m.usuario || "N/A"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ==============================
            TABLA DE MATERIALES A OP
          ============================== */}
            <div className="card" style={{ marginTop: "25px" }}>
                <h3>🧱 Material Asignado a OP ({materialesFiltrados.length})</h3>

                {loading ? (
                    <p>Cargando...</p>
                ) : materialesFiltrados.length === 0 ? (
                    <p>No hay materiales asignados para mostrar</p>
                ) : (
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>OP</th>
                                <th>SKU Material</th>
                                <th>Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materialesFiltrados.map((m, i) => (
                                <tr key={i}>
                                    <td>{m.fecha}</td>
                                    <td>{m.ordenProduccion}</td>
                                    <td>{m.skuMaterial}</td>
                                    <td>{m.cantidad}</td>
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
