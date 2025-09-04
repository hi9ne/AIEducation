import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, fetchProfile, clearError, clearSuccess } from '../store/authSlice';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, success } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Проверяем URL параметры
  useEffect(() => {
    const expired = searchParams.get('expired');
    const registered = searchParams.get('registered');
    
    if (expired) {
      // Показываем сообщение об истечении сессии
    }
    
    if (registered) {
      dispatch(clearSuccess());
      // Можно показать сообщение о успешной регистрации
    }

    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [searchParams, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Очищаем ошибку при изменении полей
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      return;
    }

    try {
      const result = await dispatch(loginUser(formData));
      if (loginUser.fulfilled.match(result)) {
        // Загружаем полный профиль
        await dispatch(fetchProfile());
        
        // Перенаправляем на главную или на страницу, с которой пришел пользователь
        const returnUrl = searchParams.get('returnUrl') || '/';
        navigate(returnUrl);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleForgotPassword = () => {
    navigate('/reset-password');
  };

  const canSubmit = formData.username && formData.password && !loading;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="back-button-container">
          <button 
            className="back-button" 
            onClick={() => navigate('/')}
            type="button"
          >
            ← Назад
          </button>
        </div>
        
        <h1 className="auth-title">Добро пожаловать!</h1>
        <p className="auth-subtitle">Войдите в свой аккаунт</p>

        {/* Сообщения */}
        {searchParams.get('expired') && (
          <div className="form-error">
            Сессия истекла. Пожалуйста, войдите снова.
          </div>
        )}

        {searchParams.get('registered') && (
          <div className="form-success">
            Регистрация прошла успешно! Теперь вы можете войти в систему.
          </div>
        )}

        {success && (
          <div className="form-success">
            {success}
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Имя пользователя или Email
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-input"
              placeholder="Введите логин или email"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Пароль
            </label>
            <div className="password-input-container">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Ваш пароль"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Опции */}
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkmark"></span>
              Запомнить меня
            </label>

            <button
              type="button"
              className="forgot-password-link"
              onClick={handleForgotPassword}
            >
              Забыли пароль?
            </button>
          </div>
          
          {error && (
            <div className="form-error">
              {typeof error === 'string' ? error : error.error || 'Неверный логин или пароль'}
            </div>
          )}
          
          <button 
            className="auth-button" 
            type="submit" 
            disabled={!canSubmit}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
          
          <div className="auth-divider">
            <span>или</span>
          </div>

          <button
            className="auth-button outline"
            type="button"
            onClick={() => navigate('/register')}
          >
            Создать аккаунт
          </button>
        </form>
      </div>
    </div>
  );
}
