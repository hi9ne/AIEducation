import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const HeaderComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('accessToken');

  // Determine profile completeness from locally cached user info
  const isProfileCompleteFromLocal = () => {
    try {
      const raw = localStorage.getItem('userInfo');
      if (!raw) return false;
      const u = JSON.parse(raw);
      const p = u.profile || {};
      const phone = u.phone || p.phone;
      const city = u.city || p.city;
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
    } catch {
      return false;
    }
  };

  // Smart login click: skip forms if already authorized and onboarded
  const handleLoginClick = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      const complete = isProfileCompleteFromLocal();
      navigate(complete ? '/app/dashboard' : '/app/onboarding');
      return;
    }
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const handleDashboardClick = () => {
    navigate('/app/dashboard');
  };

  // Determine active path inline where used to avoid scope issues

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
                className={location.pathname === '/' ? 'active' : ''}
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
            {/* Reviews link removed */}
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
                    className={location.pathname === '/app/dashboard' ? 'active' : ''}
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
                    className={location.pathname === '/app/profile' ? 'active' : ''}
                  >
                    Profile
                  </a>
                </li>
              </>
            )}
          </ul>

          {/* Authentication buttons: show only Login for guests; remove extra dashboard CTA */}
          {isAuthenticated ? (
            <div className="auth-buttons">
              <button 
                className="logout-button"
                onClick={handleLogout}
              >
                <span>Выйти</span>
              </button>
            </div>
          ) : (
            <button 
              className="login-button"
              onClick={handleLoginClick}
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
