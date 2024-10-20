import { useFetchVisitas } from "./useFetchVisitas";
import { DashboardVisitas } from "./DashboardVisitas";
import { useState } from "react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { supabase } from "../Functions/CreateClient";

const DashboardAsesor = () => {
  const [showNuevaVisitaForm, setShowNuevaVisitaForm] = useState(false);
  const {
    visitas,
    loading,
    startDate,
    endDate,
    setStartDate,
    setEndDate
  } = useFetchVisitas();
  const MySwal = withReactContent(Swal);

  const handleUpdateVisita = async (estado, visitaId) => {
    const {data, error} = await supabase
      .from("visitas")
      .update({estado})
      .eq("id", visitaId);

    if(error){
      console.error("Error actualizando visita:", error);
      MySwal.fire("Error", "Hubo un problema al actualizar la visita", "error");
    } else {
      MySwal.fire("Excelente", `la visita ha fue marcada como ${estado}, la tele ya conoce esta informacion`, "success");
    }
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="p-4 mt-20">
      <h1 className="text-2xl font-bold mb-4">Dashboard Asesor</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">Visitas Pendientes</h2>
        
        <div className="flex space-x-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha inicial:</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha final:</label>
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
                  <span className="font-bold"> Direccion: </span> {visita.direccion} 
                  <span className="font-bold text-green-500"> Hora: </span> {visita.hora} 
                  <span className="font-bold"> Referido de: </span> {visita.referido} 
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

export default DashboardAsesor