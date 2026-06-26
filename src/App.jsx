// App.js
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./constants/AuthContext";
import Dashboard from "./components/Dashboard";
import LoginForm from "./components/LoginForm";
import Navbar from "./components/Navbar";
import DashboardAsesor from "./components/DashboardAsesor/Dashboard";
import Inventario from "./components/Inventario";
import DashboardDistribuidor from "./components/DashboardDistribuidor/Dashboard";
import DashboardTeleventas from "./components/DashboardTeleventas/Dashboard";
import Calculadora from "./components/Calculadora/Calculadora";
import DashboardPrincipal from "./components/DashboardPrincipal";
import ProfileConfiguration from "./components/Configuracion/ProfileConfiguration";
import PanelAsesor from "./components/PanelAsesor";
import AuthCallback from "./components/AuthCallback";

function App() {
  return (
    // Fondo TradingView (cuadrícula + vignette)
    <div className="bg-trading min-h-screen text-gray-200 font-sans">
      <AuthProvider>
        <Router>
          <Navbar />
          {/* Contenedor principal con margen para el navbar fijo */}
          <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Tarjeta estilo glassmorphism */}
            <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20">
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/" element={<DashboardPrincipal />} />
                <Route path="/catalogo" element={<Inventario />} />
                <Route path="/ProfileConfiguration" element={<ProfileConfiguration />} />
                <Route path="/calculadora" element={<Calculadora />} />
                <Route path="/dashboard-asesor" element={<DashboardAsesor />} />
                <Route path="/dashboard-distribucion" element={<DashboardDistribuidor />} />
                <Route path="/dashboard-televentas" element={<DashboardTeleventas />} />
                <Route path='/panel-asesor' element={<PanelAsesor />} />
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;