import { useState, useEffect } from "react";
import { registerUser, loginUser, fetchProfile, clearError, clearSuccess } from "../store/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

export function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Очищаем ошибки при размонтировании
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  // Валидация в реальном времени
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'username':
        if (value.length < 3) {
          newErrors.username = "Минимум 3 символа";
        } else if (value.length > 30) {
          newErrors.username = "Максимум 30 символов";
        } else if (!/^[a-zA-Z0-9_.-]+$/.test(value)) {
          newErrors.username = "Только буквы, цифры, точки, дефисы и подчеркивания";
        } else {
          delete newErrors.username;
        }
        break;

      case 'email':
        if (!/^\S+@\S+\.\S+$/.test(value)) {
          newErrors.email = "Неверный формат email";
        } else {
          delete newErrors.email;
        }
        break;

      case 'first_name':
        if (value && value.length < 2) {
          newErrors.first_name = "Минимум 2 символа";
        } else {
          delete newErrors.first_name;
        }
        break;

      case 'last_name':
        if (value && value.length < 2) {
          newErrors.last_name = "Минимум 2 символа";
        } else {
          delete newErrors.last_name;
        }
        break;

      case 'password':
        if (value.length < 8) {
          newErrors.password = "Минимум 8 символов";
        } else if (!/(?=.*[a-z])/.test(value)) {
          newErrors.password = "Должна быть хотя бы одна строчная буква";
        } else if (!/(?=.*[A-Z])/.test(value)) {
          newErrors.password = "Должна быть хотя бы одна заглавная буква";
        } else if (!/(?=.*\d)/.test(value)) {
          newErrors.password = "Должна быть хотя бы одна цифра";
        } else {
          delete newErrors.password;
        }
        break;

      case 'password2':
        if (value !== formData.password) {
          newErrors.password2 = "Пароли не совпадают";
        } else {
          delete newErrors.password2;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};

    // Проверяем все обязательные поля
    if (!formData.username) newErrors.username = "Обязательное поле";
    if (!formData.email) newErrors.email = "Обязательное поле";
    if (!formData.first_name) newErrors.first_name = "Обязательное поле";
    if (!formData.last_name) newErrors.last_name = "Обязательное поле";
    if (!formData.password) newErrors.password = "Обязательное поле";
    if (!formData.password2) newErrors.password2 = "Обязательное поле";
    if (!agreedToTerms) newErrors.terms = "Необходимо согласие с условиями";

    // Запускаем валидацию для заполненных полей
    Object.entries(formData).forEach(([key, value]) => {
      if (value) validateField(key, value);
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    // Разрешаем в пароле только ASCII символы (английские буквы, цифры, спец.)
    if (name === 'password' || name === 'password2') {
      value = value.replace(/[^\x20-\x7E]/g, '');
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));

    // Валидация в реальном времени
    if (value) {
      validateField(name, value);
    }

    // Очищаем общую ошибку при изменении полей
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const resultAction = await dispatch(registerUser(formData));
      
      if (registerUser.fulfilled.match(resultAction)) {
        // Немедленный вход после успешной регистрации
        const loginAction = await dispatch(loginUser({
          username: formData.username,
          password: formData.password,
        }));
        if (loginUser.fulfilled.match(loginAction)) {
          await dispatch(fetchProfile());
          navigate("/profile");
        } else {
          navigate("/login?registered=true");
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[!@#$%^&*])/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        return { level: 'weak', text: 'Слабый', color: '#ef4444' };
      case 2:
        return { level: 'fair', text: 'Удовлетворительный', color: '#f59e0b' };
      case 3:
        return { level: 'good', text: 'Хороший', color: '#10b981' };
      case 4:
      case 5:
        return { level: 'strong', text: 'Сильный', color: '#059669' };
      default:
        return { level: 'weak', text: 'Слабый', color: '#ef4444' };
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="back-button-container">
          <button
            className="back-button"
            onClick={() => navigate("/")}
            type="button"
          >
            ← Назад
          </button>
        </div>

        <h1 className="auth-title">Создать аккаунт</h1>
        <p className="auth-subtitle">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="auth-link">
            Войти
          </Link>
        </p>

        {success && (
          <div className="form-success">
            {success}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Имя пользователя */}
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Имя пользователя *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder="Ваше имя пользователя"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && (
              <div className="form-error">{errors.username}</div>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <div className="form-error">{errors.email}</div>
            )}
          </div>

          {/* Имя и Фамилия */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="first_name">
                Имя *
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                className={`form-input ${errors.first_name ? 'error' : ''}`}
                placeholder="Имя"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              {errors.first_name && (
                <div className="form-error">{errors.first_name}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="last_name">
                Фамилия *
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                className={`form-input ${errors.last_name ? 'error' : ''}`}
                placeholder="Фамилия"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
              {errors.last_name && (
                <div className="form-error">{errors.last_name}</div>
              )}
            </div>
          </div>

          {/* Пароль */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Пароль *
            </label>
            <div className="password-input-container">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Ваш пароль"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                required
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
            
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${(passwordStrength.level === 'weak' ? 25 : 
                               passwordStrength.level === 'fair' ? 50 : 
                               passwordStrength.level === 'good' ? 75 : 100)}%`,
                      backgroundColor: passwordStrength.color 
                    }}
                  ></div>
                </div>
                <span style={{ color: passwordStrength.color }}>
                  {passwordStrength.text}
                </span>
              </div>
            )}
            
            {errors.password && (
              <div className="form-error">{errors.password}</div>
            )}
          </div>

          {/* Подтверждение пароля */}
          <div className="form-group">
            <label className="form-label" htmlFor="password2">
              Подтвердите пароль *
            </label>
            <div className="password-input-container">
              <input
                id="password2"
                name="password2"
                type={showPassword2 ? "text" : "password"}
                className={`form-input ${errors.password2 ? 'error' : ''}`}
                placeholder="Подтвердите ваш пароль"
                value={formData.password2}
                onChange={handleChange}
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword2(!showPassword2)}
                tabIndex="-1"
              >
                {showPassword2 ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password2 && (
              <div className="form-error">{errors.password2}</div>
            )}
          </div>

          {/* Согласие с условиями */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                required
              />
              <span className="checkmark"></span>
              Я согласен с{" "}
              <Link to="/offer" target="_blank" className="auth-link">
                условиями использования
              </Link>{" "}
              и{" "}
              <Link to="/privacy" target="_blank" className="auth-link">
                политикой конфиденциальности
              </Link>
            </label>
            {errors.terms && (
              <div className="form-error">{errors.terms}</div>
            )}
          </div>

          {error && (
            <div className="form-error">
              {typeof error === 'string' ? error : error.error || 'Ошибка регистрации'}
            </div>
          )}

          <button 
            className="auth-button" 
            type="submit" 
            disabled={loading || !agreedToTerms}
          >
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>
      </div>
    </div>
  );
}
