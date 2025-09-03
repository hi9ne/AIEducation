import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearResetStatus } from '../store/authSlice';

export function ResetPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    return () => {
      dispatch(clearResetStatus());
    };
  }, [dispatch]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!/^\S+@\S+$/.test(email)) {
      return;
    }
    
    const resultAction = await dispatch(resetPassword(email));
    if (resetPassword.fulfilled.match(resultAction)) {
      navigate('/confirm-reset', { state: { email: email } });
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <div className="back-button-container">
          <button 
            className="back-button" 
            onClick={() => navigate('/login')}
            type="button"
          >
            ← Назад
          </button>
        </div>
        
        <h1 className="reset-title">Сбросить пароль</h1>
        <p className="reset-description">
          Введите ваш email для получения кода сброса пароля
        </p>
        
        <form className="auth-form" onSubmit={handleEmailSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="form-error">
              {error.detail || 'Что-то пошло не так'}
            </div>
          )}
          
          <button 
            className="auth-button" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Отправка...' : 'Отправить код сброса'}
          </button>
          
          <div className="auth-divider">
            <span>или</span>
          </div>
          
          <p style={{ textAlign: 'center', margin: 0 }}>
            <Link to="/login" className="auth-link">
              Вернуться к входу
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
