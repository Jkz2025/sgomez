import React, { useState, useEffect } from "react";
import { supabase } from "../Functions/CreateClient";
import { useAuth } from "../../constants/AuthContext";
import { Users, TrendingUp, Calendar } from "lucide-react";

const DashboardDistribuidor = () => {
  const [televentas, setTeleventas] = useState([]);
  const [asesores, setAsesores] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const { session } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
  
      try {
        setIsLoading(true);
  
        // Obtenemos primero el distribuidor
        const { data: distribuidorData, error: distribuidorError } =
          await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
  
        if (distribuidorError) throw distribuidorError;
  
        // Fetch all data in Promise.all
        const [ventasResponse, profilesResponse, citasResponse, visitasResponse] = await Promise.all([
          supabase
            .from("visitas")
            .select("valor_venta")
            .eq("distribuidor", distribuidorData.distribuidor),
          supabase
            .from("profiles")
            .select("*")
            .eq("distribuidor", distribuidorData.distribuidor)
            .in("cargo", ["televentas", "asesor"]),
          supabase
            .from("citas")
            .select("*")
            .eq("distribuidor", distribuidorData.distribuidor),
          supabase
            .from("visitas")
            .select("*")
            .eq("distribuidor", distribuidorData.distribuidor)
        ]);
  
        // Check for errors in each response
        if (ventasResponse.error) throw ventasResponse.error;
        if (profilesResponse.error) throw profilesResponse.error;
        if (citasResponse.error) throw citasResponse.error;
        if (visitasResponse.error) throw visitasResponse.error;
  
        const televentasData = profilesResponse.data.filter(
          (profile) => profile.cargo === "televentas"
        );
        const asesoresData = profilesResponse.data.filter(
          (profile) => profile.cargo === "asesor"
        );
  
        setTeleventas(televentasData);
        setAsesores(asesoresData);
        setVentas(ventasResponse.data || []);
        setCitas(citasResponse.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [session]);

  const getVentasColor = (monto) => {
    if (monto < 3000) return "from-red-800 to-red-600";
    if (monto < 5000) return "from-yellow-800 to-yellow-600";
    if (monto < 10000) return "from-green-800 to-green-600";
    return "from-blue-800 to-blue-600";
  };

  const getCitasColor = (asesor) => {
    const asesorCitas = citas.filter((cita) => cita.asesor_id === asesor.id);
    const pendientes = asesorCitas.filter(
      (cita) => cita.estado === "pendiente"
    ).length;
    const reprogramadas = asesorCitas.filter(
      (cita) => cita.estado === "reprogramar"
    ).length;
    const realizadas = asesorCitas.filter(
      (cita) => cita.estado === "realizada"
    ).length;

    if (pendientes > Math.max(reprogramadas, realizadas))
      return "from-yellow-800 to-yellow-600";
    if (realizadas > Math.max(pendientes, reprogramadas))
      return "from-green-800 to-green-600";
    if (reprogramadas > Math.max(pendientes, realizadas))
      return "from-red-800 to-red-600";
    return "from-blue-800 to-blue-600";
  };

  const getVentasTotal = (asesor) => {
    // Verifica que las fechas sean válidas
    if (!dateRange.startDate || !dateRange.endDate) return 0;

    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    return (
      ventas
        .filter(
          (venta) =>
            venta.asesor_id === asesor.id &&
            new Date(venta.fecha) >= startDate &&
            new Date(venta.fecha) <= endDate
        )
        .reduce((sum, venta) => sum + (venta.valor_venta || 0), 0) / 4000
    ); // Convierte a dólares
  };

  if (error)
    return <div className="text-red-500 text-center p-4">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 mt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">
          Dashboard Distribuidor
        </h1>
        <p className="text-center text-gray-400">Gestión de ventas y citas</p>
      </header>

      {/* Date Range Selector */}
      <div className="flex justify-center space-x-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Fecha Inicial
          </label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="mt-1 bg-gray-900 text-gray-300 border border-gray-600 rounded-md p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Fecha Final
          </label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="mt-1 bg-gray-900 text-gray-300 border border-gray-600 rounded-md p-2 w-full"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-800 to-blue-600 p-6 rounded-lg shadow-md flex items-center">
          <TrendingUp className="w-10 h-10 text-blue-200 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Ventas Totales</h3>
            <p className="text-3xl font-bold">
              $
              {ventas
                .filter(
                  (venta) =>
                    dateRange.startDate &&
                    dateRange.endDate && // Valida el rango
                    new Date(venta.fecha) >= new Date(dateRange.startDate) &&
                    new Date(venta.fecha) <= new Date(dateRange.endDate)
                )
                .reduce((sum, venta) => sum + (venta.valor_venta || 0), 0) /
                (4000) // Convierte a dólares
                  .toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-800 to-green-600 p-6 rounded-lg shadow-md flex items-center">
          <Calendar className="w-10 h-10 text-green-200 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Citas Realizadas</h3>
            <p className="text-3xl font-bold">
              {citas.filter((cita) => cita.estado === "realizada").length}
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-800 to-yellow-600 p-6 rounded-lg shadow-md flex items-center">
          <Users className="w-10 h-10 text-yellow-200 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Citas Pendientes</h3>
            <p className="text-3xl font-bold">
              {citas.filter((cita) => cita.estado === "pendiente").length}
            </p>
          </div>
        </div>
      </div>

      {/* Asesores and Televentas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">Asesores</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {asesores.map((asesor) => {
              const ventasTotal = getVentasTotal(asesor);
              return (
                <div
                  key={asesor.id}
                  className={`bg-gradient-to-br ${getVentasColor(
                    ventasTotal
                  )} ${getCitasColor(asesor)} p-4 rounded-lg shadow-md`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-white">
                        {asesor.nombre}
                      </h3>
                      <p className="text-sm text-gray-200">
                        ID: {asesor.codigo}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">
                        ${ventasTotal.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-200">
                        Citas:{" "}
                        {
                          citas.filter((cita) => cita.asesor_id === asesor.id)
                            .length
                        }
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">Televentas</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {televentas.map((televenta) => (
              <div
                key={televenta.id}
                className="bg-gradient-to-br from-gray-700 to-gray-600 p-4 rounded-lg shadow-md"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-white">
                      {televenta.nombre}
                    </h3>
                    <p className="text-sm text-gray-200">
                      ID: {televenta.codigo}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDistribuidor;
