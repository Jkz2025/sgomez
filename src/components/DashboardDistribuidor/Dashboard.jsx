// DashboardDistribuidor.jsx
import { useState, useEffect } from "react";
import { supabase } from "../Functions/CreateClient";
import { useAuth } from "../../constants/AuthContext";
import {
  Users, Calendar, FileText, StickyNote, UserPlus, BarChart3,
  ClipboardCheck, Clock, RefreshCw, Eye, PlusCircle
} from "lucide-react";
import Swal from "sweetalert2";


// Subcomponentes para cada tabla (puedes moverlos a archivos separados)
const TabProgramas = ({ data, loading }) => {
  if (loading) return <div className="text-blue-200">Cargando programas...</div>;
  if (data.length === 0) return <div className="text-blue-200">No hay programas registrados.</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((prog) => (
        <div key={prog.id} className="glass-card p-4">
          <h4 className="font-bold text-white">{prog.cliente_nombre}</h4>
          <p className="text-sm text-blue-200">Asesor: {prog.asesor}</p>
          <p className="text-sm text-blue-200">Fecha: {prog.fecha_inicial} → {prog.fecha_final}</p>
          <p className="text-sm text-blue-200">Regalo: {prog.regalo || 'Ninguno'}</p>
        </div>
      ))}
    </div>
  );
};

const TabReferidos = ({ data, loading }) => {
  if (loading) return <div className="text-blue-200">Cargando referidos...</div>;
  if (data.length === 0) return <div className="text-blue-200">No hay referidos registrados.</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((ref) => (
        <div key={ref.id} className="glass-card p-4">
          <h4 className="font-bold text-white">{ref.nombre} {ref.apellido}</h4>
          <p className="text-sm text-blue-200">Teléfono: {ref.telefono}</p>
          <p className="text-sm text-blue-200">Correo: {ref.correo}</p>
          <p className="text-sm text-blue-200">Estado: {ref.estado}</p>
        </div>
      ))}
    </div>
  );
};

const TabVisitas = ({ data, loading }) => {
  if (loading) return <div className="text-blue-200">Cargando visitas...</div>;
  if (data.length === 0) return <div className="text-blue-200">No hay visitas registradas.</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((visita) => (
        <div key={visita.id} className="glass-card p-4">
          <h4 className="font-bold text-white">{visita.cliente_nombre}</h4>
          <p className="text-sm text-blue-200">Asesor: {visita.asesor}</p>
          <p className="text-sm text-blue-200">Fecha: {visita.fecha} {visita.hora}</p>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
            visita.estado === 'realizada' ? 'bg-green-600 text-white' :
            visita.estado === 'pendiente' ? 'bg-yellow-600 text-white' :
            'bg-red-600 text-white'
          }`}>
            {visita.estado}
          </span>
        </div>
      ))}
    </div>
  );
};

const TabClientes = ({ data, loading }) => {
  if (loading) return <div className="text-blue-200">Cargando clientes...</div>;
  if (data.length === 0) return <div className="text-blue-200">No hay clientes registrados.</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((cliente) => (
        <div key={cliente.id} className="glass-card p-4">
          <h4 className="font-bold text-white">{cliente.nombre_completo}</h4>
          <p className="text-sm text-blue-200">Teléfono: {cliente.telefono}</p>
          <p className="text-sm text-blue-200">Dirección: {cliente.direccion}</p>
          <p className="text-sm text-blue-200">Ciudad: {cliente.ciudad}</p>
        </div>
      ))}
    </div>
  );
};

const TabNotas = ({ data, loading }) => {
  if (loading) return <div className="text-blue-200">Cargando notas...</div>;
  if (data.length === 0) return <div className="text-blue-200">No hay notas registradas.</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((nota) => (
        <div key={nota.id} className="glass-card p-4">
          <h4 className="font-bold text-white">{nota.titulo}</h4>
          <p className="text-sm text-blue-200">{nota.contenido}</p>
          <p className="text-sm text-blue-200">Categoría: {nota.categoria}</p>
        </div>
      ))}
    </div>
  );
};

const TabPerfiles = ({ data, loading }) => {
  if (loading) return <div className="text-blue-200">Cargando perfiles...</div>;
  if (data.length === 0) return <div className="text-blue-200">No hay asesores/televentas asociados.</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((perfil) => (
        <div key={perfil.id} className="glass-card p-4">
          <h4 className="font-bold text-white">{perfil.nombre} {perfil.apellido}</h4>
          <p className="text-sm text-blue-200">Cargo: {perfil.cargo}</p>
          <p className="text-sm text-blue-200">Código: {perfil.codigo}</p>
        </div>
      ))}
    </div>
  );
};

// Componente principal
const DashboardDistribuidor = () => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState('programas');
  const [distribucion, setDistribucion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    programas: [],
    referidos: [],
    visitas: [],
    clientes: [],
    notas: [],
    perfiles: []
  });

  // Obtener la distribucion del distribuidor logueado
  useEffect(() => {
    const fetchDistribucion = async () => {
      if (!session?.user?.id) return;
      try {
        const { data: perfil, error } = await supabase
          .from('profiles')
          .select('distribucion')
          .eq('id', session.user.id)
          .single();
        if (error) throw error;
        setDistribucion(perfil.distribucion);
      } catch (error) {
        console.error('Error obteniendo distribucion:', error);
        Swal.fire('Error', 'No se pudo obtener la distribución del usuario.', 'error');
      }
    };
    fetchDistribucion();
  }, [session]);

  // Cargar datos según la distribucion y la pestaña activa
  useEffect(() => {
    if (!distribucion) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        let result;
        switch (activeTab) {
          case 'programas':
            result = await supabase.from('programas').select('*').eq('distribucion', distribucion);
            break;
          case 'referidos':
            result = await supabase.from('referidos_programa').select('*').eq('distribucion', distribucion);
            break;
          case 'visitas':
            result = await supabase.from('visitas').select('*').eq('distribucion', distribucion);
            break;
          case 'clientes':
            result = await supabase.from('clientes').select('*').eq('distribucion', distribucion);
            break;
          case 'notas':
            result = await supabase.from('notas').select('*').eq('distribucion', distribucion);
            break;
          case 'perfiles':
            result = await supabase.from('profiles').select('*').eq('distribucion', distribucion);
            break;
          default:
            return;
        }
        if (result.error) throw result.error;
        setData(prev => ({ ...prev, [activeTab]: result.data || [] }));
      } catch (error) {
        console.error(`Error cargando ${activeTab}:`, error);
        Swal.fire('Error', `No se pudieron cargar los datos de ${activeTab}.`, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [distribucion, activeTab]);

  // Renderizar la pestaña correspondiente
  const renderTabContent = () => {
    const props = { data: data[activeTab], loading };
    switch (activeTab) {
      case 'programas': return <TabProgramas {...props} />;
      case 'referidos': return <TabReferidos {...props} />;
      case 'visitas': return <TabVisitas {...props} />;
      case 'clientes': return <TabClientes {...props} />;
      case 'notas': return <TabNotas {...props} />;
      case 'perfiles': return <TabPerfiles {...props} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen pt-20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="section-title text-center">Dashboard Distribuidor</h1>
          <p className="text-center text-blue-200">
            Visión global de tu red de ventas (distribución: <strong>{distribucion}</strong>)
          </p>
        </header>

        {/* Pestañas */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {[
            { key: 'programas', label: 'Programas', icon: FileText },
            { key: 'referidos', label: 'Referidos', icon: UserPlus },
            { key: 'visitas', label: 'Visitas', icon: Calendar },
            { key: 'clientes', label: 'Clientes', icon: Users },
            { key: 'notas', label: 'Notas', icon: StickyNote },
            { key: 'perfiles', label: 'Equipo', icon: Users },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido de la pestaña activa */}
        <div className="glass-card p-6">
          {renderTabContent()}
        </div>

        {/* Resumen rápido (tarjetas de conteo) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
          {Object.entries(data).map(([key, items]) => (
            <div key={key} className="stat-card text-center">
              <p className="text-2xl font-bold text-white">{items.length}</p>
              <p className="text-xs text-blue-200 uppercase">{key}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardDistribuidor;