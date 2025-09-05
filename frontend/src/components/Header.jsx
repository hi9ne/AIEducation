import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const HeaderComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('accessToken');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="main-header">
      <div className="main-header__container">
        {/* Логотип */}
        <div className="main-header__logo">
          <img 
            src="/images/iedulogo.png" 
            alt="AI Education" 
            className="logo_img"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
        </div>

        {/* Навигация */}
        <nav className="main-header__nav">
          <ul>
            <li>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                }}
                className={isActive('/') ? 'active' : ''}
              >
                Главная
              </a>
            </li>
            
            {isAuthenticated && (
              <>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/dashboard');
                    }}
                    className={isActive('/dashboard') ? 'active' : ''}
                  >
                    Дашборд
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/profile');
                    }}
                    className={isActive('/profile') ? 'active' : ''}
                  >
                    Профиль
                  </a>
                </li>
              </>
            )}
          </ul>

          {/* Кнопки аутентификации */}
          {isAuthenticated ? (
            <button 
              className="profile-button"
              onClick={handleLogout}
            >
              <span>Выйти</span>
            </button>
          ) : (
            <button 
              className="login-button"
              onClick={() => navigate('/login')}
            >
              <span>Войти</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default HeaderComponent;
