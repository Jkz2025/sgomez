import { Navigate } from 'react-router-dom';
import { useAuth } from '../constants/AuthContext';

const PrivateRoute = ({ children }) => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // O cualquier componente de carga que prefieras
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;