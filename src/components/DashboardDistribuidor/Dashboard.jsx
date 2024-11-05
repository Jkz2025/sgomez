import React, { useState, useEffect } from 'react';
import { supabase } from '../Functions/CreateClient';
import { useAuth } from '../../constants/AuthContext';

const DashboardDistribuidor = () => {
  const [televentas, setTeleventas] = useState([]);
  const [asesores, setAsesores] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const { session } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);

        // Obtener el perfil del distribuidor
        const { data: distribuidorData, error: distribuidorError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (distribuidorError) throw distribuidorError;

        // Obtener perfiles y ventas
        const [profilesResponse, ventasResponse, citasResponse] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('distribuidor', distribuidorData.distribuidor)
            .in('cargo', ['televentas', 'asesor']),
          supabase
            .from('visitas')
            .select('*')
            .eq('distribucion', distribuidorData.distribuidor),
          supabase
            .from('citas')
            .select('*')
            .eq('distribucion', distribuidorData.distribuidor)
        ]);

        const televentasData = profilesResponse.data.filter(profile => profile.cargo === 'televentas');
        const asesoresData = profilesResponse.data.filter(profile => profile.cargo === 'asesor');

        setTeleventas(televentasData);
        setAsesores(asesoresData);
        setVentas(ventasResponse.data || []);
        setCitas(citasResponse.data || []);

      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const getVentasColor = (monto) => {
    if (monto < 3000) return 'bg-red-100';
    if (monto < 5000) return 'bg-yellow-100';
    if (monto < 10000) return 'bg-green-100';
    return 'bg-amber-100';
  };

  const getCitasColor = (asesor) => {
    const asesorCitas = citas.filter(cita => cita.asesor_id === asesor.id);
    const pendientes = asesorCitas.filter(cita => cita.estado === 'pendiente').length;
    const reprogramadas = asesorCitas.filter(cita => cita.estado === 'reprogramar').length;
    const realizadas = asesorCitas.filter(cita => cita.estado === 'realizada').length;

    if (pendientes > Math.max(reprogramadas, realizadas)) return 'bg-yellow-100';
    if (realizadas > Math.max(pendientes, reprogramadas)) return 'bg-green-100';
    if (reprogramadas > Math.max(pendientes, realizadas)) return 'bg-red-100';
    return '';
  };

  const getVentasTotal = (asesor) => {
    return ventas
      .filter(venta => venta.asesor_id === asesor.id)
      .reduce((sum, venta) => sum + (venta.ventas || 0), 0);
  };



  if (error) return (
    <div className="text-red-500 text-center p-4">
      Error: {error}
    </div>
  );

  return (
    <div className="p-6 space-y-6 mt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Distribuidor</h1>
        <div className="flex gap-4">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="border rounded px-2 py-1"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
          <h2 className="text-xl font-bold">Asesores</h2>
          <div className="overflow-y-auto max-h-[400px]">
            {asesores.map(asesor => {
              const ventasTotal = getVentasTotal(asesor);
              return (
                <div
                  key={asesor.id}
                  className={`p-4 rounded-lg ${getVentasColor(ventasTotal)} ${getCitasColor(asesor)}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{asesor.nombre}</h3>
                      <p className="text-sm text-gray-600">ID: {asesor.codigo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${ventasTotal.toLocaleString()}</p>
                      <p className="text-sm">
                        Citas: {citas.filter(cita => cita.asesor_id === asesor.id).length}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
          <h2 className="text-xl font-bold">Televentas</h2>
          <div className="overflow-y-auto max-h-[400px]">
            {televentas.map(televenta => (
              <div key={televenta.id} className="p-4 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{televenta.nombre}</h3>
                    <p className="text-sm text-gray-600">ID: {televenta.codigo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        <h2 className="text-xl font-bold">Resumen de Ventas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-100">
            <h3 className="font-semibold">Ventas Totales</h3>
            <p className="text-2xl font-bold">
              ${ventas.reduce((sum, venta) => sum + (venta.ventas || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-green-100">
            <h3 className="font-semibold">Citas Realizadas</h3>
            <p className="text-2xl font-bold">
              {citas.filter(cita => cita.estado === 'realizada').length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-yellow-100">
            <h3 className="font-semibold">Citas Pendientes</h3>
            <p className="text-2xl font-bold">
              {citas.filter(cita => cita.estado === 'pendiente').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDistribuidor;