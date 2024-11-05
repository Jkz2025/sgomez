// // ENTORNO PRUEBAS

// import {
//   BrowserRouter as Router,
//   Route,
//   Routes,
//   Navigate,
// } from "react-router-dom";
// import { AuthProvider } from "./constants/AuthContext";
// import Dashboard from "./components/Dashboard";
// import LoginForm from "./components/LoginForm";
// import Navbar from "./components/Navbar";
// import PrivateRoute from "./components/PrivateRoute";
// import DashboardAsesor from "./components/DashboardAsesor/Dashboard";
// import Inventario from "./components/Inventario";
// import DashboardDistribuidor from "./components/DashboardDistribuidor/Dashboard";
// import DashboardTeleventas from "./components/DashboardTeleventas/Dashboard";
// import Calculadora from "./components/Calculadora/Calculadora";
// import ProfileConfiguration from "./components/Configuracion/ProfileConfiguration";

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Navbar />
//         <Routes>
//           <Route path="/login" element={<LoginForm />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/" element={<Navigate to="/dashboard" replace />} />
//           <Route path="/catalogo" element={<Inventario />} />
//           <Route path="/ProfileConfiguration" element={<ProfileConfiguration />} />
//           <Route path="/calculadora" element={<Calculadora />} />
//           <Route path="/dashboard-asesor" element={<DashboardAsesor />} />
//           <Route
//             path="/dashboard-distribuidor"
//             element={<DashboardDistribuidor />}
//           />
//           <Route
//             path="/dashboard-televentas"
//             element={<DashboardTeleventas />}
//           />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;

// ENTORNO REAL

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./constants/AuthContext";
import LoginForm from "./components/LoginForm";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import DashboardAsesor from "./components/DashboardAsesor/Dashboard";
import Inventario from "./components/Inventario";
import DashboardDistribuidor from "./components/DashboardDistribuidor/Dashboard";
import DashboardTeleventas from "./components/DashboardTeleventas/Dashboard";
import Calculadora from "./components/Calculadora/Calculadora";
import Dashboard from "./components/Dashboard";
import ProfileConfiguration from "./components/Configuracion/ProfileConfiguration";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* <Route path="/" element={<Navigate to="/login" replace />}/> */}

          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/ProfileConfiguration"
            element={
              <PrivateRoute>
                <Calculadora />
              </PrivateRoute>
            }
          />

          <Route
            path="/calculadora"
            element={
              <PrivateRoute>
                <Calculadora />
              </PrivateRoute>
            }
          />

          <Route
            path="/catalogo"
            element={
              <PrivateRoute>
                <Inventario />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard-asesor"
            element={
              <PrivateRoute>
                <DashboardAsesor />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard-distribuidor"
            element={
              <PrivateRoute>
                <DashboardDistribuidor />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard-televentas"
            element={
              <PrivateRoute>
                <DashboardTeleventas />
              </PrivateRoute>
            }
          />

          <ProfileConfiguration />
          <Route
            path="/ProfileConfiguration"
            element={
              <PrivateRoute>
                <ProfileConfiguration />{" "}
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
