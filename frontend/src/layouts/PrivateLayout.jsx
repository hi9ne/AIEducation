import React, { useMemo, useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';

const PrivateLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Use backend flag
  const onboardingCompleted = user?.profile?.onboarding_completed === true;
  const isProfileKnown = useMemo(() => (user ? true : false), [user]);

  // Если профиль завершен и пользователь попал на онбординг — перенаправим в кабинет
  useEffect(() => {
    if (onboardingCompleted && location.pathname === '/app/onboarding') {
      navigate('/app/dashboard', { replace: true });
    }
  }, [onboardingCompleted, location.pathname, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Пока профиль неизвестен, не делаем редиректов
  if (!isProfileKnown) {
    return <main><Outlet /></main>;
  }

  // Если профиль незаполнен — направляем на онбординг
  if (!onboardingCompleted && location.pathname !== '/app/onboarding') {
    return <Navigate to="/app/onboarding" replace />;
  }

  return (
    <main>
      <Outlet />
    </main>
  );
};

export default PrivateLayout;
