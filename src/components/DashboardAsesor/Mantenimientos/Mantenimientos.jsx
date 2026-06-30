// Mantenimientos.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../Functions/CreateClient'
import Swal from 'sweetalert2';
import { Wrench, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const Mantenimientos = ({ onClose, onAgendarMantenimiento }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) {
      setClientes(data);
    } else {
      console.error('Error al cargar clientes:', error);
      Swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
    }
    setLoading(false);
  };

  const calcularMeses = (fechaBase) => {
    const ahora = new Date();
    const diff = ahora - new Date(fechaBase);
    return diff / (1000 * 60 * 60 * 24 * 30.44); // meses promedio
  };

  const getEstadoMantenimiento = (cliente) => {
    // Si tiene ultimo_mantenimiento, usar esa fecha; si no, created_at
    const fechaReferencia = cliente.ultimo_mantenimiento || cliente.created_at;
    const meses = calcularMeses(fechaReferencia);
    if (meses < 4) return { color: 'verde', label: 'Al día', icon: CheckCircle };
    if (meses >= 4 && meses < 6) return { color: 'naranja', label: 'Próximo vencimiento', icon: AlertTriangle };
    return { color: 'rojo', label: 'Vencido', icon: XCircle };
  };

  const handleAgendarMantenimiento = async (cliente) => {
    const { isConfirmed } = await Swal.fire({
      title: `¿Agendar mantenimiento para ${cliente.nombre}?`,
      text: 'Se abrirá el formulario de agendamiento.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, agendar',
      cancelButtonText: 'Cancelar',
    });

    if (!isConfirmed) return;

    // Actualizar el campo ultimo_mantenimiento con la fecha actual
    const { error } = await supabase
      .from('clientes')
      .update({ ultimo_mantenimiento: new Date().toISOString() })
      .eq('id', cliente.id);

    if (error) {
      Swal.fire('Error', 'No se pudo actualizar el mantenimiento', 'error');
      return;
    }

    // Cerrar el modal de mantenimientos y abrir el de agendar cita
    onClose();
    onAgendarMantenimiento(cliente); // esta función viene del padre para abrir AgendarCita

    // Refrescar lista después
    await fetchClientes();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-400" />
            Mantenimientos
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
        </div>

        {loading ? (
          <p className="text-center text-blue-200">Cargando clientes...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientes.map((cliente) => {
              const estado = getEstadoMantenimiento(cliente);
              const colorClasses = {
                verde: 'border-green-500 bg-green-900/20',
                naranja: 'border-orange-500 bg-orange-900/20',
                rojo: 'border-red-500 bg-red-900/20',
              };
              const iconColor = {
                verde: 'text-green-400',
                naranja: 'text-orange-400',
                rojo: 'text-red-400',
              };

              return (
                <div key={cliente.id} className={`p-4 rounded-xl border-2 ${colorClasses[estado.color]} transition-all`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white">{cliente.nombre}</h3>
                      <p className="text-blue-200 text-sm">{cliente.telefono}</p>
                      <p className="text-blue-200 text-sm">{cliente.direccion}</p>
                    </div>
                    <estado.icon className={`w-6 h-6 ${iconColor[estado.color]}`} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-sm font-semibold ${iconColor[estado.color]}`}>
                      {estado.label}
                    </span>
                    {estado.color !== 'verde' && (
                      <button
                        onClick={() => handleAgendarMantenimiento(cliente)}
                        className="gradient-button py-1 px-3 rounded-lg text-xs"
                      >
                        Agendar Mantenimiento
                      </button>
                    )}
                    {estado.color === 'verde' && (
                      <button
                        onClick={() => handleAgendarMantenimiento(cliente)}
                        className="text-blue-400 text-xs hover:text-blue-300"
                      >
                        Reagendar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-6 text-center text-blue-200 text-sm">
          Los clientes en <span className="text-green-400">verde</span> están al día (menos de 4 meses).<br />
          <span className="text-orange-400">Naranja</span> (4-6 meses) y <span className="text-red-400">rojo</span> (más de 6 meses) requieren mantenimiento.
        </div>
      </div>
    </div>
  );
};

export default Mantenimientos;