import { useFetchVisitas } from "./useFetchVisitas";
import { useState, useEffect } from "react";
import { supabase } from "../Functions/CreateClient";
import Swal from "sweetalert2";
import { BarChart, ClipboardCheck, RefreshCcw } from "lucide-react";

const DashboardAsesor = () => {
  const [statsHoy, setStatsHoy] = useState({
    realizadas: 0,
    pendiente: 0,
    reprogramadas: 0,
  });

  const {
    visitas,
    setVisitas,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
  } = useFetchVisitas();

  useEffect(() => {
    fetchVisitas();
    fetchTodayStats();
  }, [startDate, endDate]);

  // Función para cargar visitas
  const fetchVisitas = async () => {
    try {
      const { data, error } = await supabase
        .from("visitas")
        .select("*")
        .eq("pendiente")
        .gte("fecha", `${startDate} 00:00:00`)
        .lte("fecha", `${endDate} 23:59:59`);

      if (error) throw error;

      setVisitas(data);
    } catch (error) {
      console.error("Error al cargar visitas:", error);
      Swal.fire("Error", "No se pudieron cargar las visitas", "error");
    }
  };

  // Estadísticas de visitas
  const fetchTodayStats = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = user?.id;
      if (!userId) throw new Error("No se encontró ID de usuario");

      const fetchCount = async (estado) => {
        const { data, error } = await supabase
          .from("visitas")
          .select("id", { count: "exact" })
          .eq("estado", estado)
          .gte("fecha", `${startDate} 00:00:00`)
          .lte("fecha", `${endDate} 23:59:59`)
          .eq("asesor", userId);

        if (error) throw error;
        return data.length;
      };

      const [realizadas, pendiente, reprogramadas] = await Promise.all([
        fetchCount("realizada"),
        fetchCount("pendiente"),
        fetchCount("reprogramada"),
      ]);

      setStatsHoy({ realizadas, pendiente, reprogramadas });
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      Swal.fire("Error", "No se pudieron cargar las estadísticas", "error");
    }
  };

  //Funcion para reprogramar
  const handleReprogramar = async (visita) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Está seguro que desea reprogramar la visita?',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      icon: 'question',
    });
  
    if (!isConfirmed) return;
  
    // Cambiar estado a "reprogramada" en Supabase
    const { error: updateError } = await supabase
      .from('visitas')
      .update({ estado: 'reprogramada' })
      .eq('id', visita.id);
  
    if (updateError) {
      Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
      return;
    }
  
    // Input para detalles de reprogramación
    const { value: detallesReprogramacion } = await Swal.fire({
      title: 'Detalles de la reprogramación',
      input: 'textarea',
      inputPlaceholder: 'Escriba los motivos de la reprogramación...',
      showCancelButton: true,
    });
  
    if (detallesReprogramacion) {
      const { error } = await supabase
        .from('visitas')
        .update({ detalles_visita: detallesReprogramacion })
        .eq('id', visita.id);
  
      if (error) {
        Swal.fire('Error', 'No se pudieron guardar los detalles.', 'error');
        return;
      }
  
      Swal.fire('Éxito', 'Los motivos de la reprogramación se guardaron correctamente.', 'success');
    }
  };

  //Funcion para Realizar visita
  const handleRealizar = async (visita) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Está seguro que desea realizar la visita?',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      icon: 'question',
    });
  
    if (!isConfirmed) return;
  
    // Cambiar estado a "realizada" en Supabase
    const { error: updateError } = await supabase
      .from('visitas')
      .update({ estado: 'realizada' })
      .eq('id', visita.id);
  
    if (updateError) {
      Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
      return;
    }
  
    // Preguntar si se realizó la venta
    const { isConfirmed: ventaRealizada } = await Swal.fire({
      title: '¿Se realizó la venta?',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      icon: 'question',
    });
  
    if (ventaRealizada) {
      // Inputs para valor y detalles de venta
      const { value: formValues } = await Swal.fire({
        title: 'Detalles de la venta',
        html: `
          <input id="valor_venta" type="number" placeholder="Valor de la venta" class="swal2-input" />
          <textarea id="detalles_venta" placeholder="Detalles de lo vendido" class="swal2-textarea"></textarea>
        `,
        focusConfirm: false,
        preConfirm: () => {
          const valorVenta = document.getElementById('valor_venta').value;
          const detallesVenta = document.getElementById('detalles_venta').value;
          if (!valorVenta || !detallesVenta) {
            Swal.showValidationMessage('Por favor complete ambos campos.');
            return null;
          }
          return { valorVenta, detallesVenta };
        },
      });
  
      if (formValues) {
        const { valorVenta, detallesVenta } = formValues;
        // Actualizar detalles y valor en Supabase
        const { error } = await supabase
          .from('visitas')
          .update({ valor_venta: valorVenta, detalles_visita: detallesVenta })
          .eq('id', visita.id);
  
        if (error) {
          Swal.fire('Error', 'No se pudieron guardar los detalles.', 'error');
          return;
        }
  
        Swal.fire('Éxito', 'Los detalles de la venta se guardaron correctamente.', 'success');
      }
    } else {
      // Input para detalles de la visita
      const { value: detallesVisita } = await Swal.fire({
        title: 'Detalles de la visita',
        input: 'textarea',
        inputPlaceholder: 'Escriba los detalles de la visita...',
        showCancelButton: true,
      });
  
      if (detallesVisita) {
        const { error } = await supabase
          .from('visitas')
          .update({ detalles_visita: detallesVisita })
          .eq('id', visita.id);
  
        if (error) {
          Swal.fire('Error', 'No se pudieron guardar los detalles.', 'error');
          return;
        }
  
        Swal.fire('Éxito', 'Los detalles de la visita se guardaron correctamente.', 'success');
      }
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 mt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">Dashboard Asesor</h1>
        <p className="text-center text-gray-400">Gestión de visitas en tiempo real</p>
      </header>

     

      {/* Estadísticas */}
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
            <h3 className="text-xl font-semibold">Pendiente</h3>
            <p className="text-3xl font-bold">{statsHoy.pendiente}</p>
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

 {/* Filtros por rango de fecha */}
 <div className="flex justify-center space-x-4 mb-8">
        <div>
          <label htmlFor="startDate" className="block text-gray-400">
            Fecha inicial:
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded bg-gray-800 text-white"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-gray-400">
            Fecha final:
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded bg-gray-800 text-white"
          />
        </div>
      </div>
      {/* Visitas */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
        
        <h2 className="text-2xl font-semibold mb-4 text-center text-white">
          Visitas Pendiente
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visitas.length > 0 ? (
            visitas.map((visita) => (
              <div
                key={visita.id}
                className={`p-4 rounded-lg shadow-lg ${
                  visita.estado === "pendiente"
                    ? "bg-blue-900/30"
                    : visita.estado === "realizada"
                    ? "bg-green-900/30"
                    : "bg-yellow-900/30"
                }`}
              >
                <h3 className="font-bold text-lg text-white">{visita.nombre}</h3>
                <p><span className="font-medium text-gray-400">Direccion:</span> {visita.ciudad}, {visita.barrio}, {visita.direccion}</p>
                <p><span className="font-medium text-gray-400">Telefono:</span> {visita.telefono}</p>
                <p><span className="font-medium text-gray-400">Fecha:</span> {visita.fecha}</p>
                <p><span className="font-medium text-gray-400">Hora:</span> {visita.hora}</p>
                <p><span className="font-medium text-gray-400">Detalle:</span> {visita.detalles}</p>
                <button
              onClick={() => handleRealizar(visita, "complete")}
              className="text-green-500 text-sm md:text-base"
            >
              Marcar Realizada
            </button>
            <button
              onClick={() => handleReprogramar(visita, "reprogramar")}
              className="text-yellow-500 text-sm md:text-base ml-2"
            >
              Reprogramar
            </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center col-span-full">
              No hay visitas en este rango.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAsesor;
