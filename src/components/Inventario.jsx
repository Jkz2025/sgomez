import { useState, useEffect } from "react";
import { useFetchInventario } from "./Hooks/useFetchInventario";

const Inventario = () => {
  const [inventario, setInventario] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  useFetchInventario(setInventario);

  useEffect(() => {
    filtrarInventario();
  }, [busqueda, categoria, inventario]);

  const handleBusqueda = (e) => {
    setBusqueda(e.target.value);
  };

  const handleCategoria = (e) => {
    setCategoria(e.target.value);
  };

  const filtrarInventario = () => {
    const filtrados = inventario.filter((prod) => {
      const matchesBusqueda =
        prod.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        prod.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        prod.nombre.toLowerCase().includes(busqueda.toLowerCase());

      const matchesCategoria =
        categoria === "Todas" || prod.categoria === categoria;

      return matchesBusqueda && matchesCategoria;
    });
    setProductosFiltrados(filtrados);
  };

  // Obtener todas las categorías únicas
  const categorias = [
    "Todas",
    ...new Set(inventario.map((prod) => prod.categoria)),
  ];

  return (
    <div className="p-4 mt-20">
      <h1 className="text-2xl font-bold mb-4">Inventario</h1>
      <div className="flex flex-col md:flex-row mb-4 gap-2">
        <select
          value={categoria}
          onChange={handleCategoria}
          className="p-2 border border-gray-300 rounded-md w-full md:w-1/3"
        >
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productosFiltrados.map((producto) => (
              <tr key={producto.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {producto.descripcion}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${producto.precio_venta.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {producto.codigo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventario;
