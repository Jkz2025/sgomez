import { useFetchVisitasHook } from "../Functions/useFetchVisitasHook";
import { useState, useEffect } from "react";
import { supabase } from "../Functions/CreateClient";
import Swal from "sweetalert2";
import { 
  BarChart, 
  ClipboardCheck, 
  RefreshCcw, 
  Calendar,
  Plus,
  MapPin,
  Brain,
  StickyNote,
  Users,
  FileText
} from "lucide-react";
import AgendarCita from "./AgendarCita";
import AgregarPrograma from "./AgregarPrograma";
import VerProgramas from "./VerProgramas";
import GoogleMaps from "./GoogleMaps";
import AsistenteIA from "./AsistenteIA";
import Notas from "./Notas";
import AgregarCliente from "./AgregarCliente";


const DashboardAsesor = () => {
  const [statsHoy, setStatsHoy] = useState({
    realizadas: 0,
    pendientes: 0,
    reprogramadas: 0,
  });

  const [activeModal, setActiveModal] = useState(null);

  const {
    visitas,
    setVisitas,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
  } = useFetchVisitasHook();

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
        .eq("estado", "pendiente")
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

      const [realizadas, pendientes, reprogramadas] = await Promise.all([
        fetchCount("realizada"),
        fetchCount("pendiente"),
        fetchCount("reprogramada"),
      ]);

      setStatsHoy({ realizadas, pendientes, reprogramadas });
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
    <div className="min-h-screen pt-20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="section-title text-center">Dashboard Asesor</h1>
          <p className="text-center text-blue-200">Gestión de visitas y programas en tiempo real</p>
        </header>

        {/* Quick Actions */}
        <div className="card-grid mb-8">
          <button 
            onClick={() => setActiveModal('agendarCita')}
            className="stat-card flex flex-col items-center justify-center space-y-2"
          >
            <Calendar className="w-8 h-8 text-blue-400" />
            <span className="text-white font-medium">Agendar Cita</span>
          </button>
            <button 
              onClick={() => setActiveModal('agregarPrograma')}
              className="stat-card flex flex-col items-center justify-center space-y-2"
            >
            <FileText className="w-8 h-8 text-green-400" />
            <span className="text-white font-medium">Agregar Programa</span>
          </button>
          <button 
            onClick={() => setActiveModal('verProgramas')}
            className="stat-card flex flex-col items-center justify-center space-y-2"
          >
            <FileText className="w-8 h-8 text-emerald-400" />
            <span className="text-white font-medium">Ver Programas</span>
          </button>
          <button 
            onClick={() => setActiveModal('googleMaps')}
            className="stat-card flex flex-col items-center justify-center space-y-2"
          >
            <MapPin className="w-8 h-8 text-red-400" />
            <span className="text-white font-medium">Google Maps</span>
          </button>
          <button 
            onClick={() => setActiveModal('asistenteIA')}
            className="stat-card flex flex-col items-center justify-center space-y-2"
          >
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="text-white font-medium">Asistente IA</span>
          </button>
          <button 
            onClick={() => setActiveModal('notas')}
            className="stat-card flex flex-col items-center justify-center space-y-2"
          >
            <StickyNote className="w-8 h-8 text-yellow-400" />
            <span className="text-white font-medium">Notas</span>
          </button>
          <button 
            onClick={() => setActiveModal('agregarCliente')}
            className="stat-card flex flex-col items-center justify-center space-y-2"
          >
            <Users className="w-8 h-8 text-cyan-400" />
            <span className="text-white font-medium">Agregar Cliente</span>
          </button>
        </div>

        {/* Estadísticas */}
        <div className="card-grid mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-600/20 rounded-xl">
                <ClipboardCheck className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-green-400 text-sm font-semibold">Realizadas</span>
            </div>
            <h3 className="text-3xl font-bold text-white">{statsHoy.realizadas}</h3>
            <p className="text-blue-200 text-sm">Visitas completadas</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-600/20 rounded-xl">
                <BarChart className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-yellow-400 text-sm font-semibold">Pendientes</span>
            </div>
            <h3 className="text-3xl font-bold text-white">{statsHoy.pendientes}</h3>
            <p className="text-blue-200 text-sm">Visitas pendientes</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-600/20 rounded-xl">
                <RefreshCcw className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-red-400 text-sm font-semibold">Reprogramadas</span>
            </div>
            <h3 className="text-3xl font-bold text-white">{statsHoy.reprogramadas}</h3>
            <p className="text-blue-200 text-sm">Visitas reprogramadas</p>
          </div>
        </div>

        {/* Filtros por rango de fecha */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Filtrar por rango de fechas</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="startDate" className="block text-blue-200 mb-2">
                Fecha inicial:
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="endDate" className="block text-blue-200 mb-2">
                Fecha final:
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Visitas */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Visitas Pendientes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visitas.length > 0 ? (
              visitas.map((visita) => (
                <div
                  key={visita.id}
                  className={`p-6 rounded-xl ${
                    visita.estado === "pendiente"
                      ? "bg-blue-900/30"
                      : visita.estado === "realizada"
                      ? "bg-green-900/30"
                      : "bg-yellow-900/30"
                  } hover:bg-white/5 transition-all duration-300`}
                >
                  <h3 className="font-bold text-lg text-white mb-3">{visita.cliente}</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-blue-200">Dirección:</span> {visita.ciudad}, {visita.barrio}, {visita.direccion}</p>
                    <p><span className="font-medium text-blue-200">Teléfono:</span> {visita.telefono}</p>
                    <p><span className="font-medium text-blue-200">Fecha:</span> {visita.fecha}</p>
                    <p><span className="font-medium text-blue-200">Hora:</span> {visita.hora}</p>
                    <p><span className="font-medium text-blue-200">Detalle:</span> {visita.detalles}</p>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleRealizar(visita, "complete")}
                      className="flex-1 gradient-button py-2 rounded-lg text-sm"
                    >
                      Realizar
                    </button>
                    <button
                      onClick={() => handleReprogramar(visita, "reprogramar")}
                      className="flex-1 px-4 py-2 rounded-lg text-sm border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500/20 transition-all duration-300"
                    >
                      Reprogramar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-blue-200 text-center col-span-full py-8">
                No hay visitas en este rango.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'agendarCita' && (
        <AgendarCita 
          onClose={() => setActiveModal(null)} 
          onCitaAgendada={fetchVisitas}
        />
      )}
      {activeModal === 'agregarPrograma' && (
        <AgregarPrograma 
          onClose={() => setActiveModal(null)} 
          onProgramaAgregado={() => {
            setActiveModal(null);
            // Optionally refresh data
          }}
        />
      )}
      {activeModal === 'verProgramas' && (
        <VerProgramas 
          onClose={() => setActiveModal(null)} 
        />
      )}
      {activeModal === 'googleMaps' && (
        <GoogleMaps 
          onClose={() => setActiveModal(null)} 
        />
      )}
      {activeModal === 'asistenteIA' && (
        <AsistenteIA 
          onClose={() => setActiveModal(null)} 
        />
      )}
      {activeModal === 'notas' && (
        <Notas 
          onClose={() => setActiveModal(null)} 
        />
      )}
      {activeModal === 'agregarCliente' && (
        <AgregarCliente 
          onClose={() => setActiveModal(null)} 
          onClienteAgregado={() => {
            setActiveModal(null);
            // Optionally refresh data
          }}
        />
      )}
    </div>
  );
};

export default DashboardAsesor;
