import { useState } from 'react';
import { supabase } from '../Functions/CreateClient';
import Swal from 'sweetalert2';
import { X, User, Phone, MapPin, Mail, Building2, Calendar } from 'lucide-react';

const AgregarCliente = ({ onClose, onClienteAgregado }) => {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    barrio: '',
    correo: '',
    trabajo: '',
    fecha_nacimiento: '',
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

      const { error } = await supabase
        .from('clientes')
        .insert({
          asesor_id: userId,
          nombre_completo: formData.nombre_completo,
          telefono: formData.telefono,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          barrio: formData.barrio,
          correo: formData.correo,
          trabajo: formData.trabajo,
          fecha_nacimiento: formData.fecha_nacimiento,
          notas: formData.notas
        });

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Cliente agregado',
        text: 'El cliente se ha agregado correctamente',
        confirmButtonColor: '#3b82f6'
      });

      if (onClienteAgregado) onClienteAgregado();
      onClose();
    } catch (error) {
      console.error('Error al agregar cliente:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar el cliente',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold gradient-text flex items-center">
              <User className="w-6 h-6 mr-2" />
              Agregar Nuevo Cliente
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-blue-200" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-blue-200 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-blue-200 mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-blue-200 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-blue-200 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-blue-200 mb-2">Ciudad</label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="input-field"
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
                />
              </div>

              <div>
                <label className="block text-blue-200 mb-2 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  Trabajo
                </label>
                <input
                  type="text"
                  name="trabajo"
                  value={formData.trabajo}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-blue-200 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-blue-200 mb-2">Notas Adicionales</label>
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  className="input-field min-h-[100px]"
                  rows="3"
                  placeholder="Información adicional sobre el cliente..."
                />
              </div>
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
                Agregar Cliente
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgregarCliente;
