import React, { useState, useEffect } from 'react';
import { supabase } from '../Functions/CreateClient';
import { useAuth } from '../../constants/AuthContext';
// Inicializar el cliente de Supabase (reemplaza con tus propias credenciales)

const DashboardDistribuidor = () => {
  const [televentas, setTeleventas] = useState([]);
  const [asesores, setAsesores] = useState([]);
  const [distribuidores, setDistribuidores] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { session } = useAuth()

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);

        // Primero, obtén el perfil del distribuidor actual
        const { data: distribuidorData, error: distribuidorError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (distribuidorError) throw distribuidorError;

        // Luego, obtén los perfiles de televentas y asesores asociados a este distribuidor
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('distribuidor', distribuidorData.distribuidor)
          .in('cargo', ['televentas', 'asesor']);
        
        if (error) throw error;

        // Separar los perfiles por cargo
        const televentasData = data.filter(profile => profile.cargo === 'televentas');
        const asesoresData = data.filter(profile => profile.cargo === 'asesor');

        setTeleventas(televentasData);
        setAsesores(asesoresData);

      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [session]);

  const crearGrupo = () => {
    // Lógica para crear un grupo
  };

  if (isLoading) return <div className="text-center mt-8">Cargando...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Distribuidor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Televentas y Asesores</h2>
          <div className="mb-4">
            <h3 className="font-semibold">Televentas ({televentas.length})</h3>
            <ul className="list-disc pl-5">
              {televentas.map(tv => (
                <li key={tv.id}>{tv.nombre}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Asesores ({asesores.length})</h3>
            <ul className="list-disc pl-5">
              {asesores.map(asesor => (
                <li key={asesor.id}>{asesor.nombre}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Crear Grupo</h2>
          <button
            onClick={crearGrupo}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Crear Grupo
          </button>
        </div>
        <div className="bg-white p-4 rounded shadow md:col-span-2">
          <h2 className="text-xl font-semibold mb-2">Ventas y Citas Generales</h2>
          {/* Aquí puedes agregar una tabla o lista de ventas y citas */}
          <p>Implementar tabla de ventas y citas aquí</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardDistribuidor;