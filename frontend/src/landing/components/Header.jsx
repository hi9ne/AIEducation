import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const HeaderComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('accessToken');



  const handleDashboardClick = () => {
    navigate('/app/dashboard');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="main-header">
      <div className="main-header__container">
        {/* Logo */}
        <div className="main-header__logo">
          <img 
            src="/images/iedulogo.png" 
            alt="AI Education" 
            className="logo_img"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
        </div>

        {/* Navigation */}
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
                Home
              </a>
            </li>
            <li>
              <a 
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                About
              </a>
            </li>
            <li>
              <a 
                href="#education"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('education')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    document.getElementById('education')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Education
              </a>
            </li>
            <li>
              <a 
                href="#faculty"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('faculty')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    document.getElementById('faculty')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Faculty
              </a>
            </li>
            <li>
              <a 
                href="#reviews"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Reviews
              </a>
            </li>
            <li>
              <a 
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Contact
              </a>
            </li>
            
            {isAuthenticated && (
              <>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/app/dashboard');
                    }}
                    className={isActive('/app/dashboard') ? 'active' : ''}
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/app/profile');
                    }}
                    className={isActive('/app/profile') ? 'active' : ''}
                  >
                    Profile
                  </a>
                </li>
              </>
            )}
          </ul>

          {/* Authentication buttons */}
          {isAuthenticated ? (
            <div className="auth-buttons">
              <button 
                className="dashboard-button"
                onClick={handleDashboardClick}
              >
                <span>Войти в личный кабинет</span>
              </button>
            </div>
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
