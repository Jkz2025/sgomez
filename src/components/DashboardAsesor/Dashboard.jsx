import { useFetchVisitas } from "./useFetchVisitas";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { supabase } from "../Functions/CreateClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../constants/AuthContext";

const DashboardAsesor = () => {
  const navigate = useNavigate();
  const [showNuevaVisitaForm, setShowNuevaVisitaForm] = useState(false);
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
  const { session } = useAuth();

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
      await Swal.fire({
        title: "Error",
        text: "No se pudieron cargar las estadísticas",
        icon: "error"
      });
    }
  };

  const handleRealizarVisita = async (visita) => {
    try {
      // Confirmar inicial
      const confirmResult = await Swal.fire({
        title: "¿Está seguro que desea marcar la visita como realizada?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No"
      });

      if (!confirmResult.isConfirmed) return;

      // Solicitar observaciones
      const observacionResult = await Swal.fire({
        title: "Observación de la visita",
        input: "textarea",
        inputLabel: "Detalles",
        inputPlaceholder: "Escriba los detalles de la visita...",
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) return "Por favor ingrese una observación";
          return null;
        }
      });

      if (!observacionResult.isConfirmed) return;
      const detalles = observacionResult.value;

      // Preguntar por venta
      const ventaResult = await Swal.fire({
        title: "¿Hubo venta?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No"
      });

      let valorVenta = null;
      if (ventaResult.isConfirmed) {
        const valorResult = await Swal.fire({
          title: "Valor de la venta",
          input: "number",
          inputLabel: "Por favor indique el valor de la venta",
          inputValidator: (value) => {
            if (!value || value <= 0) return "Por favor ingrese un valor válido";
            return null;
          }
        });
        if (!valorResult.isConfirmed) return;
        valorVenta = parseFloat(valorResult.value);
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

      await Swal.fire({
        title: "Éxito",
        text: "La visita ha sido marcada como realizada",
        icon: "success"
      });
      
      setVisitas(prev => prev.filter(v => v.id !== visita.id));
      await fetchTodayStats();

    } catch (error) {
      console.error("Error al realizar la visita:", error);
      await Swal.fire({
        title: "Error",
        text: "Hubo un problema al actualizar la visita",
        icon: "error"
      });
    }
  };

  const handleReprogramarVisita = async (visita) => {
    try {
      const confirmResult = await Swal.fire({
        title: "¿Está seguro que desea reprogramar la visita?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No"
      });

      if (!confirmResult.isConfirmed) return;

      const motivoResult = await Swal.fire({
        title: "¿Por qué se reprogramó la visita?",
        input: "textarea",
        inputLabel: "Detalles",
        inputPlaceholder: "Escriba el motivo de la reprogramación...",
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) return "Por favor ingrese el motivo";
          return null;
        }
      });

      if (!motivoResult.isConfirmed) return;

      const { error } = await supabase
        .from("visitas")
        .update({
          estado: "reprogramada",
          detalles: motivoResult.value,
          fecha_reprogramacion: new Date().toISOString()
        })
        .eq("id", visita.id);

      if (error) throw error;

      await Swal.fire({
        title: "Éxito",
        text: "La visita ha sido reprogramada",
        icon: "success"
      });
      
      setVisitas(prev => prev.filter(v => v.id !== visita.id));
      await fetchTodayStats();

    } catch (error) {
      console.error("Error al reprogramar la visita:", error);
      await Swal.fire({
        title: "Error",
        text: "Hubo un problema al reprogramar la visita",
        icon: "error"
      });
    }
  };

  return (
    <div className="p-4 mt-20">
      <h1 className="text-2xl font-bold mb-4">Dashboard Asesor</h1>

      {/* Estadísticas diarias */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h3 className="text-green-800 font-semibold">Visitas Realizadas</h3>
          <p className="text-2xl font-bold text-green-600">
            {statsHoy.realizadas}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow">
          <h3 className="text-yellow-500 font-semibold">Visitas Pendientes</h3>
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
                  <span className="font-bold"> Cliente: </span> {visita.nombre}
                  <span className="font-bold"> Ciudad: </span> {visita.ciudad}
                  <span className="font-bold"> Barrio: </span> {visita.barrio}
                  <span className="font-bold"> Direccion: </span> {visita.direccion}
                  <span className="font-bold text-green-500"> Hora: </span> {visita.hora}
                  <span className="font-bold"> Referido de: </span> {visita.referido}
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