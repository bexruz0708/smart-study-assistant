import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

/**
 * Faqat login qilganlar kira oladi.
 * Aks holda /login ga yuboriladi.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;