import { useFetchInventario } from "../Hooks/useFetchInventario";
import { useEffect, useState } from "react";
import { useAuth } from "../../constants/AuthContext";
import { supabase } from "../Functions/CreateClient";

export const NuevaVentaForm = ({
  visita,
  onSaveVenta,
  actualizarEstadoVisita,
  handleCancelar
}) => {
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [productoFiltrado, setProductoFiltrado] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [totalVenta, setTotalVenta] = useState(0); // Nuevo campo para el total de la venta
  const { session } = useAuth();
  const [asesorNombre, setAsesorNombre] = useState("");
  const [distribuidor, setDistribuidor] = useState("");

  useFetchInventario(setInventario);

  const fetchAsesorName = async () => {
    if (session) {
      const { data, error } = await supabase
        .from("profiles")
        .select("nombre")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error obteniendo el nombre del asesor:", error);
      } else {
        setAsesorNombre(data.nombre);
      }
    }
  };

  const fetchDistribucion = async () => {
    if (session) {
      const { data, error } = await supabase
        .from("profiles")
        .select("distribuidor")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error obteniendo la distribucion del asesor:", error);
      } else {
        setDistribuidor(data.distribuidor);
      }
    }
  };

  useEffect(() => {
    fetchAsesorName();
  }, [session]);

  useEffect(() => {
    fetchDistribucion();
  }, [session]);

  const handleBusquedaChange = (e) => {
    const value = e.target.value;
    setBusqueda(value);

    // Filtrar productos basados en la búsqueda
    if (value) {
      const filtrado = inventario.filter((producto) =>
        producto.descripcion.toLowerCase().includes(value.toLowerCase())
      );
      setProductoFiltrado(filtrado);
    } else {
      setProductoFiltrado([]);
    }
  };

  //Seleccionar productos
  const handleSeleccionProducto = (producto) => {
    setProductosSeleccionados([
      ...productosSeleccionados,
      producto.descripcion, // Cambiado de { nombre: producto.descripcion }
    ]);
    setBusqueda(""); // Limpiar la búsqueda
    setProductoFiltrado([]); // Limpiar las sugerencias
  };

  //Eliminar Productos
  const handleEliminarProducto = (index) => {
    const productosActualizados = productosSeleccionados.filter(
      (_, i) => i !== index
    );
    setProductosSeleccionados(productosActualizados);
  };




  //Guardar la venta
  const handleSubmit = (e) => {
    e.preventDefault();

    const ventaData = {
      codigo_visita: visita.id,
      nombre_cliente: visita.nombre,
      productos: productosSeleccionados,
      total: totalVenta, // Total de la venta
      asesor: asesorNombre,
      distribuidor: distribuidor,
    };

    // Guardar la venta
    onSaveVenta(ventaData);
    
    // Actualizar el estado de la visita a "realizada"
    actualizarEstadoVisita(visita)
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Registrar Venta</h2>
      <label htmlFor="">Agregar productos</label>
      {/* Input para buscar productos */}
      <input
        type="text"
        value={busqueda}
        onChange={handleBusquedaChange}
        placeholder="Buscar producto"
        className="border p-2 rounded w-full mb-2"
      />

      {/* Mostrar productos filtrados como sugerencias */}
      {productoFiltrado.length > 0 && (
        <ul className="border p-2 rounded bg-white shadow-md">
          {productoFiltrado.map((producto, index) => (
            <li
              key={index}
              onClick={() => handleSeleccionProducto(producto)}
              className="cursor-pointer p-1 hover:bg-gray-200"
            >
              {producto.descripcion}
            </li>
          ))}
        </ul>
      )}

      {/* Mostrar los productos seleccionados */}

      {productosSeleccionados.map((productoNombre, index) => (
        <div key={index} className="flex items-center justify-between mb-2">
          <span>{productoNombre}</span>
          <button
            type="button"
            onClick={() => handleEliminarProducto(index)}
            className="text-red-500"
          >
            X
          </button>
        </div>
      ))}
      {/* Input para el total de la venta */}
      <label htmlFor="">Valor Neto Venta</label>
      <input
        type="number"
        value={totalVenta}
        onChange={(e) => setTotalVenta(e.target.value)}
        placeholder="Total de la venta"
        className="border p-2 rounded w-full mb-4"
      />

<div className="" >
<button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded mt-4"
      >
        Guardar Venta
      </button>
      <button
  onClick={handleCancelar}
className="bg-red-500 text-white px-4 py-2 rounded mt-4"
      >
         Cancelar
      </button>
</div>
  
    </form>
  );
};
