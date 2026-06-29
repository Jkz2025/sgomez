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
  FileText,
  Wrench 
} from "lucide-react";
import Mantenimientos from "./Mantenimientos/Mantenimientos";
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
  const [activeTab, setActiveTab] = useState('pendientes'); // 'pendientes', 'realizadas', 'reprogramadas'

  // Estados para listas de visitas
  const [visitasRealizadas, setVisitasRealizadas] = useState([]);
  const [visitasReprogramadas, setVisitasReprogramadas] = useState([]);

  const {
    visitas,
    setVisitas,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
  } = useFetchVisitasHook();

  // Cargar datos al cambiar fechas
  useEffect(() => {
    fetchVisitas();
    fetchVisitasRealizadas();
    fetchVisitasReprogramadas();
    fetchTodayStats();
  }, [startDate, endDate]);

  // Función para cargar visitas pendientes
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

  // Función para cargar visitas realizadas
  const fetchVisitasRealizadas = async () => {
    try {
      const { data, error } = await supabase
        .from("visitas")
        .select("*")
        .eq("estado", "realizada")
        .gte("fecha", `${startDate} 00:00:00`)
        .lte("fecha", `${endDate} 23:59:59`);

      if (error) throw error;
      setVisitasRealizadas(data);
    } catch (error) {
      console.error("Error al cargar visitas realizadas:", error);
    }
  };

  // Función para cargar visitas reprogramadas
  const fetchVisitasReprogramadas = async () => {
    try {
      const { data, error } = await supabase
        .from("visitas")
        .select("*")
        .eq("estado", "reprogramada")
        .gte("fecha", `${startDate} 00:00:00`)
        .lte("fecha", `${endDate} 23:59:59`);

      if (error) throw error;
      setVisitasReprogramadas(data);
    } catch (error) {
      console.error("Error al cargar visitas reprogramadas:", error);
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

  // Reprogramar visita (desde pendientes)
  const handleReprogramar = async (visita) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Está seguro que desea reprogramar la visita?',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      icon: 'question',
    });

    if (!isConfirmed) return;

    const { error: updateError } = await supabase
      .from('visitas')
      .update({ estado: 'reprogramada' })
      .eq('id', visita.id);

    if (updateError) {
      Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
      return;
    }

    const { value: motivo } = await Swal.fire({
      title: 'Motivo de la reprogramación',
      input: 'textarea',
      inputPlaceholder: 'Escriba el motivo...',
      showCancelButton: true,
    });

    if (motivo) {
      const { error } = await supabase
        .from('visitas')
        .update({ notas: motivo })
        .eq('id', visita.id);
      if (error) {
        Swal.fire('Error', 'No se pudo guardar el motivo.', 'error');
        return;
      }
      Swal.fire('Éxito', 'La visita ha sido reprogramada.', 'success');
    }

    // Actualizar todas las listas
    await Promise.all([fetchVisitas(), fetchVisitasRealizadas(), fetchVisitasReprogramadas(), fetchTodayStats()]);
  };

  // Realizar visita
  const handleRealizar = async (visita) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Está seguro que desea realizar la visita?',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      icon: 'question',
    });

    if (!isConfirmed) return;

    // 1. Cambiar estado a "realizada"
    const { error: updateError } = await supabase
      .from('visitas')
      .update({ estado: 'realizada' })
      .eq('id', visita.id);

    if (updateError) {
      Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
      return;
    }

    // 2. Preguntar resultado de la visita
    const { value: resultado } = await Swal.fire({
      title: 'Seleccione el resultado de la visita',
      input: 'select',
      inputOptions: {
        venta: 'Venta',
        no_venta: 'No venta',
        casi_venta: 'Casi venta',
      },
      inputPlaceholder: 'Elija una opción',
      showCancelButton: true,
    });

    if (!resultado) {
      Swal.fire('Cancelado', 'No se guardó el resultado.', 'info');
      return;
    }

    let valorVenta = null;
    let notas = null;

    if (resultado === 'venta') {
      const { value: valor } = await Swal.fire({
        title: 'Ingrese el valor de la venta',
        input: 'number',
        inputPlaceholder: 'Ej: 150000',
        showCancelButton: true,
      });
      if (valor) {
        valorVenta = parseFloat(valor);
      } else {
        Swal.fire('Cancelado', 'No se guardó el valor.', 'info');
        return;
      }
    } else if (resultado === 'no_venta' || resultado === 'casi_venta') {
      const { value: explicacion } = await Swal.fire({
        title: resultado === 'no_venta' ? 'Motivo de la no venta' : 'Explique por qué fue casi venta',
        input: 'textarea',
        inputPlaceholder: 'Escriba los detalles...',
        showCancelButton: true,
      });
      if (explicacion) {
        notas = explicacion;
      } else {
        Swal.fire('Cancelado', 'No se guardó la explicación.', 'info');
        return;
      }
    }

    const updateData = { resultado };
    if (valorVenta !== null) updateData.valor_venta = valorVenta;
    if (notas !== null) updateData.notas = notas;

    const { error: saveError } = await supabase
      .from('visitas')
      .update(updateData)
      .eq('id', visita.id);

    if (saveError) {
      Swal.fire('Error', 'No se pudieron guardar los datos.', 'error');
      return;
    }

    const { isConfirmed: agregarPrograma } = await Swal.fire({
      title: '¿Desea añadir programas?',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      icon: 'question',
    });

    if (agregarPrograma) {
      setActiveModal('agregarPrograma');
    } else {
      Swal.fire('Éxito', 'Visita realizada correctamente.', 'success');
    }

    await Promise.all([fetchVisitas(), fetchVisitasRealizadas(), fetchVisitasReprogramadas(), fetchTodayStats()]);
  };

  // Reprogramar desde la lista de reprogramadas (volver a pendiente)
  const handleReprogramarDesdeReprogramada = async (visita) => {
    const { value: formValues } = await Swal.fire({
      title: 'Reprogramar cita (volver a pendiente)',
      html: `
        <input id="nuevaFecha" type="date" class="swal2-input" value="${visita.fecha.split('T')[0]}" />
        <input id="nuevaHora" type="time" class="swal2-input" value="${visita.hora}" />
        <select id="nuevoTipo" class="swal2-input">
          <option value="visita" ${visita.tipo === 'visita' ? 'selected' : ''}>Visita</option>
          <option value="mantenimiento" ${visita.tipo === 'mantenimiento' ? 'selected' : ''}>Mantenimiento</option>
          <option value="otro" ${visita.tipo === 'otro' ? 'selected' : ''}>Otro</option>
        </select>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const fecha = document.getElementById('nuevaFecha').value;
        const hora = document.getElementById('nuevaHora').value;
        const tipo = document.getElementById('nuevoTipo').value;
        if (!fecha || !hora) {
          Swal.showValidationMessage('Fecha y hora son obligatorias');
          return null;
        }
        return { fecha, hora, tipo };
      },
      showCancelButton: true,
    });

    if (!formValues) return;

    const { error } = await supabase
      .from('visitas')
      .update({
        fecha: `${formValues.fecha} ${visita.fecha.split(' ')[1] || '00:00:00'}`,
        hora: formValues.hora,
        tipo: formValues.tipo,
        estado: 'pendiente',
      })
      .eq('id', visita.id);

    if (error) {
      Swal.fire('Error', 'No se pudo reprogramar', 'error');
    } else {
      Swal.fire('Éxito', 'Cita reprogramada a pendiente', 'success');
      await Promise.all([fetchVisitas(), fetchVisitasRealizadas(), fetchVisitasReprogramadas(), fetchTodayStats()]);
    }
  };

  // Función para manejar agendamiento de mantenimiento desde Mantenimientos
  const handleAgendarMantenimiento = (cliente) => {
    // Abrir el modal de AgendarCita (puedes pasar el cliente como prop si modificas AgendarCita)
    setActiveModal('agendarCita');
    // Opcional: podrías pasar el cliente seleccionado a AgendarCita mediante un estado global o contexto
    // Por ahora solo lo abrimos
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
          {/* Nuevo botón Mantenimientos */}
          <button 
            onClick={() => setActiveModal('mantenimientos')}
            className="stat-card flex flex-col items-center justify-center space-y-2"
          >
            <Wrench className="w-8 h-8 text-indigo-400" />
            <span className="text-white font-medium">Mantenimientos</span>
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

        {/* Sección de Visitas con pestañas */}
        <div className="glass-card p-6">
          <div className="flex border-b border-blue-800/50 mb-6">
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'pendientes' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-200 hover:text-white'
              }`}
              onClick={() => setActiveTab('pendientes')}
            >
              Pendientes
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'realizadas' ? 'text-green-400 border-b-2 border-green-400' : 'text-blue-200 hover:text-white'
              }`}
              onClick={() => setActiveTab('realizadas')}
            >
              Realizadas
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'reprogramadas' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-blue-200 hover:text-white'
              }`}
              onClick={() => setActiveTab('reprogramadas')}
            >
              Reprogramadas
            </button>
          </div>

          {/* Contenido de pestañas */}
          {activeTab === 'pendientes' && (
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
                      <h1 className="font-bold text-green-400">{visita.cliente_nombre} </h1>
                      <p><span className="font-medium text-blue-200">Fecha:</span> {new Date(visita.fecha).toLocaleDateString()}</p>
                      <p><span className="font-medium text-blue-200">Dirección:</span> {visita.ciudad}, {visita.barrio}, {visita.cliente_direccion}</p>
                      <p><span className="font-medium text-blue-200">Teléfono:</span> {visita.cliente_telefono}</p>
                      <p><span className="font-medium text-blue-200">Hora:</span> {visita.hora}</p>
                      <p><span className="font-medium text-blue-200">Detalle:</span> {visita.notas}</p>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handleRealizar(visita)}
                        className="flex-1 gradient-button py-2 rounded-lg text-sm"
                      >
                        Realizar
                      </button>
                      <button
                        onClick={() => handleReprogramar(visita)}
                        className="flex-1 px-4 py-2 rounded-lg text-sm border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500/20 transition-all duration-300"
                      >
                        Reprogramar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-blue-200 text-center col-span-full py-8">
                  No hay visitas pendientes en este rango.
                </p>
              )}
            </div>
          )}

          {activeTab === 'realizadas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visitasRealizadas.length > 0 ? (
                visitasRealizadas.map((visita) => {
                  const resultadoColor = 
                    visita.resultado === 'venta' ? 'border-green-500 bg-green-900/20' :
                    visita.resultado === 'no_venta' ? 'border-red-500 bg-red-900/20' :
                    visita.resultado === 'casi_venta' ? 'border-yellow-500 bg-yellow-900/20' :
                    'border-gray-500 bg-gray-900/20';
                  return (
                    <div key={visita.id} className={`p-4 rounded-xl border-2 ${resultadoColor}`}>
                      <h3 className="font-bold text-white">{visita.cliente_nombre}</h3>
                      <p className="text-blue-200 text-sm">Fecha: {new Date(visita.fecha).toLocaleDateString()}</p>
                      <p className="text-blue-200 text-sm">Resultado: {visita.resultado}</p>
                      {visita.valor_venta && <p className="text-green-400">Valor: ${visita.valor_venta}</p>}
                      <p className="text-blue-200 text-sm">Notas: {visita.notas}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-blue-200 text-center col-span-full py-8">
                  No hay visitas realizadas en este rango.
                </p>
              )}
            </div>
          )}

          {activeTab === 'reprogramadas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visitasReprogramadas.length > 0 ? (
                visitasReprogramadas.map((visita) => (
                  <div key={visita.id} className="p-4 rounded-xl border-2 border-red-500 bg-red-900/20">
                    <h3 className="font-bold text-white">{visita.cliente_nombre}</h3>
                    <p className="text-blue-200 text-sm">Fecha: {new Date(visita.fecha).toLocaleDateString()}</p>
                    <p className="text-blue-200 text-sm">Motivo: {visita.notas}</p>
                    <button
                      onClick={() => handleReprogramarDesdeReprogramada(visita)}
                      className="mt-2 gradient-button py-1 px-3 rounded-lg text-sm"
                    >
                      Reprogramar (volver a pendiente)
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-blue-200 text-center col-span-full py-8">
                  No hay visitas reprogramadas en este rango.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {activeModal === 'agendarCita' && (
        <AgendarCita 
          onClose={() => setActiveModal(null)} 
          onCitaAgendada={() => {
            Promise.all([fetchVisitas(), fetchVisitasRealizadas(), fetchVisitasReprogramadas(), fetchTodayStats()]);
          }}
        />
      )}
      {activeModal === 'agregarPrograma' && (
        <AgregarPrograma 
          onClose={() => setActiveModal(null)} 
          onProgramaAgregado={() => {
            setActiveModal(null);
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
          }}
        />
      )}
      {activeModal === 'mantenimientos' && (
        <Mantenimientos 
          onClose={() => setActiveModal(null)}
          onAgendarMantenimiento={handleAgendarMantenimiento}
        />
      )}
    </div>
  );
};

export default DashboardAsesor;
