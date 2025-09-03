import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyReset, clearResetStatus } from '../store/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';

export function ConfirmResetPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);
  const email = location.state?.email || '';

  const [formData, setFormData] = useState({
    email,
    code: '',
    new_password: ''
  });

  useEffect(() => {
    return () => {
      dispatch(clearResetStatus());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.new_password.length < 6) {
      return;
    }
    
    const resultAction = await dispatch(verifyReset(formData));
    if (verifyReset.fulfilled.match(resultAction)) {
      navigate('/login');
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <div className="back-button-container">
          <button 
            className="back-button" 
            onClick={() => navigate('/reset-password')}
            type="button"
          >
            ← Назад
          </button>
        </div>
        
        <h1 className="reset-title">Подтвердить сброс пароля</h1>
        <p className="reset-description">
          Введите код, отправленный на ваш email, и установите новый пароль.
        </p>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="code">Код подтверждения</label>
            <input
              id="code"
              name="code"
              type="text"
              className="form-input"
              placeholder="Введите код из email"
              value={formData.code}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="new_password">Новый пароль</label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              className="form-input"
              placeholder="Ваш новый пароль"
              value={formData.new_password}
              onChange={handleChange}
              required
            />
          </div>
          
          {error && (
            <div className="form-error">
              {error.detail || 'Неверный код'}
            </div>
          )}
          
          <button 
            className="auth-button" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Сброс...' : 'Сбросить пароль'}
          </button>
        </form>
      </div>
    </div>
  );
}
