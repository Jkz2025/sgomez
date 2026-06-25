import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./Functions/CreateClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase maneja automáticamente el callback de OAuth desde la URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        // Esperar un momento para asegurar que Supabase procese el callback
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificar nuevamente la sesión después del delay
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          // Redirigir al dashboard después de procesar el callback
          navigate("/dashboard");
        } else {
          // Si no hay sesión, redirigir al login
          navigate("/login");
        }
      } catch (error) {
        console.error("Error en callback de autenticación:", error);
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Procesando autenticación...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
