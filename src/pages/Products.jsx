import { useState, useEffect } from "react";

const ProductCreate = () => {
  // --- Estados para los campos del formulario ---
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("");
  const [vidaUtil, setVidaUtil] = useState("");

  // --- Estado para la lista de productos cargados ---
  const [productos, setProductos] = useState([]);

  // --- Estado para saber si estamos editando un producto ---
  const [editIndex, setEditIndex] = useState(null);

  // 🔽🔽🔽 HASTA QUE SE INTEGRE CON LA BASE DE DATOS 🔽🔽🔽
  // --- Persistencia local con localStorage ---
  useEffect(() => {
    const productosGuardados = localStorage.getItem("productos");
    if (productosGuardados) {
      setProductos(JSON.parse(productosGuardados));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("productos", JSON.stringify(productos));
  }, [productos]);
  // 🔼🔼🔼 FIN DE LA SECCIÓN TEMPORAL (localStorage) 🔼🔼🔼

  // --- Función para generar un SKU (ID) automático ---
  const generarSKU = () => {
    const random = Math.floor(Math.random() * 900) + 100;
    return `PRD-${random}`;
  };

  // --- Función para calcular fecha de vencimiento ---
  const calcularVencimiento = (dias) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + parseInt(dias));
    return fecha.toLocaleDateString("es-ES");
  };

  // --- Función que se ejecuta al enviar el formulario ---
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre || !descripcion || !unidadMedida || !vidaUtil) {
      alert("Por favor completa todos los campos");
      return;
    }

    if (editIndex !== null) {
      // Si estamos editando, modificamos el producto existente
      const productosActualizados = [...productos];
      productosActualizados[editIndex] = {
        ...productosActualizados[editIndex],
        nombre,
        descripcion,
        unidadMedida,
        vidaUtil,
        fechaVencimiento: calcularVencimiento(vidaUtil),
      };
      setProductos(productosActualizados);
      setEditIndex(null);
    } else {
      // Si no estamos editando, creamos un producto nuevo
      const nuevoProducto = {
        sku: generarSKU(),
        nombre,
        descripcion,
        unidadMedida,
        vidaUtil,
        fechaIngreso: new Date().toLocaleDateString("es-ES"),
        fechaVencimiento: calcularVencimiento(vidaUtil),
      };
      setProductos([...productos, nuevoProducto]);
    }

    limpiarFormulario();
  };

  // --- Función para limpiar los campos del formulario ---
  const limpiarFormulario = () => {
    setNombre("");
    setDescripcion("");
    setUnidadMedida("");
    setVidaUtil("");
    setEditIndex(null);
  };

  // --- Función para eliminar un producto ---
  const eliminarProducto = (index) => {
    const confirmacion = window.confirm("¿Seguro que deseas eliminar este producto?");
    if (confirmacion) {
      const productosFiltrados = productos.filter((_, i) => i !== index);
      setProductos(productosFiltrados);
    }
  };

  // --- Función para editar un producto existente ---
  const editarProducto = (index) => {
    const producto = productos[index];
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion);
    setUnidadMedida(producto.unidadMedida);
    setVidaUtil(producto.vidaUtil);
    setEditIndex(index);
  };

  return (
    <div className="product-create-container">
      <div className="header">
        <h2>Gestión de Productos</h2>
        <p>Crear, editar o eliminar productos del sistema</p>
      </div>

      {/* --- FORMULARIO --- */}
      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre del producto</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Mix de berries"
          />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Mezcla de frutillas, frambuesas y arándanos"
          ></textarea>
        </div>

        <div className="form-group">
          <label>Unidad de medida</label>
          <select
            value={unidadMedida}
            onChange={(e) => setUnidadMedida(e.target.value)}
          >
            <option value="">-- Seleccionar unidad de medida --</option>
            <option value="gramos">Gramos (g)</option>
            <option value="kilogramos">Kilogramos (kg)</option>
            <option value="litros">Litros (L)</option>
            <option value="muestra">Muestra (m)</option>
            <option value="caja">Caja</option>
          </select>
        </div>

        <div className="form-group">
          <label>Vida útil (días)</label>
          <input
            type="number"
            min="1"
            value={vidaUtil}
            onChange={(e) => setVidaUtil(e.target.value)}
            placeholder="Ej: 180"
          />
        </div>

        <button type="submit" className="btn-crear">
          {editIndex !== null ? "Guardar Cambios" : "Crear Producto"}
        </button>

        {editIndex !== null && (
          <button
            type="button"
            className="btn-cancelar"
            onClick={limpiarFormulario}
            style={{ marginLeft: "10px" }}
          >
            Cancelar
          </button>
        )}
      </form>

      {/* --- LISTA DE PRODUCTOS CREADOS --- */}
      {productos.length > 0 && (
        <div className="products-list card">
          <h3>Productos Creados</h3>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Vida útil (días)</th>
                <th>Ingreso</th>
                <th>Vencimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p, index) => (
                <tr key={index}>
                  <td>{p.sku}</td>
                  <td>{p.nombre}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.unidadMedida}</td>
                  <td>{p.vidaUtil}</td>
                  <td>{p.fechaIngreso}</td>
                  <td>{p.fechaVencimiento}</td>
                  <td>
                    <button onClick={() => editarProducto(index)}>✏️ Editar</button>
                    <br />
                    <button onClick={() => eliminarProducto(index)}>🗑️ Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductCreate;
