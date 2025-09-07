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
                    Dashboard
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
                    Profile
                  </a>
                </li>
              </>
            )}
          </ul>

          {/* Authentication buttons */}
          {isAuthenticated ? (
            <button 
              className="profile-button"
              onClick={handleLogout}
            >
              <span>Logout</span>
            </button>
          ) : (
            <button 
              className="login-button"
              onClick={() => navigate('/login')}
            >
              <span>Login</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default HeaderComponent;
