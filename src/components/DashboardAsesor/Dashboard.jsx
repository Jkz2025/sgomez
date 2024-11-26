import { useFetchVisitas } from "./useFetchVisitas";
import { useState, useEffect } from "react";
import { supabase } from "../Functions/CreateClient";
import Swal from "sweetalert2";
import { BarChart, ClipboardCheck, RefreshCcw } from "lucide-react";

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
  }, [startDate, endDate]);

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
          .gte("fecha", startDate)
          .lte("fecha", `${endDate} 23:59:59`)
          .eq("asesor", userId);

        if (error) throw error;
        return data?.[0]?.count || 0;
      };

      const [realizadas, pendientes, reprogramadas] = await Promise.all([
        fetchCount("realizada"),
        fetchCount("pendiente"),
        fetchCount("reprogramar"),
      ]);

      setStatsHoy({
        realizadas,
        pendientes,
        reprogramadas,
      });
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      Swal.fire("Error", "No se pudieron cargar las estadísticas", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 mt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">Dashboard Asesor</h1>
        <p className="text-center text-gray-400">Gestión de visitas en tiempo real</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-800 to-green-600 p-6 rounded-lg shadow-md flex items-center">
          <ClipboardCheck className="w-10 h-10 text-green-200 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Realizadas</h3>
            <p className="text-3xl font-bold">{statsHoy.realizadas}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-800 to-yellow-600 p-6 rounded-lg shadow-md flex items-center">
          <BarChart className="w-10 h-10 text-yellow-200 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Pendientes</h3>
            <p className="text-3xl font-bold">{statsHoy.pendientes}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-800 to-red-600 p-6 rounded-lg shadow-md flex items-center">
          <RefreshCcw className="w-10 h-10 text-red-200 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Reprogramadas</h3>
            <p className="text-3xl font-bold">{statsHoy.reprogramadas}</p>
          </div>
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Visitas Pendientes</h2>
        <div className="flex space-x-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Fecha Inicial</label>
            <input
              type="date"
              className="mt-1 bg-gray-900 text-gray-300 border border-gray-600 rounded-md p-2 w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Fecha Final</label>
            <input
              type="date"
              className="mt-1 bg-gray-900 text-gray-300 border border-gray-600 rounded-md p-2 w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <p className="text-gray-400">Cargando visitas...</p>
        ) : visitas.length > 0 ? (
          <ul className="space-y-4">
            {visitas.map((visita) => (
              <li key={visita.id} className="p-4 bg-gray-700 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{visita.cliente}</h3>
                  <p className="text-gray-400 text-sm">{visita.direccion}</p>
                </div>
                <div className="flex space-x-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2">
                    Realizar
                  </button>
                  <button className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg px-4 py-2">
                    Reprogramar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No hay visitas pendientes en este rango.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardAsesor;
