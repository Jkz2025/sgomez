import { useState } from 'react';
import { supabase } from '../Functions/CreateClient';
import Swal from 'sweetalert2';
import { X, Calendar, Clock, MapPin, Phone, User } from 'lucide-react';

const AgendarCita = ({ onClose, onCitaAgendada }) => {
  const [formData, setFormData] = useState({
    cliente_nombre: '',
    cliente_telefono: '',
    cliente_direccion: '',
    ciudad: '',
    barrio: '',
    fecha: '',
    hora: '',
    notas: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = user?.id;
      if (!userId) throw new Error('No se encontró ID de usuario');

      const { data, error } = await supabase
        .from('visitas')
        .insert({
          asesor: userId,
          cliente_nombre: formData.cliente_nombre,
          cliente_telefono: formData.cliente_telefono,
          cliente_direccion: formData.cliente_direccion,
          ciudad: formData.ciudad,
          barrio: formData.barrio,
          fecha: `${formData.fecha} ${formData.hora}`,
          hora: formData.hora,
          notas: formData.notas,
          estado: 'pendiente'
        });

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Cita agendada',
        text: 'La cita se ha agendado correctamente',
        confirmButtonColor: '#3b82f6'
      });

      if (onCitaAgendada) onCitaAgendada();
      onClose();
    } catch (error) {
      console.error('Error al agendar cita:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agendar la cita',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold gradient-text">Agendar Nueva Cita</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-blue-200" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-200 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  name="cliente_nombre"
                  value={formData.cliente_nombre}
                  onChange={handleChange}
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
                  value={formData.cliente_telefono}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-blue-200 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Dirección
              </label>
              <input
                type="text"
                name="cliente_direccion"
                value={formData.cliente_direccion}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-200 mb-2">Ciudad</label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-blue-200 mb-2">Barrio</label>
                <input
                  type="text"
                  name="barrio"
                  value={formData.barrio}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-200 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fecha
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-blue-200 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Hora
                </label>
                <input
                  type="time"
                  name="hora"
                  value={formData.hora}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-blue-200 mb-2">Notas adicionales</label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                className="input-field min-h-[100px]"
                rows="3"
              />
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
                Agendar Cita
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgendarCita;
