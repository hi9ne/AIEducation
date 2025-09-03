import { useState } from "react";
import { registerUser, loginUser, fetchProfile } from "../store/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

export function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (formData.username.length < 2) {
      newErrors.username = "Имя пользователя слишком короткое";
    }

    if (!/^\S+@\S+$/.test(formData.email)) {
      newErrors.email = "Неверный email";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Пароль должен содержать минимум 6 символов";
    }

    if (formData.password !== formData.password2) {
      newErrors.password2 = "Пароли не совпадают";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Очищаем ошибку для поля при изменении
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const resultAction = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(resultAction)) {
      // Автоматически входим после успешной регистрации
      const loginResult = await dispatch(
        loginUser({
          username: formData.username,
          password: formData.password,
        })
      );
      if (loginUser.fulfilled.match(loginResult)) {
        // Загружаем профиль пользователя
        await dispatch(fetchProfile());
        navigate("/");
      }
    }
  };

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

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Имя пользователя
              </label>
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
              {errors.username && (
                <div className="form-error">{errors.username}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Пароль
              </label>
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
              {errors.password && (
                <div className="form-error">{errors.password}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password2">
                Подтвердите пароль
              </label>
              <input
                id="password2"
                name="password2"
                type="password"
                className="form-input"
                placeholder="Подтвердите ваш пароль"
                value={formData.password2}
                onChange={handleChange}
                required
              />
              {errors.password2 && (
                <div className="form-error">{errors.password2}</div>
              )}
            </div>

            {error && (
              <div className="form-error">{Object.values(error)[0]}</div>
            )}

            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>
        </div>
      </div>
  );
}
