import { useState, useEffect } from 'react';
import { supabase } from '../Functions/CreateClient';
import { X, Calendar, User, Phone, MapPin, Gift, ChevronDown, ChevronUp } from 'lucide-react';

const VerProgramas = ({ onClose }) => {
  const [programas, setProgramas] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedProgram, setExpandedProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    fetchProgramas();
  }, [selectedMonth, selectedYear]);

const fetchProgramas = async () => {  // ← quitar el parámetro 'e' que no se usa
  try {
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const userId = user?.id;
    if (!userId) throw new Error('No se encontró ID de usuario');

    // ✅ Declarar ANTES de usar
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

const { data, error } = await supabase
  .from('programas')
  .select(`
  *,
  referidos:referidos_programa!referidos_programa_programaid_fkey (
    id,
    nombre,
    telefono,
    estado_civil,
    trabajo,
    barrio_ciudad,
    ciudad,
    razon_recomendacion
  )
`)
  .eq('asesor', userId)
  // .gte('fecha_inicial', startStr)
  // .lte('fecha_inicial', endStr)
  .order('fecha_inicial', { ascending: false });

    if (error) throw error;
    console.log('DATA:', data);  
    console.log('ERROR:', error);
    setProgramas(data || []);
  } catch (error) {
    console.error('Error al cargar programas:', error);
  } finally {
    setLoading(false);
  }
};

  const toggleExpand = (programaId) => {
    setExpandedProgram(expandedProgram === programaId ? null : programaId);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold gradient-text">Programas por Mes</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-blue-200" />
            </button>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-blue-200 mb-2">Mes</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="input-field"
              >
                {meses.map((mes, index) => (
                  <option key={index} value={index}>{mes}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-blue-200 mb-2">Año</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="input-field"
              >
                {[2023, 2024, 2025, 2026, 2027].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : programas.length === 0 ? (
            console.log('programas', programas),
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-200 text-lg">No hay programas para este mes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {programas.map((programa) => (
                <div key={programa.id} className="glass-card-dark">
                  <div 
                    className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => toggleExpand(programa.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="w-5 h-5 text-blue-400" />
                          <h3 className="text-xl font-semibold text-white">
                            {programa.cliente_nombre}
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-blue-300" />
                            <span className="text-blue-200">{programa.cliente_telefono}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-blue-300" />
                            <span className="text-blue-200">
                              {new Date(programa.fecha_inicial).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-blue-300" />
                            <span className="text-blue-200">{programa.cliente_direccion}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Gift className="w-4 h-4 text-blue-300" />
                            <span className="text-blue-200">{programa.regalo}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center space-x-4 text-sm">
                          <span className="text-blue-300">
                            Distribución: {programa.distribucion}
                          </span>
                          <span className="text-green-400 font-medium">
                            {programa.referidos?.length || 0} referidos
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {expandedProgram === programa.id ? (
                          <ChevronUp className="w-6 h-6 text-blue-400" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-blue-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedProgram === programa.id && (
                    <div className="border-t border-white/10 p-4">
                      <h4 className="text-lg font-semibold text-white mb-4">Referidos</h4>
                      {programa.referidos && programa.referidos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {programa.referidos.map((referido) => (
                            <div key={referido.id} className="bg-white/5 p-4 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <User className="w-4 h-4 text-green-400" />
                                <h5 className="font-medium text-white">{referido.nombre}</h5>
                              </div>
                              <div className="space-y-1 text-sm">
                                {referido.telefono && (
                                  <p className="text-blue-200">
                                    <Phone className="w-3 h-3 inline mr-1" />
                                    {referido.telefono}
                                  </p>
                                )}
                                {referido.estado_civil && (
                                  <p className="text-blue-200">
                                    Estado Civil: {referido.estado_civil}
                                  </p>
                                )}
                                {referido.trabajo && (
                                  <p className="text-blue-200">
                                    Trabajo: {referido.trabajo}
                                  </p>
                                )}
                                {referido.barrio_ciudad && (
                                  <p className="text-blue-200">
                                    <MapPin className="w-3 h-3 inline mr-1" />
                                    {referido.ciudad} - {referido.barrio_ciudad} 
                                  </p>
                                )}
                                {referido.razon_recomendacion && (
                                  <p className="text-blue-200 italic">
                                    "{referido.razon_recomendacion}"
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-blue-200 text-center py-4">
                          No hay referidos registrados
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerProgramas;
