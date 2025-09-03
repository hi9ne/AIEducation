
import HeroSection from './components/Home/HeroSection';
import EducationVariants from './components/Home/EducationVariants';
import AboutCompany from './components/Home/AboutCompany';
import FacultyList from './components/Home/FacultyList';
import ReviewsSection from './components/Home/ReviewsSection';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ConfirmResetPage } from './pages/ConfirmResetPage';
import { ProfilePage } from './pages/ProfilePage';
import { PaymentPage } from './pages/PaymentPage';
import { OfferPage } from './pages/OfferPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ContactsPage } from './pages/ContactsPage';
import { InstagramPage } from './pages/InstagramPage';
import { WhatsAppPage } from './pages/WhatsAppPage';
import { AddressPage } from './pages/AddressPage';
import { fetchProfile } from './store/authSlice';
import './App.css';


function PrivateRoute({ children }) {
  const isAuthenticated = localStorage.getItem('accessToken');
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function SubscribedRoute({ children }) {
  const user = useSelector(state => state.auth.user);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!user?.subscription?.is_active) return <Navigate to="/profile" />;
  return children;
}

function PublicRoute({ children }) {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" /> : children;
}

function Home() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);

  // Логика кнопок регистрации и профиля оставлена без изменений
  return (
    <div className="main-page">
      <header className="main-header">
        <div className="main-header__container">
          <div className="main-header__logo">
            <h2>НАЗВАНИЕ</h2>
            <span className="main-header__subtitle">СТРОИМ БУДУЩЕЕ ВМЕСТЕ!</span>
          </div>
          <nav className="main-header__nav">
            {isAuthenticated ? (
              <button
                className="profile-button"
                onClick={() => navigate('/profile')}
              >
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 8-4 8-4s8 0 8 4" />
                </svg>
              </button>
            ) : (
              <button className="login-button" onClick={() => navigate('/login')}>
                Регистрация
              </button>
            )}
          </nav>
        </div>
      </header>
      <HeroSection />
      <EducationVariants />
      <AboutCompany />
      <FacultyList />
      <ReviewsSection />
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        <Route path="/confirm-reset" element={<PublicRoute><ConfirmResetPage /></PublicRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
        <Route path="/instagram" element={<SubscribedRoute><InstagramPage /></SubscribedRoute>} />
        <Route path="/whatsapp" element={<SubscribedRoute><WhatsAppPage /></SubscribedRoute>} />
        <Route path="/address" element={<SubscribedRoute><AddressPage /></SubscribedRoute>} />
        <Route path="/offer" element={<OfferPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
