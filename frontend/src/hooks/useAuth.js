import useAuthStore from '@/store/authStore';

/**
 * Auth ma'lumotlarini olish va boshqarish uchun hook
 * 
 * Misol:
 *   const { user, login, logout, isAuthenticated } = useAuth();
 */
export const useAuth = () => {
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  } = useAuthStore();

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };
};

export default useAuth;