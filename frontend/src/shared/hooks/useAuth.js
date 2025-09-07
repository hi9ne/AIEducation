import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // Отладочная информация
  console.log('useAuth - user:', user);
  console.log('useAuth - isAuthenticated from state:', isAuthenticated);
  console.log('useAuth - accessToken in localStorage:', !!localStorage.getItem('accessToken'));
  
  const hasToken = !!localStorage.getItem('accessToken');
  const finalIsAuthenticated = isAuthenticated || hasToken;
  
  console.log('useAuth - final isAuthenticated:', finalIsAuthenticated);
  
  return {
    user,
    isAuthenticated: finalIsAuthenticated
  };
};