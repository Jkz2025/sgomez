import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Functions/CreateClient";
import LandingPage from "../LandingPage";

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
    distribucion: "",
  });
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();
console.log(session,"session")
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
      case "distribucion":
        navigate("/dashboard-distribucion");
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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-blue-200">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LandingPage />;
  }

  if (isFirstLogin === false) {
    return null;
  }

  const distribuciones = [
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
    <div className="min-h-screen pt-20 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8">
          <h1 className="section-title text-center">
            Bienvenido <span className="gradient-text">{userData?.fullName}</span>, completa tu perfil
          </h1>
          
          {!cargo ? (
            <div>
              <h2 className="text-xl mb-6 text-center text-blue-200">Selecciona tu cargo:</h2>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 justify-center">
                <button
                  onClick={() => handleCargoSelection("asesor")}
                  className="gradient-button px-6 py-3 rounded-xl flex items-center justify-center space-x-2"
                >
                  <span>Asesor</span>
                </button>
                <button
                  onClick={() => handleCargoSelection("televentas")}
                  className="gradient-button px-6 py-3 rounded-xl flex items-center justify-center space-x-2"
                >
                  <span>Televentas</span>
                </button>
                <button
                  onClick={() => handleCargoSelection("distribucion")}
                  className="gradient-button px-6 py-3 rounded-xl flex items-center justify-center space-x-2"
                >
                  <span>Distribuidor</span>
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
                className="input-field"
                required
              />
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={userInfo.apellido}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="text"
                name="codigo"
                placeholder="Código"
                value={userInfo.codigo}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="email"
                name="correo"
                placeholder="Correo"
                value={userInfo.correo}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono"
                value={userInfo.telefono}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <select
                name="distribucion"
                value={userInfo.distribucion}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Selecciona un distribucion</option>
                {distribuciones.map((distribucion) => (
                  <option key={distribucion} value={distribucion}>
                    {distribucion}
                  </option>
                ))}
              </select>
              <div className="flex space-x-4 justify-center pt-4">
                <button type="submit" className="gradient-button px-8 py-3 rounded-xl">
                  Guardar
                </button>
                <button 
                  onClick={closeForm} 
                  className="px-8 py-3 rounded-xl border-2 border-red-500 text-red-400 
                           hover:bg-red-500/20 transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;
