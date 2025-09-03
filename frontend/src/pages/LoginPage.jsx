import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, fetchProfile } from '../store/authSlice';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      await dispatch(fetchProfile());
      navigate('/');
    }
  };

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
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Имя пользователя</label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-input"
              placeholder="Ваше имя пользователя"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Ваш пароль"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          {error && (
            <div className="form-error">
              {error.detail || 'Неверное имя пользователя или пароль'}
            </div>
          )}
          
          <button 
            className="auth-button" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
          
          <button
            className="auth-button outline"
            type="button"
            onClick={() => navigate('/register')}
          >
            Зарегистрироваться
          </button>
          
          <div className="auth-divider">
            <span>или</span>
          </div>
          
          <p style={{ textAlign: 'center', margin: 0 }}>
            <Link to="/reset-password" className="auth-link">
              Забыли пароль?
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
