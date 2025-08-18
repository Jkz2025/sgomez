import React, { useState, useEffect } from 'react';
import { Home, Layers, Calculator, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from "../constants/AuthContext";
import { supabase } from "./Functions/CreateClient";
import logo from "../assets/Logo.png";
import { UserPlus } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { session, loading } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [sessionAsesor, setSessionAsesor] = useState(false)
  const [sessionTeleventas, setSessionTeleventas] = useState(false)
  const [sessionDistribuidor, setSessionDistribuidor] = useState(false)
  const [profiles, setProfiles] = useState([])
  const [profilesLoaded, setProfilesLoaded] = useState(false)

  // Cargar perfiles y verificar rol
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session?.user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          if (data.cargo === 'asesor') setSessionAsesor(true);
          if (data.cargo === 'televentas') setSessionTeleventas(true);
          if (data.cargo === 'distribuidor') setSessionDistribuidor(true);
        }
        setProfilesLoaded(true);
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
      }
    };

    if (session?.user?.id) {
      loadProfiles();
    }
  }, [session]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const NavLink = ({ href, icon: Icon, label }) => (
    <a
      href={href}
      className="group flex items-center space-x-2 text-blue-200 hover:text-white transition-all duration-300 
        hover:bg-blue-900/30 px-4 py-2 rounded-lg"
    >
      <Icon className="w-5 h-5 text-blue-400 group-hover:text-blue-200" />
      <span className="font-medium">{label}</span>
    </a>
  );

  // Consulta el cargo del usuario logueado
  useEffect(() => {
    const fetchUserRole = async () => {
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('cargo')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error al obtener el cargo del usuario:', error);
        } else if (data) {
          console.log('Cargo del usuario:', data.cargo); // Para depuración
          setUserRole(data.cargo);
        }
      }
    };

    fetchUserRole();
  }, [session]);
  // Función para obtener el link del logo de forma dinámica
  const getLogoLink = () => {
    if (!session) return '/';
    
    // Usar el estado de sesión para determinar el dashboard
    if (sessionAsesor) return '/dashboard-asesor';
    if (sessionTeleventas) return '/dashboard-televentas';
    if (sessionDistribuidor) return '/dashboard-distribuidor';
    
    return '/';
  };

  if (loading) {
    return (
      <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-br from-blue-900 via-black to-blue-900 p-4">
        <div className="flex justify-between items-center">
          <div className="animate-pulse text-blue-300">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 
      bg-gradient-to-br from-blue-900 via-black to-blue-900 
      shadow-2xl border-b border-blue-800/20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo Area */}
        <div className="flex items-center space-x-3">
          <a href={getLogoLink()} className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full 
              flex items-center justify-center 
              ring-4 ring-blue-900/50">
              <img src={logo} alt="logo" />
            </div>
          </a>
          <span className="text-blue-200 font-semibold text-xl 
            tracking-wider">Royal Prestige Cali</span>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-blue-200 hover:text-white"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop/Mobile Navigation */}
        <div
          className={`fixed md:static top-16 left-0 right-0 
            md:flex md:items-center md:space-x-4 
            ${isMenuOpen ? 'block' : 'hidden'} 
            md:block bg-blue-900/80 md:bg-transparent 
            backdrop-blur-xl md:backdrop-blur-0 
            rounded-xl md:rounded-none p-4 md:p-0`}
        >
          {!session ? (
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <NavLink href="/" icon={Home} label="Home" />
              <NavLink href="/about" icon={Layers} label="About" />
              <NavLink href="/contact" icon={Calculator} label="Contact" />
              <NavLink href="/login" icon={UserPlus} label="Inciar Sesion" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <NavLink href="/catalogo" icon={Layers} label="Catalogo" />
              <NavLink href="/calculadora" icon={Calculator} label="Calculadora" />
              <NavLink href="/ProfileConfiguration" icon={Settings} label="Configuracion" />
              {sessionAsesor ? (
                <>
                  <NavLink href="/panel-asesor" icon={UserPlus} label="Panel Asesor" />
                  <NavLink href="/dashboard" icon={Home} label="Dashboard" />
                </>
              ) : sessionTeleventas ? (
                <NavLink href="/dashboard-televentas" icon={Home} label="Dashboard" />
              ) : sessionDistribuidor ? (
                <NavLink href="/dashboard" icon={Home} label="Dashboard" />
              ) : (
                <NavLink href="/dashboard" icon={Home} label="Dashboard" />
              )}
              <button
                onClick={async () => {
                  const { error } = await supabase.auth.signOut();
                  if (!error) {
                    window.location.href = '/login';
                  }
                }}
                className="group flex items-center space-x-2 text-red-300 hover:text-red-100 
                  hover:bg-red-900/30 px-4 py-2 rounded-lg transition-all duration-300"
              >
                <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-200" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;