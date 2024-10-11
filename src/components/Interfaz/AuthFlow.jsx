import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Functions/CreateClient";

const AuthFlow = () => {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(null);
  const [cargo, setCargo] = useState("");
  const [userInfo, setUserInfo] = useState({
    nombre: "",
    apellido: "",
    codigo: "",
    correo: "",
    telefono: "",
    distribuidor: "",
  });
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();

  const checkUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching user profile:", error);
        return;
      }

      if (data) {
        setIsFirstLogin(false);
        setCargo(data.cargo);
        navigateToDashboard(data.cargo);
      } else {
        setIsFirstLogin(true);
      }
    } catch (error) {
      console.error("Error in checkUserProfile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeForm = () => {
    setCargo("");
  };

  const navigateToDashboard = (userCargo) => {
    switch (userCargo) {
      case "asesor":
        navigate("/dashboard-asesor");
        break;
      case "televentas":
        navigate("/dashboard-televentas");
        break;
      case "distribuidor":
        navigate("/dashboard-distribuidor");
        break;
      default:
        navigate("/");
    }
  };

  const handleCargoSelection = (selectedCargo) => {
    setCargo(selectedCargo);
  };

  const handleInputChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { user } = session;

    try {
      const { data, error } = await supabase.from("profiles").insert([
        {
          id: user.id,
          cargo,
          ...userInfo,
        },
      ]);

      if (error) throw error;

      setIsFirstLogin(false);
      navigateToDashboard(cargo);
    } catch (error) {
      console.error("Error saving user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          setSession(session);
          const { user } = session;
          const { email, user_metadata } = user;
          const { full_name } = user_metadata;

          setUserData({
            email: email,
            fullName: full_name || 'Usuario'
          });

          await checkUserProfile(user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
        setIsLoading(false);
      }
    };

    fetchUserData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!session) {
    return <div>No has iniciado sesión.</div>;
  }

  if (isFirstLogin === false) {
    return null;
  }

  const distribuidores = [
    "SGOMEZ SALUTEM",
    "JM SALUTEM",
    "RYD SALUTEM",
    "MP SALUTEM",
    "AD DA GROUP",
    "MS RODRIGUEZ",
    "CMR COMPANY",
    "TAMAR'S SALUTEM",
    "VITALITY"
  ];

  return (
    <div className="container mx-auto p-4 w-full max-w-full overflow-hidden">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Bienvenido <span className="text-blue-500">{userData?.fullName}</span>, completa tu perfil
      </h1>
      {!cargo ? (
        <div>
          <h2 className="text-xl mb-2 text-center">Selecciona tu cargo:</h2>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 justify-center">
            <button
              onClick={() => handleCargoSelection("asesor")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 shadow-md transition"
            >
              Asesor
            </button>
            <button
              onClick={() => handleCargoSelection("televentas")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 shadow-md transition"
            >
              Televentas
            </button>
            <button
              onClick={() => handleCargoSelection("distribuidor")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 shadow-md transition"
            >
              Distribuidor
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={userInfo.nombre}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={userInfo.apellido}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
               <input
            type="text"
            name="codigo"
            placeholder="Codigo"
            value={userInfo.codigo}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="email"
            name="correo"
            placeholder="Correo"
            value={userInfo.correo}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono"
            value={userInfo.telefono}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
          <select
            name="distribuidor"
            value={userInfo.distribuidor}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Selecciona un distribuidor</option>
            {distribuidores.map((distribuidor) => (
              <option key={distribuidor} value={distribuidor}>
                {distribuidor}
              </option>
            ))}
          </select>
          <div className="flex space-x-4 justify-center">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 shadow-md transition">
              Guardar
            </button>
            <button onClick={closeForm} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 shadow-md transition">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AuthFlow;
