import React, { useMemo, useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';

const PrivateLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Use backend flag
  const onboardingCompleted = user?.profile?.onboarding_completed === true;
  const forceCompleted = localStorage.getItem('onboarding_force_completed');
  const isProfileKnown = useMemo(() => (user ? true : false), [user]);

  // Если профиль завершен и пользователь попал на онбординг — перенаправим в кабинет
  useEffect(() => {
    if ((onboardingCompleted || forceCompleted) && location.pathname === '/app/onboarding') {
      if (forceCompleted) {
        localStorage.removeItem('onboarding_force_completed');
      }
      navigate('/app/dashboard', { replace: true });
    }
  }, [onboardingCompleted, forceCompleted, location.pathname, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Пока профиль неизвестен, не делаем редиректов
  if (!isProfileKnown) {
    return <main><Outlet /></main>;
  }

  // Если профиль незаполнен — направляем на онбординг (но не если есть флаг принудительного завершения)
  if (!onboardingCompleted && !forceCompleted && location.pathname !== '/app/onboarding') {
    return <Navigate to="/app/onboarding" replace />;
  }

  return (
    <main>
      <Outlet />
    </main>
  );
};

export default PrivateLayout;
