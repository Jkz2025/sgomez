import { useFetchVisitas } from "./useFetchVisitas";
import { useState, useEffect } from "react";
import { supabase } from "../Functions/CreateClient";
import Swal from "sweetalert2";
// Import SweetAlert2 differently

const DashboardAsesor = () => {
  const [statsHoy, setStatsHoy] = useState({
    realizadas: 0,
    pendientes: 0,
    reprogramadas: 0,
  });
  const {
    visitas,
    loading,
    startDate,
    endDate,
    setStartDate,
    setVisitas,
    setEndDate,
  } = useFetchVisitas();

  useEffect(() => {
    fetchTodayStats();
  }, []);

  const fetchTodayStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = user?.id;
      if (!userId) throw new Error("No se encontró ID de usuario");

      const fetchCount = async (estado) => {
        const { data, error } = await supabase
          .from("visitas")
          .select("count")
          .eq("estado", estado)
          .eq("fecha", today)
          .eq("asesor", userId);
        
        if (error) throw error;
        return data?.[0]?.count || 0;
      };

      const [realizadas, pendientes, reprogramadas] = await Promise.all([
        fetchCount("realizada"),
        fetchCount("pendiente"),
        fetchCount("reprogramar")
      ]);

      setStatsHoy({
        realizadas,
        pendientes,
        reprogramadas
      });

    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      Swal.fire("Error", "No se pudieron cargar las estadísticas", "error");
    }
  };

  const handleRealizarVisita = async (visita) => {
    try {
      const willProceed = await Swal.fire({
        title: "Confirmar",
        text: "¿Está seguro que desea marcar la visita como realizada?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No"
      });

      if (!willProceed.isConfirmed) return;

      const observacionInput = await Swal.fire({
        title: "Observación",
        text: "Ingrese los detalles de la visita",
        input: "textarea",
        showCancelButton: true,
        inputValidator: (value) => !value && "Por favor ingrese una observación"
      });

      if (!observacionInput.isConfirmed) return;
      const detalles = observacionInput.value;

      const huboVenta = await Swal.fire({
        title: "Venta",
        text: "¿Hubo venta en esta visita?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No"
      });

      let valorVenta = null;
      if (huboVenta.isConfirmed) {
        const valorInput = await Swal.fire({
          title: "Valor",
          text: "Ingrese el valor de la venta",
          input: "number",
          inputValidator: (value) => !value && "Por favor ingrese un valor"
        });

        if (valorInput.isConfirmed) {
          valorVenta = parseFloat(valorInput.value);
        }
      }

      // Actualizar en Supabase
      const { error } = await supabase
        .from("visitas")
        .update({
          estado: "realizada",
          detalles_visita: detalles,
          valor_venta: valorVenta,
          fecha_realizacion: new Date().toISOString()
        })
        .eq("id", visita.id);

      if (error) throw error;

      // Actualizar el estado local inmediatamente
      setVisitas(prevVisitas => prevVisitas.filter(v => v.id !== visita.id));
      
      // Actualizar estadísticas
      setStatsHoy(prev => ({
        ...prev,
        realizadas: prev.realizadas + 1,
        pendientes: prev.pendientes - 1
      }));

      await Swal.fire({
        title: "Éxito",
        text: "Visita marcada como realizada",
        icon: "success"
      });

    } catch (error) {
      console.error("Error al realizar la visita:", error);
      await Swal.fire({
        title: "Error",
        text: "No se pudo actualizar la visita",
        icon: "error"
      });
    }
  };

  const handleReprogramarVisita = async (visita) => {
    try {
      const willReprogam = await Swal.fire({
        title: "Confirmar",
        text: "¿Está seguro que desea reprogramar la visita?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No"
      });

      if (!willReprogam.isConfirmed) return;

      const motivoInput = await Swal.fire({
        title: "Motivo",
        text: "¿Por qué se reprograma la visita?",
        input: "textarea",
        inputValidator: (value) => !value && "Por favor ingrese el motivo"
      });

      if (!motivoInput.isConfirmed) return;

      const { error } = await supabase
        .from("visitas")
        .update({
          estado: "reprogramada",
          detalles: motivoInput.value,
          fecha_reprogramacion: new Date().toISOString()
        })
        .eq("id", visita.id);

      if (error) throw error;

      // Actualizar el estado local inmediatamente
      setVisitas(prevVisitas => prevVisitas.filter(v => v.id !== visita.id));
      
      // Actualizar estadísticas
      setStatsHoy(prev => ({
        ...prev,
        reprogramadas: prev.reprogramadas + 1,
        pendientes: prev.pendientes - 1
      }));

      await Swal.fire({
        title: "Éxito",
        text: "Visita reprogramada correctamente",
        icon: "success"
      });

    } catch (error) {
      console.error("Error al reprogramar la visita:", error);
      await Swal.fire({
        title: "Error",
        text: "No se pudo reprogramar la visita",
        icon: "error"
      });
    }
  };


  return (
    <div className="p-4 mt-20">
      <h1 className="text-2xl font-bold mb-4">Dashboard Asesor</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h3 className="text-green-800 font-semibold">Visitas Realizadas</h3>
          <p className="text-2xl font-bold text-green-600">
            {statsHoy.realizadas}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow">
          <h3 className="text-yellow-800 font-semibold">Visitas Pendientes</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {statsHoy.pendientes}
          </p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg shadow">
          <h3 className="text-red-800 font-semibold">
            Visitas Reprogramadas
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {statsHoy.reprogramadas}
          </p>
        </div>
      </div>

      {/* Visits List */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">Visitas Pendientes</h2>

        <div className="flex space-x-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha inicial:
            </label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha final:
            </label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p>Cargando visitas...</p>
        ) : visitas.length > 0 ? (
          <ul className="space-y-2">
            {visitas.map((visita) => (
              <li key={visita.id} className="border-b pb-2">
                <p className="font-semibold">{visita.cliente}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Cliente: </span> {visita.nombre}
                  <span className="font-bold ml-2">Ciudad: </span> {visita.ciudad}
                  <span className="font-bold ml-2">Barrio: </span> {visita.barrio}
                  <span className="font-bold ml-2">Direccion: </span> {visita.direccion}
                  <span className="font-bold ml-2 text-green-500">Hora: </span> {visita.hora}
                  <span className="font-bold ml-2">Referido de: </span> {visita.referido}
                </p>
                <div className="py-2 flex justify-between">
                  <button
                    className="bg-green-400 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-500 transition duration-300 ease-in-out"
                    onClick={() => handleRealizarVisita(visita)}
                  >
                    Realizar
                  </button>
                  <button
                    className="bg-yellow-400 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-yellow-500 transition duration-300 ease-in-out"
                    onClick={() => handleReprogramarVisita(visita)}
                  >
                    Reprogramar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay visitas pendientes para este período.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardAsesor;