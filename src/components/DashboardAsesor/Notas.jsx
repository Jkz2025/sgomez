import { useState, useEffect } from 'react';
import { supabase } from '../Functions/CreateClient';
import { X, StickyNote, Plus, Trash2, Edit2, Save, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

const Notas = ({ onClose }) => {
  const [notas, setNotas] = useState([]);
  const [nuevaNota, setNuevaNota] = useState({ titulo: '', contenido: '', categoria: 'general' });
  const [editandoNota, setEditandoNota] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotas();
  }, []);

  const fetchNotas = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = user?.id;
      if (!userId) throw new Error('No se encontró ID de usuario');

      const { data, error } = await supabase
        .from('notas')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotas(data || []);
    } catch (error) {
      console.error('Error al cargar notas:', error);
    } finally {
      setLoading(false);
    }
  };

  const crearNota = async () => {
    if (!nuevaNota.titulo.trim() || !nuevaNota.contenido.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor complete el título y contenido de la nota',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = user?.id;
      if (!userId) throw new Error('No se encontró ID de usuario');

      const { error } = await supabase
        .from('notas')
        .insert({
          usuario_id: userId,
          titulo: nuevaNota.titulo,
          contenido: nuevaNota.contenido,
          categoria: nuevaNota.categoria
        });

      if (error) throw error;

      setNuevaNota({ titulo: '', contenido: '', categoria: 'general' });
      await fetchNotas();
      
      Swal.fire({
        icon: 'success',
        title: 'Nota creada',
        text: 'La nota se ha creado correctamente',
        confirmButtonColor: '#3b82f6'
      });
    } catch (error) {
      console.error('Error al crear nota:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear la nota',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const actualizarNota = async () => {
    if (!editandoNota) return;

    try {
      const { error } = await supabase
        .from('notas')
        .update({
          titulo: editandoNota.titulo,
          contenido: editandoNota.contenido,
          categoria: editandoNota.categoria
        })
        .eq('id', editandoNota.id);

      if (error) throw error;

      setEditandoNota(null);
      await fetchNotas();
      
      Swal.fire({
        icon: 'success',
        title: 'Nota actualizada',
        text: 'La nota se ha actualizado correctamente',
        confirmButtonColor: '#3b82f6'
      });
    } catch (error) {
      console.error('Error al actualizar nota:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la nota',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const eliminarNota = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!isConfirmed) return;

    try {
      const { error } = await supabase
        .from('notas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchNotas();
      
      Swal.fire({
        icon: 'success',
        title: 'Nota eliminada',
        text: 'La nota se ha eliminado correctamente',
        confirmButtonColor: '#3b82f6'
      });
    } catch (error) {
      console.error('Error al eliminar nota:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la nota',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const categorias = ['general', 'cita', 'cliente', 'programa', 'recordatorio'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold gradient-text flex items-center">
              <StickyNote className="w-6 h-6 mr-2" />
              Notas
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-blue-200" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Crear nueva nota */}
          <div className="glass-card-dark p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-green-400" />
              Nueva Nota
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-200 mb-2">Título</label>
                  <input
                    type="text"
                    value={nuevaNota.titulo}
                    onChange={(e) => setNuevaNota({ ...nuevaNota, titulo: e.target.value })}
                    className="input-field"
                    placeholder="Título de la nota"
                  />
                </div>
                <div>
                  <label className="block text-blue-200 mb-2">Categoría</label>
                  <select
                    value={nuevaNota.categoria}
                    onChange={(e) => setNuevaNota({ ...nuevaNota, categoria: e.target.value })}
                    className="input-field"
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-blue-200 mb-2">Contenido</label>
                <textarea
                  value={nuevaNota.contenido}
                  onChange={(e) => setNuevaNota({ ...nuevaNota, contenido: e.target.value })}
                  className="input-field min-h-[100px]"
                  placeholder="Escribe tu nota aquí..."
                  rows="3"
                />
              </div>
              <button
                onClick={crearNota}
                className="gradient-button px-6 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nota</span>
              </button>
            </div>
          </div>

          {/* Lista de notas */}
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : notas.length === 0 ? (
            <div className="text-center py-12">
              <StickyNote className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-200 text-lg">No hay notas creadas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notas.map((nota) => (
                <div key={nota.id} className="glass-card p-4">
                  {editandoNota?.id === nota.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editandoNota.titulo}
                        onChange={(e) => setEditandoNota({ ...editandoNota, titulo: e.target.value })}
                        className="input-field text-sm"
                      />
                      <select
                        value={editandoNota.categoria}
                        onChange={(e) => setEditandoNota({ ...editandoNota, categoria: e.target.value })}
                        className="input-field text-sm"
                      >
                        {categorias.map(cat => (
                          <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                      </select>
                      <textarea
                        value={editandoNota.contenido}
                        onChange={(e) => setEditandoNota({ ...editandoNota, contenido: e.target.value })}
                        className="input-field min-h-[80px] text-sm"
                        rows="3"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={actualizarNota}
                          className="flex-1 gradient-button py-2 rounded-lg text-sm flex items-center justify-center space-x-1"
                        >
                          <Save className="w-4 h-4" />
                          <span>Guardar</span>
                        </button>
                        <button
                          onClick={() => setEditandoNota(null)}
                          className="px-4 py-2 rounded-lg border-2 border-red-500 text-red-400 hover:bg-red-500/20 transition-all duration-300 text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{nota.titulo}</h4>
                        <span className="text-xs bg-blue-600/30 text-blue-200 px-2 py-1 rounded">
                          {nota.categoria}
                        </span>
                      </div>
                      <p className="text-blue-200 text-sm mb-3 line-clamp-3">{nota.contenido}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-blue-300">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(nota.created_at).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditandoNota(nota)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => eliminarNota(nota.id)}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </>
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

export default Notas;
