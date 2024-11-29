import React, { useState, useEffect } from "react";
import { supabase } from "../Functions/CreateClient";
import { useAuth } from "../../constants/AuthContext";
import { 
  Calendar, 
  UserPlus, 
  CheckSquare, 
  RefreshCw, 
  Edit2 
} from "lucide-react";
const DashboardTeleventas = () => {
  const [asesores, setAsesores] = useState([]);
  const [visitas, setVisitas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    asesor: "",
    nombre: "",
    direccion: "",
    telefono: "",
    barrio: "",
    ciudad: "",
    referido: "",
    fecha: "",
    hora: "",
    calificacion: "",
    tipoVisita: "",
    detalles: "",
  });
  const [activeTab, setActiveTab] = useState("pendientes");
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [editingVisita, setEditingVisita] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const { session } = useAuth();

  useEffect(() => {
    fetchAsesores();
    fetchVisitas();
  }, [session, filterMonth, filterYear]);

  const fetchAsesores = async () => {
    if (!session?.user?.id) return;

    try {
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("distribuidor")
        .eq("id", session.user.id)
        .single();

      if (userError) throw userError;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("distribuidor", userData.distribuidor)
        .eq("cargo", "asesor");

      if (error) throw error;
      setAsesores(data);
    } catch (error) {
      console.error("Error fetching asesores:", error);
    }
  };

  const fetchVisitas = async () => {
    if (!session?.user?.id) return;

    try {
      const startDate = new Date(filterYear, filterMonth, 1);
      const endDate = new Date(filterYear, filterMonth + 1, 0);

      const { data, error } = await supabase
        .from("visitas")
        .select("*")
        .eq("televentas_id", session.user.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (error) throw error;
      setVisitas(data);
    } catch (error) {
      console.error("Error fetching visitas:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'asesor') {
      const selectedAsesor = asesores.find(asesor => asesor.id === value);
      const asesorName = selectedAsesor ? `${selectedAsesor.nombre} ${selectedAsesor.apellido}` : "";
      setFormData(prev => ({ ...prev, asesor: value, asesor_name: asesorName })); // Asegúrate de que asesor_name se establece correctamente
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validar campos vacíos
      const requiredFields = [
        'asesor', 'nombre', 'ciudad', 'direccion', 
        'telefono', 'fecha', 'hora', 'tipoVisita'
      ];
      
      const emptyFields = requiredFields.filter(field => !formData[field]);
      
      if (emptyFields.length > 0) {
        setFormError("Por favor completa todos los campos obligatorios");
        return;
      }
  
      // Validar estado para visitas reprogramadas
      if (editingVisita?.estado === "reprogramar" && formData.estado === "seleccionar") {
        setFormError("Por favor selecciona un estado (pendiente o cliente no interesado).");
        return;
      }
  
         // Fetch the distributor for the current user
    const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("distribuidor")
    .eq("id", session.user.id)
    .single();

  if (userError) throw userError;

  let result;
  
  if (editingVisita) {
    // Actualizar visita existente
    result = await supabase
      .from("visitas")
      .update({
        ...formData,
        updated_at: new Date().toISOString()
      })
      .eq("id", editingVisita.id);
  } else {
    // Crear nueva visita
    result = await supabase
      .from("visitas")
      .insert({
        ...formData,
        televentas_id: session.user.id,
        asesor_name: formData.asesor_name,
        estado: "pendiente",
        distribuidor: userData.distribuidor, // Insertar el distribuidor aquí
        created_at: new Date().toISOString()
      });
  }
  
      if (result.error) throw result.error;
  
      // Mostrar mensaje de éxito
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Limpiar formulario y estados
      setShowForm(false);
      setFormData({
        asesor: "",
        asesor_name: "",
        nombre: "",
        direccion: "",
        telefono: "",
        barrio: "",
        ciudad: "",
        referido: "",
        fecha: "",
        hora: "",
        calificacion: "",
        tipoVisita: "",
        detalles: "",
      });
      setEditingVisita(null);
      setFormError("");
      
      // Recargar visitas
      await fetchVisitas();
      
    } catch (error) {
      console.error("Error al guardar la visita:", error);
      setFormError("Hubo un error al guardar la visita. Por favor intenta de nuevo.");
    }
  };

  const handleEdit = (visita) => {
    setEditingVisita(visita);
    setFormData({
      ...visita,
      estado: visita.estado || 'seleccionar',  // Agregar un valor por defecto si no existe
    });
    setShowForm(true);
  };

  const handleReprogramar = async (visita) => {
    if (window.confirm("¿Está seguro que desea reprogramar esta visita?")) {
      try {
        const { data, error } = await supabase
          .from("visitas")
          .update({ estado: "reprogramar" })
          .eq("id", visita.id);

        if (error) throw error;
        setShowForm(false);
        fetchVisitas();
      } catch (error) {
        console.error("Error reprogramando visita:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 mt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">Dashboard Televentas</h1>
        <p className="text-center text-gray-400">Gestión de visitas y asesores</p>
      </header>

      {/* Stats Cards */}
       {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-800 to-green-600 p-6 rounded-lg shadow-md flex items-center">
          <UserPlus className="w-10 h-10 text-green-200 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Total Asesores</h3>
            <p className="text-3xl font-bold">{asesores.length}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-800 to-blue-600 p-6 rounded-lg shadow-md flex items-center">
          <Calendar className="w-10 h-10 text-blue-200 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Visitas Pendientes</h3>
            <p className="text-3xl font-bold">
              {visitas.filter(v => v.estado === 'pendiente').length}
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-800 to-yellow-600 p-6 rounded-lg shadow-md flex items-center">
          <RefreshCw className="w-10 h-10 text-yellow-200 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Visitas Reprogramadas</h3>
            <p className="text-3xl font-bold">
              {visitas.filter(v => v.estado === 'reprogramar').length}
            </p>
          </div>
        </div>
      </div>

      {/* Visits Table and Form */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Gestión de Visitas</h2>
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center"
          >
            <UserPlus className="mr-2" /> Crear Nueva Visita
          </button>
        

        </div>
        {showForm && (
  <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
    <select
      name="asesor"
      value={formData.asesor}
      onChange={handleInputChange}
      className="mb-4 w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
    >
      <option value="">Seleccione un asesor</option>
      {asesores.map((asesor) => (
        <option key={asesor.id} value={asesor.id}>
          {asesor.nombre} {asesor.apellido}
        </option>
      ))}
    </select>
    <input
      type="text"
      name="nombre"
      placeholder="Nombre Cliente"
      value={formData.nombre}
      onChange={handleInputChange}
      className="mb-4 w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
    />
    <input
      type="text"
      name="ciudad"
      placeholder="Ciudad"
      value={formData.ciudad}
      onChange={handleInputChange}
      className="mb-4 w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
    />
    <input
      type="text"
      name="direccion"
      placeholder="Dirección"
      value={formData.direccion}
      onChange={handleInputChange}
      className="mb-4 w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
    />
    <input
      type="text"
      name="barrio"
      placeholder="Barrio"
      value={formData.barrio}
      onChange={handleInputChange}
      className="mb-4 w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
    />
    <input
      type="tel"
      name="telefono"
      placeholder="Teléfono"
      value={formData.telefono}
      onChange={handleInputChange}
      className="mb-4 w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
    />
    <input
      type="text"
      name="referido"
      placeholder="Referido de"
      value={formData.referido}
      onChange={handleInputChange}
      className="mb-4 w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
    />
    <input
      type="date"
      name="fecha"
      value={formData.fecha}
      onChange={handleInputChange}
      className="mb-4 w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
    />
    <input
      type="time"
      name="hora"
      value={formData.hora}
      onChange={handleInputChange}
      className="mb-4 w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
    />
    <input
      type="text"
      name="calificacion"
      placeholder="Calificación"
      value={formData.calificacion}
      onChange={handleInputChange}
      className="mb-4 w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
    />
    <div className="mb-4">
      <label className="mr-4 text-white">
        <input
          type="radio"
          name="tipoVisita"
          value="demostracion"
          checked={formData.tipoVisita === "demostracion"}
          onChange={handleInputChange}
          className="text-white"
        />{" "}
        Demostración
      </label>
      <label className="mr-4 text-white">
        <input
          type="radio"
          name="tipoVisita"
          value="mantenimiento"
          checked={formData.tipoVisita === "mantenimiento"}
          onChange={handleInputChange}
          className="text-white"
        />{" "}
        Mantenimiento
      </label>
      <label className="text-white">
        <input
          type="radio"
          name="tipoVisita"
          value="servicioInicial"
          checked={formData.tipoVisita === "servicioInicial"}
          onChange={handleInputChange}
          className="text-white"
        />{" "}
        Servicio Inicial
      </label>
    </div>
    {(formData.tipoVisita === "demostracion" ||
      formData.tipoVisita === "mantenimiento") && (
      <textarea
        name="detalles"
        placeholder="Detalles"
        value={formData.detalles}
        onChange={handleInputChange}
        className="mb-4 w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
      ></textarea>
    )}
    {editingVisita?.estado === "reprogramar" && (
      <div className="mb-4">
        <label className="text-white"> Cambiar Estado:</label>
        <select
          name="estado"
          value={formData.estado}
          onChange={handleInputChange}
          className="mb-4 w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
        >
          <option value="seleccionar">Seleccionar estado</option>
          <option value="pendiente">Pendiente</option>
          <option value="cliente_no_interesado">Cliente no interesado</option>
        </select>
      </div>
    )}
    <div>
      <button
        type="submit"
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
      >
        {editingVisita ? "Actualizar" : "Guardar"}
      </button>
      <button
        type="button"
        onClick={() => {
          setShowForm(false);
          setEditingVisita(null);
        }}
        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
      >
        Cancelar
      </button>
    </div>
  </form>
)}

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          {['pendientes', 'realizadas', 'reprogramar'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${
                activeTab === tab 
                  ? 'text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'pendientes' ? 'Pendientes' : 
               tab === 'realizadas' ? 'Realizadas' : 
               'Reprogramar'}
            </button>
          ))}
        </div>

        {/* Visits List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visitas
            .filter((visita) => {
              if (activeTab === "pendientes")
                return visita.estado === "pendiente";
              if (activeTab === "realizadas")
                return visita.estado === "realizada";
              if (activeTab === "reprogramar")
                return visita.estado === "reprogramar";
              return false;
            })
            .map((visita) => (
              <div 
                key={visita.id} 
                className={`p-4 rounded-lg 
                  ${visita.estado === 'pendiente' ? 'bg-blue-900/30' : 
                    visita.estado === 'realizada' ? 'bg-green-900/30' : 
                    'bg-yellow-900/30'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">{visita.nombre}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold 
                    ${visita.estado === 'pendiente' ? 'bg-blue-500/50' : 
                      visita.estado === 'realizada' ? 'bg-green-500/50' : 
                      'bg-yellow-500/50'}`}>
                    {visita.estado}
                  </span>
                </div>
                <div className="space-y-1 text-gray-300">
                  <p><span className="font-medium text-gray-400">Asesor:</span> {visita.asesor_name}</p>
                  <p><span className="font-medium text-gray-400">Fecha:</span> {visita.fecha}</p>
                  <p><span className="font-medium text-gray-400">Hora:</span> {visita.hora}</p>
                  <p><span className="font-medium text-gray-400">Dirección:</span> {visita.direccion}</p>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => handleEdit(visita)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg px-3 py-2 flex items-center"
                  >
                    <Edit2 className="mr-2 w-4 h-4" /> Editar
                  </button>
                  <button 
                    onClick={() => handleReprogramar(visita)}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2 flex items-center"
                  >
                    <RefreshCw className="mr-2 w-4 h-4" /> Reprogramar
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardTeleventas;

// VIEJO ANTIGUO

// import React, { useState, useEffect } from "react";
// import { supabase } from "../Functions/CreateClient";
// import { useAuth } from "../../constants/AuthContext";

// const DashboardTeleventas = () => {
//   const [asesores, setAsesores] = useState([]);
//   const [visitas, setVisitas] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [formData, setFormData] = useState({
//     asesor: "",
//     nombre: "",
//     direccion: "",
//     telefono: "",
//     barrio: "",
//     ciudad: "",
//     referido: "",
//     fecha: "",
//     hora: "",
//     calificacion: "",
//     tipoVisita: "",
//     detalles: "",
//   });
//   const [activeTab, setActiveTab] = useState("pendientes");
//   const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
//   const [filterYear, setFilterYear] = useState(new Date().getFullYear());
//   const [editingVisita, setEditingVisita] = useState(null);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [formError, setFormError] = useState("");

//   const { session } = useAuth();

//   useEffect(() => {
//     fetchAsesores();
//     fetchVisitas();
//   }, [session, filterMonth, filterYear]);

//   const fetchAsesores = async () => {
//     if (!session?.user?.id) return;

//     try {
//       const { data: userData, error: userError } = await supabase
//         .from("profiles")
//         .select("distribuidor")
//         .eq("id", session.user.id)
//         .single();

//       if (userError) throw userError;

//       const { data, error } = await supabase
//         .from("profiles")
//         .select("*")
//         .eq("distribuidor", userData.distribuidor)
//         .eq("cargo", "asesor");

//       if (error) throw error;
//       setAsesores(data);
//     } catch (error) {
//       console.error("Error fetching asesores:", error);
//     }
//   };

//   const fetchVisitas = async () => {
//     if (!session?.user?.id) return;

//     try {
//       const startDate = new Date(filterYear, filterMonth, 1);
//       const endDate = new Date(filterYear, filterMonth + 1, 0);

//       const { data, error } = await supabase
//         .from("visitas")
//         .select("*")
//         .eq("televentas_id", session.user.id)
//         .gte("created_at", startDate.toISOString())
//         .lte("created_at", endDate.toISOString());

//       if (error) throw error;
//       setVisitas(data);
//     } catch (error) {
//       console.error("Error fetching visitas:", error);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (name === 'asesor') {
//       const selectedAsesor = asesores.find(asesor => asesor.id === value);
//       const asesorName = selectedAsesor ? `${selectedAsesor.nombre} ${selectedAsesor.apellido}` : "";
//       setFormData(prev => ({ ...prev, asesor: value, asesor_name: asesorName })); // Asegúrate de que asesor_name se establece correctamente
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       // Validar campos vacíos
//       const requiredFields = [
//         'asesor', 'nombre', 'ciudad', 'direccion', 
//         'telefono', 'fecha', 'hora', 'tipoVisita'
//       ];
      
//       const emptyFields = requiredFields.filter(field => !formData[field]);
      
//       if (emptyFields.length > 0) {
//         setFormError("Por favor completa todos los campos obligatorios");
//         return;
//       }
  
//       // Validar estado para visitas reprogramadas
//       if (editingVisita?.estado === "reprogramar" && formData.estado === "seleccionar") {
//         setFormError("Por favor selecciona un estado (pendiente o cliente no interesado).");
//         return;
//       }
  
//       let result;
      
//       if (editingVisita) {
//         // Actualizar visita existente
//         result = await supabase
//           .from("visitas")
//           .update({
//             ...formData,
//             updated_at: new Date().toISOString()
//           })
//           .eq("id", editingVisita.id);
//       } else {
//         // Crear nueva visita
//         result = await supabase
//           .from("visitas")
//           .insert({
//             ...formData,
//             televentas_id: session.user.id,
//             asesor_name: formData.asesor_name,
//             estado: "pendiente",
//             created_at: new Date().toISOString()
//           });
//       }
  
//       if (result.error) throw result.error;
  
//       // Mostrar mensaje de éxito
//       setShowSuccess(true);
//       setTimeout(() => setShowSuccess(false), 3000);
      
//       // Limpiar formulario y estados
//       setShowForm(false);
//       setFormData({
//         asesor: "",
//         asesor_name: "",
//         nombre: "",
//         direccion: "",
//         telefono: "",
//         barrio: "",
//         ciudad: "",
//         referido: "",
//         fecha: "",
//         hora: "",
//         calificacion: "",
//         tipoVisita: "",
//         detalles: "",
//       });
//       setEditingVisita(null);
//       setFormError("");
      
//       // Recargar visitas
//       await fetchVisitas();
      
//     } catch (error) {
//       console.error("Error al guardar la visita:", error);
//       setFormError("Hubo un error al guardar la visita. Por favor intenta de nuevo.");
//     }
//   };

//   const handleEdit = (visita) => {
//     setEditingVisita(visita);
//     setFormData({
//       ...visita,
//       estado: visita.estado || 'seleccionar',  // Agregar un valor por defecto si no existe
//     });
//     setShowForm(true);
//   };

//   const handleReprogramar = async (visita) => {
//     if (window.confirm("¿Está seguro que desea reprogramar esta visita?")) {
//       try {
//         const { data, error } = await supabase
//           .from("visitas")
//           .update({ estado: "reprogramar" })
//           .eq("id", visita.id);

//         if (error) throw error;
//         setShowForm(false);
//         fetchVisitas();
//       } catch (error) {
//         console.error("Error reprogramando visita:", error);
//       }
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen mt-12 p-4">
//       <div className="container mx-auto p-4">
//         <h1 className="text-2xl font-bold mb-4">Dashboard Televentas</h1>

//         <button
//           onClick={() => setShowForm(true)}
//           className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
//         >
//           Crear Visita
//         </button>

//         {showForm && (
//           <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded">
//             <select
//               name="asesor"
//               value={formData.asesor}
//               onChange={handleInputChange}
//               className="mb-2 w-full p-2 border rounded"
//             >
//               <option value="">Seleccione un asesor</option>
//               {asesores.map((asesor) => (
//                 <option key={asesor.id} value={asesor.id}>
//                   {asesor.nombre} {asesor.apellido}
//                 </option>
//               ))}
//             </select>
//             <input
//               type="text"
//               name="nombre"
//               placeholder="Nombre Cliente"
//               value={formData.nombre}
//               onChange={handleInputChange}
//               className="mb-2 w-full p-2 border rounded"
//             />
//             <input
//               type="text"
//               name="ciudad"
//               placeholder="Ciudad"
//               value={formData.ciudad}
//               onChange={handleInputChange}
//               className="mb-2 w-full p-2 border rounded"
//             />
//             <input
//               type="text"
//               name="direccion"
//               placeholder="Dirección"
//               value={formData.direccion}
//               onChange={handleInputChange}
//               className="mb-2 w-full p-2 border rounded"
//             />
//             <input
//               type="text"
//               name="barrio"
//               placeholder="Barrio"
//               value={formData.barrio}
//               onChange={handleInputChange}
//               className="mb-2 w-full p-2 border rounded"
//             />
//             <input
//               type="tel"
//               name="telefono"
//               placeholder="Teléfono"
//               value={formData.telefono}
//               onChange={handleInputChange}
//               className="mb-2 w-full p-2 border rounded"
//             />

//             <input
//               type="text"
//               name="referido"
//               placeholder="Referido de"
//               value={formData.referido}
//               onChange={handleInputChange}
//               className="mb-2 w-full p-2 border rounded"
//             />
//             <input
//               type="date"
//               name="fecha"
//               value={formData.fecha}
//               onChange={handleInputChange}
//               className="mb-2 w-full p-2 border rounded"
//             />
//             <input
//               type="time"
//               name="hora"
//               value={formData.hora}
//               onChange={handleInputChange}
//               className="mb-2 w-full p-2 border rounded"
//             />
//             <input
//               type="text"
//               name="calificacion"
//               placeholder="Calificación"
//               value={formData.calificacion}
//               onChange={handleInputChange}
//               className="mb-2 w-full p-2 border rounded"
//             />
//             <div className="mb-2">
//               <label className="mr-2">
//                 <input
//                   type="radio"
//                   name="tipoVisita"
//                   value="demostracion"
//                   checked={formData.tipoVisita === "demostracion"}
//                   onChange={handleInputChange}
//                 />{" "}
//                 Demostración
//               </label>
//               <label className="mr-2">
//                 <input
//                   type="radio"
//                   name="tipoVisita"
//                   value="mantenimiento"
//                   checked={formData.tipoVisita === "mantenimiento"}
//                   onChange={handleInputChange}
//                 />{" "}
//                 Mantenimiento
//               </label>
//               <label>
//                 <input
//                   type="radio"
//                   name="tipoVisita"
//                   value="servicioInicial"
//                   checked={formData.tipoVisita === "servicioInicial"}
//                   onChange={handleInputChange}
//                 />{" "}
//                 Servicio Inicial
//               </label>
//             </div>
//             {(formData.tipoVisita === "demostracion" ||
//               formData.tipoVisita === "mantenimiento") && (
//               <textarea
//                 name="detalles"
//                 placeholder="Detalles"
//                 value={formData.detalles}
//                 onChange={handleInputChange}
//                 className="mb-2 w-full p-2 border rounded"
//               ></textarea>
//             )}
//             {editingVisita?.estado === "reprogramar" && (
//               <div className="mb-2">
//                 <label> Cambiar Estado:</label>
//                 <select
//                   name="estado"
//                   value={formData.estado}
//                   onChange={handleInputChange}
//                   className="mb-2 w-full p-2 border rounded"
//                 >
//                   <option  value="seleccionar">
//                     Seleccionar estado
//                   </option>
//                   <option value="pendiente">Pendiente</option>
//                   <option value="cliente_no_interesado">
//                     Cliente no interesado
//                   </option>
//                 </select>
//               </div>
//             )}
//             <div>
//               <button
//                 type="submit"
//                 className="bg-green-500 text-white px-4 py-2 rounded mr-2"
//               >
//                 {editingVisita ? "Actualizar" : "Guardar"}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowForm(false);
//                   setEditingVisita(null);
//                 }}
//                 className="bg-red-500 text-white px-4 py-2 rounded"
//               >
//                 Cancelar
//               </button>
//             </div>
//           </form>
//         )}

//         {showSuccess && (
//           <div
//             className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
//             role="alert"
//           >
//             <strong className="font-bold">¡Éxito!</strong>
//             <span className="block sm:inline">
//               {" "}
//               La visita se ha {editingVisita ? "actualizado" : "guardado"}{" "}
//               correctamente.
//             </span>
//           </div>
//         )}

//         <div className="mb-4">
//           <button
//             onClick={() => setActiveTab("pendientes")}
//             className={`mr-2 px-4 py-2 rounded ${
//               activeTab === "pendientes"
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-200"
//             }`}
//           >
//             Visitas Pendientes
//           </button>
//           <button
//             onClick={() => setActiveTab("realizadas")}
//             className={`mr-2 px-4 py-2 rounded ${
//               activeTab === "realizadas"
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-200"
//             }`}
//           >
//             Visitas Realizadas
//           </button>
//           <button
//             onClick={() => setActiveTab("reprogramar")}
//             className={`px-4 py-2 rounded ${
//               activeTab === "reprogramar"
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-200"
//             }`}
//           >
//             Visitas a Reprogramar
//           </button>
//         </div>

//         <div className="mb-4">
//           <select
//             value={filterMonth}
//             onChange={(e) => setFilterMonth(parseInt(e.target.value))}
//             className="mr-2 p-2 border rounded"
//           >
//             {Array.from({ length: 12 }, (_, i) => (
//               <option key={i} value={i}>
//                 {new Date(2000, i, 1).toLocaleString("default", {
//                   month: "long",
//                 })}
//               </option>
//             ))}
//           </select>
//           <select
//             value={filterYear}
//             onChange={(e) => setFilterYear(parseInt(e.target.value))}
//             className="p-2 border rounded"
//           >
//             {Array.from({ length: 10 }, (_, i) => (
//               <option key={i} value={new Date().getFullYear() - 5 + i}>
//                 {new Date().getFullYear() - 5 + i}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {visitas
//             .filter((visita) => {
//               if (activeTab === "pendientes")
//                 return visita.estado === "pendiente";
//               if (activeTab === "realizadas")
//                 return visita.estado === "realizada";
//               if (activeTab === "reprogramar")
//                 return visita.estado === "reprogramar";
//               return false;
//             })
//             .map((visita) => (
//               <div
//                 key={visita.id}
//                 className={`p-4 border rounded ${
//                   visita.estado === "reprogramar" ? "bg-red-100" : ""
//                 }`}
//               >
//                 <h3 className="font-bold">{visita.nombre}</h3>
//                 <p>Asesor: {visita.asesor_name}</p>
//                 <p>Fecha: {visita.fecha}</p>
//                 <p>Hora: {visita.hora}</p>
//                 <p>Teléfono: {visita.telefono}</p>
//                 <p>Dirección: {visita.direccion}</p>

//                 {/* Si la visita esta en estado reprogramar, muestra el select */}

//                 <button
//                   onClick={() => handleEdit(visita)}
//                   className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 mt-2"
//                 >
//                   Editar
//                 </button>
//                 <button
//                   onClick={() => {
//                     /* Lógica para ver detalles */
//                   }}
//                   className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
//                 >
//                   Ver Detalles
//                 </button>
//                 {visita.estado === "pendiente" && (
//                   <button
//                     onClick={() => handleReprogramar(visita)}
//                     className="bg-red-500 text-white px-2 py-1 rounded mt-2 ml-2"
//                   >
//                     Reprogramar
//                   </button>
//                 )}
//               </div>
//             ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardTeleventas;
