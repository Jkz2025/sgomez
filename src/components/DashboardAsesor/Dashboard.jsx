import { useFetchVisitas } from "./useFetchVisitas";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { supabase } from "../Functions/CreateClient";
import { useNavigate } from "react-router-dom";

const DashboardAsesor = () => {
  const navigate = useNavigate();
  const [showNuevaVisitaForm, setShowNuevaVisitaForm] = useState(false);
  const [statsHoy, setStatsHoy] = useState({
    realizadas: 0,
    pendientes: 0,
    reprogramadas: 0,
  });
  const {
    visitas,
    loading,
    startDate,
    endDate,
    setStartDate,
    setVisitas,
    setEndDate,
  } = useFetchVisitas();

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    fetchTodayStats();
  }, []);

  const fetchTodayStats = async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data: realizadas } = await supabase
      .from("visitas")
      .select("count")
      .eq("estado", "realizada")
      .eq("fecha", today);

    const { data: pendientes } = await supabase
      .from("visitas")
      .select("count")
      .eq("estado", "pendiente")
      .eq("fecha", today);

    const { data: reprogramadas } = await supabase
      .from("visitas")
      .select("count")
      .eq("estado", "pendiente")
      .eq("fecha", today);

    setStatsHoy({
      realizadas: realizadas?.[0]?.count || 0,
      pendientes: pendientes?.[0]?.count || 0,
      reprogramadas: reprogramadas?.[0]?.count || 0,
    });
  };

  const handleRealizarVisita = async (visita) => {
    // Confirmar inicial
    const confirmResult = await MySwal.fire({
      title: "¿Esta seguro que desea marcar la visita como realizada?",
      showCancelButton: true,
      confirmButtonText: "Si",
      cancelButtonText: "No",
      icon: "question",
    });

    if (!confirmResult.isConfirmed) return;

    // Solicitar observaciones
    const observacionResult = await MySwal.fire({
      title: "Observacion de la visita",
      input: "textarea",
      inputLabel: "Detalles",
      inputPlaceholder: "Escriba los detalles de la visita...",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Por favor ingrese una observacion";
        }
      },
    });

    if (!observacionResult.isConfirmed) return;
    const detalles = observacionResult.value;

    //Preguntar por venta
    const ventaResult = await MySwal.fire({
      title: "¿Hubo venta?",
      showCancelButton: true,
      confirmButtonText: "Si",
      cancelButtonText: "No",
      icon: "question",
    });

    let valorVenta = null;
    if (ventaResult.isConfirmed) {
      const valorResult = await MySwal.fire({
        title: "Valor de la venta",
        input: "number",
        inputLabel: "Por favor indique el valor de la venta",
        inputValidator: (value) => {
          if (!value || value <= 0) {
            return "Por favor ingrese un valor valido";
          }
        },
      });
      if (!valorResult.isConfirmed) return;
      valorVenta = valorResult.value;
    }

    //Actualizar en supabase
    const { error } = await supabase
      .from("visitas")
      .update({
        estado: "realizada",
        detalles: detalles,
        valor_venta: valorVenta,
      })
      .eq("id", visita.id);

    if (error) {
      MySwal.fite("Error", "Hubo un problema al actualizar la visita", "error");
    } else {
      MySwal.fire(
        "Exito",
        "La visita ha sido marcada como realizada",
        "success"
      );
      setVisitas(visitas.filter((v) => v.id !== visita.id));
      fetchTodayStats();
    }
  };

  const handleReprogramarVisita = async (visita) => {
    //Cofirmacion inicial
    const confirmResult = await MySwal.fire({
      title: "¿Esta seguro que desea reprogramar la visita?",
      showCancelButton: true,
      confirmButtonText: "Si",
      cancelButtonText: "No",
      icon: "question",
    });

    if (!confirmResult.isConfirmed) return;

    //Solicitar Motivo
    const motivoResult = await MySwal.fire({
      title: "¿Por que se reprogramo la visita?",
      input: "textarea",
      inputLabel: "Detalles",
      inputPlaceholder: "Escriba el motivo de la reprogramacion...",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Por favor ingrese el motivo";
        }
      },
    });
    if (!motivoResult.isConfirmed) return;

    //Actualizar en Supabase
    const { error } = await supabase
      .from("visitas")
      .update({
        estado: "reprogramada",
        detalles: motivoResult.value,
      })
      .eq("id", visita.id);

    if (error) {
      MySwal.fire(
        "Error",
        "Hubo un problema al reprogramar la visita",
        "error"
      );
    } else {
      MySwal.fire("Exito", "La visita ha sido reprogramada", "success");
      setVisitas(visitas.filter((v) => v.id !== visita.id));
      fetchTodayStats();
    }
  };

  // const handleUpdateVisita = async (estado, visitaId) => {
  //   const { data, error } = await supabase
  //     .from("visitas")
  //     .update({ estado })
  //     .eq("id", visitaId);

  //   if (error) {
  //     console.error("Error actualizando visita:", error);
  //     MySwal.fire("Error", "Hubo un problema al actualizar la visita", "error");
  //   } else {
  //     MySwal.fire(
  //       "Excelente",
  //       `la visita ha fue marcada como ${estado}, la tele ya conoce esta informacion`,
  //       "success"
  //     );
  //   }

  //   setTimeout(() => {}, 2000);
  // };

  return (
    <div className="p-4 mt-20">
      <h1 className="text-2xl font-bold mb-4">Dashboard Asesor</h1>

      {/* Estadisticas diarias  */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h3 className="text-green-800 font-semibold">Visitas Realizadas</h3>
          <p className="text-2xl font-bold text-green-600">
            {statsHoy.realizadas}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow">
          <h3 className="text-yellow-500 font-semibold">Visitas Pendientes</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {statsHoy.pendientes}
          </p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg shadow">
        <h3 className="text-red-800 font-semibold">
    Visitas Reprogramadas
        </h3>
        <p className="text-2xl font-bold text-red-600">
      {statsHoy.reprogramadas}
        </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">Visitas Pendientes</h2>

        <div className="flex space-x-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha inicial:
            </label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha final:
            </label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p>Cargando visitas...</p>
        ) : visitas.length > 0 ? (
          <ul className="space-y-2">
            {visitas.map((visita) => (
              <li key={visita.id} className="border-b pb-2">
                <p className="font-semibold">{visita.cliente}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold"> Cliente: </span> {visita.nombre}
                  <span className="font-bold"> Ciudad: </span> {visita.ciudad}
                  <span className="font-bold"> Barrio: </span> {visita.barrio}
                  <span className="font-bold"> Direccion: </span>{" "}
                  {visita.direccion}
                  <span className="font-bold text-green-500"> Hora: </span>{" "}
                  {visita.hora}
                  <span className="font-bold"> Referido de: </span>{" "}
                  {visita.referido}
                </p>

                <div className="py-2 flex justify-between">
                  <button
                    className="bg-green-400 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-500 transition duration-300 ease-in-out"
                    onClick={() => handleUpdateVisita("realizada", visita.id)}
                  >
                    Realizar
                  </button>
                  <button
                    className="bg-yellow-400 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-yellow-500 transition duration-300 ease-in-out"
                    onClick={() => handleUpdateVisita("realizada", visita.id)}
                  >
                    Reprogramar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay visitas pendientes para este período.</p>
        )}
      </div>
      {/* Formulario de nueva visita */}
      {showNuevaVisitaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">
              Registrar Nueva Visita
            </h2>
            <form onSubmit={handleNuevaVisita} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del Cliente"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="date"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="time"
                className="w-full p-2 border rounded"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Guardar Visita
              </button>
              <button
                type="button"
                onClick={() => setShowNuevaVisitaForm(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded ml-2"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAsesor;
