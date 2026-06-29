import { useState } from 'react';
import { supabase } from '../Functions/CreateClient';
import Swal from 'sweetalert2';
import { X, Plus, Trash2, User, Phone, MapPin, Calendar, Gift, Building2 } from 'lucide-react';
import { useUserDistribucion } from '../Functions/useUserDistribucion';

const AgregarPrograma = ({ onClose, onProgramaAgregado }) => {
  const { distribucion, loading} = useUserDistribucion()
  
  const [programaData, setProgramaData] = useState({
    cliente_nombre: '',
    cliente_telefono: '',
    cliente_direccion: '',
    fecha: '',
    regalo: '',
    ciudad: '',
    distribucion: distribucion
  });

  const [referidos, setReferidos] = useState([]);
  const [referidoActual, setReferidoActual] = useState({
    nombre_completo: '',
    telefono: '',
    estado_civil: '',
    trabajo: '',
    relacion: '',
    ciudad: '', 
    barrio_ciudad: '',
    razon_recomendacion: '',
    distribucion: distribucion
  });

  const handleProgramaChange = (e) => {
    setProgramaData({
      ...programaData,
      [e.target.name]: e.target.value
    });
  };

  const handleReferidoChange = (e) => {
    setReferidoActual({
      ...referidoActual,
      [e.target.name]: e.target.value
    });
  };

  const agregarReferido = () => {
    if (!referidoActual.nombre_completo || !referidoActual.telefono) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor complete al menos nombre y teléfono del referido',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setReferidos([...referidos, { ...referidoActual }]);
    setReferidoActual({
      nombre_completo: '',
      telefono: '',
      estado_civil: '',
      trabajo: '',
      barrio_ciudad: '',
      razon_recomendacion: ''
    });
  };

  const eliminarReferido = (index) => {
    setReferidos(referidos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (referidos.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin referidos',
        text: 'Por favor agregue al menos un referido al programa',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = user?.id;
      if (!userId) throw new Error('No se encontró ID de usuario');

      // Insertar programa
      const { data: insertedPrograma, error: programaError } = await supabase
        .from('programas')
        .insert({
          asesor: userId,
          fecha_inicial: programaData.fecha,
          fecha_final: programaData.fecha,
          cliente_nombre: programaData.cliente_nombre,
          cliente_telefono: programaData.cliente_telefono,
          cliente_direccion: programaData.cliente_direccion,
          regalo: programaData.regalo,
          ciudad: programaData.ciudad,
          distribucion: programaData.distribucion
        })
        .select()
        .single();

      if (programaError) throw programaError;

      // Insertar referidos
      const referidosConPrograma = referidos.map(referido => ({
        programaid: insertedPrograma.id,
        nombre: referido.nombre_completo,
        apellido: '',
        telefono: referido.telefono,
        estado_civil: referido.estado_civil,
        trabajo: referido.trabajo,
        barrio_ciudad: referido.barrio_ciudad,
        ciudad: referido.ciudad,
        relacion: referido.relacion,
        razon_recomendacion: referido.razon_recomendacion
      }));

      const { error: referidosError } = await supabase
        .from('referidos_programa')
        .insert(referidosConPrograma);

      if (referidosError) throw referidosError;

      Swal.fire({
        icon: 'success',
        title: 'Programa creado',
        text: `El programa con ${referidos.length} referidos se ha creado correctamente`,
        confirmButtonColor: '#3b82f6'
      });

      if (onProgramaAgregado) onProgramaAgregado();
      onClose();
    } catch (error) {
      console.error('Error al crear programa:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el programa',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold gradient-text">Crear Nuevo Programa</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-blue-200" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Cliente Principal */}
            <div className="glass-card-dark p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-400" />
                Información del Cliente Principal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-200 mb-2">Nombre del Cliente</label>
                  <input
                    type="text"
                    name="cliente_nombre"
                    value={programaData.cliente_nombre}
                    onChange={handleProgramaChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-blue-200 mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="cliente_telefono"
                    value={programaData.cliente_telefono}
                    onChange={handleProgramaChange}
                    className="input-field"
                    required
                  />
                </div>

                <div >
                  <label className="block text-blue-200 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="cliente_direccion"
                    value={programaData.cliente_direccion}
                    onChange={handleProgramaChange}
                    className="input-field"
                    required
                  />
                </div>

<div>
                  <label className="block text-blue-200 mb-2 flex items-center">
                                       <MapPin className="w-4 h-4 mr-2" />

                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={programaData.ciudad}
                    onChange={handleProgramaChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-blue-200 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={programaData.fecha}
                    onChange={handleProgramaChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-blue-200 mb-2 flex items-center">
                    <Gift className="w-4 h-4 mr-2" />
                    Regalo
                  </label>
                  <input
                    type="text"
                    name="regalo"
                    value={programaData.regalo}
                    onChange={handleProgramaChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-blue-200 mb-2 flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Distribución
                  </label>
                  <input
                    type="text"
                    name="distribucion"
                    value={programaData.distribucion}
                    onChange={handleProgramaChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Agregar Referidos */}
            <div className="glass-card-dark p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-green-400" />
                Agregar Referidos ({referidos.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-blue-200 mb-2">Nombre Completo *</label>
                  <input
                    type="text"
                    name="nombre_completo"
                    value={referidoActual.nombre_completo}
                    onChange={handleReferidoChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-blue-200 mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={referidoActual.telefono}
                    onChange={handleReferidoChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-blue-200 mb-2">Estado Civil</label>
                  <select
                    name="estado_civil"
                    value={referidoActual.estado_civil}
                    onChange={handleReferidoChange}
                    className="input-field"
                  >
                    <option value="">Seleccionar</option>
                    <option value="casado">Casado</option>
                    <option value="soltera">Soltera</option>
                    <option value="soltero">Soltero</option>
                    <option value="divorciado">Divorciado</option>
                    <option value="viudo">Viudo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-blue-200 mb-2">Trabajo</label>
                  <input
                    type="text"
                    name="trabajo"
                    value={referidoActual.trabajo}
                    onChange={handleReferidoChange}
                    className="input-field"
                  />
                </div>

 <div>
                  <label className="block text-blue-200 mb-2">Relacion</label>
                  <input
                    type="text"
                    name="relacion"
                    value={referidoActual.relacion}
                    onChange={handleReferidoChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-blue-200 mb-2">Ciudad</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={referidoActual.ciudad}
                    onChange={handleReferidoChange}
                    className="input-field"
                  />
                </div>
            <div>
                  <label className="block text-blue-200 mb-2">Barrio</label>
                  <input
                    type="text"
                    name="barrio_ciudad"
                    value={referidoActual.barrio_ciudad}
                    onChange={handleReferidoChange}
                    className="input-field"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-blue-200 mb-2">¿Por qué lo recomendó?</label>
                  <textarea
                    name="razon_recomendacion"
                    value={referidoActual.razon_recomendacion}
                    onChange={handleReferidoChange}
                    className="input-field min-h-[80px]"
                    rows="2"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={agregarReferido}
                className="gradient-button px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Referido</span>
              </button>

              {/* Lista de Referidos */}
              {referidos.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-white font-medium">Referidos agregados:</h4>
                  {referidos.map((referido, index) => (
                    <div key={index} className="bg-white/5 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{referido.nombre_completo}</p>
                        <p className="text-blue-200 text-sm">{referido.telefono}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarReferido(index)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-red-500 text-red-400 hover:bg-red-500/20 transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 gradient-button px-6 py-3 rounded-xl"
              >
                Guardar Programa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgregarPrograma;
