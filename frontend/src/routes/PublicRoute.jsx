import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

/**
 * Faqat login bo'lmaganlar uchun (Login, Register sahifalari).
 * Login bo'lsa, /dashboard ga yuboriladi.
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default PublicRoute;