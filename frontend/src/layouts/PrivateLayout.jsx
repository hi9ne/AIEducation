import React, { useMemo, useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';

const PrivateLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Read onboarding completion flag from localStorage on each render
  // (don't memoize once), so navigation right after submit isn't blocked by a stale value
  const onboardingComplete = (() => {
    try {
      return localStorage.getItem('onboardingComplete') === 'true';
    } catch {
      return false;
    }
  })();

  const isProfileComplete = useMemo(() => {
    if (!user) return null; // неизвестно, не редиректим
    const p = user.profile || {};
    const phone = user.phone || p.phone;
    const city = user.city || p.city;
    return (
      Boolean(phone) &&
      Boolean(city) &&
      Boolean(p.education_background) &&
      Array.isArray(p.interests) && p.interests.length > 0 &&
      Array.isArray(p.goals) && p.goals.length > 0 &&
      p.language_levels && Object.keys(p.language_levels).length > 0 &&
      Boolean(p.budget_range) &&
      Boolean(p.study_duration)
    );
  }, [user]);

  // Если профиль стал полным и пользователь находится на онбординге — отправим в кабинет
  useEffect(() => {
    if (isProfileComplete === true && location.pathname === '/app/onboarding') {
      navigate('/app/dashboard', { replace: true });
    }
    // Однократный пропуск сразу после сабмита онбординга
    if (onboardingComplete && location.pathname === '/app/onboarding') {
      try { localStorage.removeItem('onboardingComplete'); } catch {}
      navigate('/app/dashboard', { replace: true });
    }
  }, [isProfileComplete, onboardingComplete, location.pathname, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если пользователь авторизован, профиль загружен и он незаполнен — направляем на онбординг
  if (
  isProfileComplete === false &&
  location.pathname !== '/app/onboarding' &&
  !onboardingComplete
  ) {
    return <Navigate to="/app/onboarding" replace />;
  }

  // Если профиль уже заполнен, а пользователь находится на онбординге — ведем в дашборд
  if (
    isProfileComplete === true &&
    location.pathname === '/app/onboarding'
  ) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <main>
      <Outlet />
    </main>
  );
};

export default PrivateLayout;
