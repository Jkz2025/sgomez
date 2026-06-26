import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  Layers,
  Calculator,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  Bell,
  Package,
  Users,
  BarChart,
} from 'lucide-react';
import { useAuth } from "../constants/AuthContext";
import { supabase } from "./Functions/CreateClient";
import logo from "../assets/Logo.png";

const Navbar = () => {
  const { session, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');

  // Obtener perfil del usuario (rol y nombre)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('cargo, nombre')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        if (data) {
          setUserRole(data.cargo);
          setUserName(data.nombre || session.user.email?.split('@')[0] || 'Usuario');
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
      }
    };

    fetchProfile();
  }, [session]);

  // Cerrar menús al cambiar de ruta (opcional, si usas React Router)
  // useEffect(() => {
  //   setIsMenuOpen(false);
  //   setIsProfileOpen(false);
  // }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  // Enlaces según el rol
  const getNavLinks = () => {
    const commonLinks = [
      { href: '/catalogo', icon: Layers, label: 'Catálogo' },
      { href: '/calculadora', icon: Calculator, label: 'Calculadora' },
    ];

    if (userRole === 'asesor') {
      return [
        ...commonLinks,
        { href: '/panel-asesor', icon: Users, label: 'Panel Asesor' },
        { href: '/dashboard-asesor', icon: Home, label: 'Dashboard' },
      ];
    } else if (userRole === 'televentas') {
      return [
        ...commonLinks,
        { href: '/dashboard-televentas', icon: Home, label: 'Dashboard' },
      ];
    } else if (userRole === 'distribucion') {
      return [
        ...commonLinks,
        { href: '/dashboard-distribucion', icon: Home, label: 'Dashboard' },
      ];
    }
    return commonLinks;
  };

  const navLinks = useMemo(() => getNavLinks(), [userRole]);

  // Link del logo (redirige al dashboard correspondiente)
  const getLogoLink = () => {
    if (!session) return '/';
    if (userRole === 'asesor') return '/dashboard-asesor';
    if (userRole === 'televentas') return '/dashboard-televentas';
    if (userRole === 'distribucion') return '/dashboard-distribucion';
    return '/';
  };

  // Cerrar sesión
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <nav className="fixed top-0 left-0 w-full z-50 bg-slate-900 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="animate-pulse text-blue-300">Cargando...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* --- Logo --- */}
          <div className="flex items-center space-x-3">
            <a
              href={getLogoLink()}
              className="flex items-center space-x-2 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center ring-2 ring-blue-500/30 group-hover:ring-blue-400/70 transition-all duration-300 group-hover:scale-105">
                <img src={logo} alt="Royal Prestige" className="w-6 h-6" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
                Royal <span className="text-blue-400">Prestige</span>
              </span>
            </a>
          </div>

          {/* --- Enlaces de escritorio (centro) --- */}
          <div className="hidden md:flex items-center space-x-1">
            {session ? (
              navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 group"
                >
                  <link.icon className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                  <span>{link.label}</span>
                </a>
              ))
            ) : (
              <>
                <a href="/" className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 group">
                  <Home className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                  <span>Home</span>
                </a>
                <a href="/about" className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 group">
                  <Layers className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                  <span>About</span>
                </a>
                <a href="/contact" className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 group">
                  <Calculator className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                  <span>Contact</span>
                </a>
              </>
            )}
          </div>

          {/* --- Área derecha (perfil + móvil toggle) --- */}
          <div className="flex items-center space-x-3">
            {session ? (
              <>
                {/* Notificaciones (opcional) */}
                <button className="relative p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Menú de perfil */}
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm shadow-lg ring-2 ring-blue-500/30">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isProfileOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown perfil */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm text-white font-medium">{userName}</p>
                        <p className="text-xs text-gray-400 capitalize">{userRole || 'Usuario'}</p>
                      </div>
                      <a
                        href="/ProfileConfiguration"
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Configuración</span>
                      </a>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <a
                href="/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-600/20"
              >
                Iniciar sesión
              </a>
            )}

            {/* Botón menú móvil */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- Menú móvil --- */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-2 pb-4 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 space-y-1">
          {session ? (
            navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <link.icon className="w-5 h-5 text-blue-400" />
                <span>{link.label}</span>
              </a>
            ))
          ) : (
            <>
              <a href="/" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsMenuOpen(false)}>
                <Home className="w-5 h-5 text-blue-400" />
                <span>Home</span>
              </a>
              <a href="/about" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsMenuOpen(false)}>
                <Layers className="w-5 h-5 text-blue-400" />
                <span>About</span>
              </a>
              <a href="/contact" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsMenuOpen(false)}>
                <Calculator className="w-5 h-5 text-blue-400" />
                <span>Contact</span>
              </a>
              <a href="/login" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-blue-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsMenuOpen(false)}>
                <User className="w-5 h-5" />
                <span>Iniciar sesión</span>
              </a>
            </>
          )}
          {session && (
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar sesión</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;