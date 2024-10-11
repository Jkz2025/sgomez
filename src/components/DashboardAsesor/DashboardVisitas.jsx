import React, { useEffect, useState } from "react";
import { supabase } from "../Functions/CreateClient";
import { useFetchVisitas } from "../Hooks/useFetchVisitas";
import { NuevaVentaForm } from "./NuevaVenta";
import { CuatroCatorceForm } from "./CuatroCatorceForm";

export const DashboardVisitas = () => {
  const [visitas, setVisitas] = useState([]);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showNuevaVentaForm, setShowNuevaVentaForm] = useState(false);
  const [showForm414, setShowForm414] = useState(false);

  useFetchVisitas(setVisitas);

  useEffect(() => {
    const loadVisitas = async () => {
      const { data, error } = await supabase
        .from("visitas")
        .select("*")
        .gte("fecha", `${filterYear}-${filterMonth + 1}-01`)
        .lt("fecha", `${filterYear}-${filterMonth + 1}-01`);
      if (error) console.error("Error al cargar visitas:", error);
      else setVisitas(data);
    };
    loadVisitas();
  }, [filterMonth, filterYear]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "month") setFilterMonth(value);
    if (name === "year") setFilterYear(value);
  };

  const handleVisitAction = async (visita, action) => {
    if (action === "complete") {
      if (window.confirm("¿Está seguro que desea marcar la visita como realizada?")) {
        const ventaConfirm = window.confirm("¿Se realizó una venta en la visita?");
        if (ventaConfirm) {
          await supabase
          .from('visitas')
          .update ({estado: 'realizada'})
          .eq('id', visita.id)
          setSelectedVisit(visita);
          setShowNuevaVentaForm(true);
        }
      }
    } else if (action === "reprogramar") {
      if (window.confirm("¿Está seguro que desea reprogramar esta visita?")) {
        await supabase
          .from("visitas")
          .update({ estado: "reprogramar" })
          .eq("id", visita.id);
        const updatedVisitas = visitas.map((v) =>
          v.id === visita.id ? { ...v, estado: "reprogramar" } : v
        );
        setVisitas(updatedVisitas);
      }
    }
  };

  const handleCancelar = (e) => {
    e.preventDefault();
    setShowNuevaVentaForm(false);
  };

  const handleSaveSales = async (ventaData) => {
    const { data, error } = await supabase.from("ventas").insert([ventaData]);
    if (error) console.error("Error al guardar la venta:", error);
    else setShowForm414(true);
  };

  const actualizarEstadoVisita = async (visita) => {
    const { error } = await supabase
      .from("visitas")
      .update({ estado: "realizada" })
      .eq("id", visita.id);

    if (error) {
      console.error("Error actualizando el estado de la visita", error);
    } else {
      setVisitas((prevVisitas) =>
        prevVisitas.map((v) =>
          v.id === visita.id ? { ...v, estado: "realizada" } : v
        )
      );
    }
  };

  return (
    <div className="p-4 max-w-full overflow-x-hidden">
      <div className="overflow-x-auto">
      <h1 className="text-2xl font-bold mb-4">Gestión de Visitas</h1>

      {/* Filtros del mes */}
      <div className="flex space-x-4 mb-4">
        <select
          name="month"
          value={filterMonth}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option value={i} key={i}>
              {new Date(0, i).toLocaleDateString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="year"
          value={filterYear}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />
      </div>

      {/* Tabla de visitas */}
      <div className="overflow-x-auto">
  <table className="min-w-full table-auto">
    <thead>
      <tr>
        <th className="border px-2 py-1 md:px-4 md:py-2">Hora</th>
        <th className="border px-2 py-1 md:px-4 md:py-2">Cliente</th>
        <th className="border px-2 py-1 md:px-4 md:py-2">Dirección</th>
        <th className="border px-2 py-1 md:px-4 md:py-2">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {visitas.map((visita) => (
        <tr key={visita.id}>
          <td className="border px-2 py-1 md:px-4 md:py-2">{visita.hora}</td>
          <td className="border px-2 py-1 md:px-4 md:py-2">{visita.nombre}</td>
          <td className="border px-2 py-1 md:px-4 md:py-2">{visita.direccion}</td>
          <td className="border px-2 py-1 md:px-4 md:py-2">
            <button
              onClick={() => handleVisitAction(visita, "complete")}
              className="text-green-500 text-sm md:text-base"
            >
              Marcar Realizada
            </button>
            <button
              onClick={() => handleVisitAction(visita, "reprogramar")}
              className="text-yellow-500 text-sm md:text-base ml-2"
            >
              Reprogramar
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


      <div className="mt-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setShowNuevaVisitaForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Nueva Visita
          </button>
          <button
            onClick={() => setShowNuevaVentaForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Nueva Venta
          </button>
        </div>
      </div>

      {/* Formulario de venta */}
      {showNuevaVentaForm && (
        <NuevaVentaForm
          visita={selectedVisit}
          onSaveVenta={handleSaveSales}
          actualizarEstadoVisita={actualizarEstadoVisita}
          handleCancelar={handleCancelar}
        />
      )}

      {/* Formulario 4-14 */}
      {showForm414 && <CuatroCatorceForm />}
    </div>
    </div>
  );
};
