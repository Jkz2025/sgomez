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
import ProfileConfiguration from "./components/Configuracion/ProfileConfiguration";

function App() {
  return (
    <div className="bg-zinc-900 min-h-screen text-gray-100">
      <AuthProvider>
        <Router>
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-700 overflow-hidden">
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/catalogo" element={<Inventario />} />
                <Route path="/ProfileConfiguration" element={<ProfileConfiguration />} />
                <Route path="/calculadora" element={<Calculadora />} />
                <Route path="/dashboard-asesor" element={<DashboardAsesor />} />
                <Route path="/dashboard-distribuidor" element={<DashboardDistribuidor />} />
                <Route path="/dashboard-televentas" element={<DashboardTeleventas />} />
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;c