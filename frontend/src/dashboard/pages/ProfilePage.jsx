import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, fetchProfile, updateProfile, changePassword, requestEmailVerification, clearError, clearSuccess, verifyEmail } from '../../store/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

function ProfilePage() {
  const user = useSelector(state => state.auth.user);
  const { error, success, profileUpdating, passwordChanging, emailVerificationSent } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ 
    username: '', 
    email: '', 
    first_name: '', 
    last_name: '' 
  });
  const [passwordForm, setPasswordForm] = useState({ 
    current_password: '', 
    new_password: '', 
    new_password2: '' 
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setProfileForm({ 
        username: user.username || '', 
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || ''
      });
    }
  }, [user]);

  // Очищаем сообщения при смене табов
  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [activeTab, dispatch]);

  // Проверка email токена из URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      dispatch(verifyEmail(token));
    }
  }, [dispatch, location.search]);

  const handleLogout = async () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      await dispatch(logoutUser());
      navigate('/');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    
    // Проверяем, есть ли изменения
    const hasChanges = Object.keys(profileForm).some(
      key => profileForm[key] !== (user[key] || '')
    );

    if (!hasChanges) {
      dispatch(clearError());
      return;
    }

    try {
      await dispatch(updateProfile(profileForm));
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.new_password2) {
      return;
    }

    try {
      await dispatch(changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      }));
      
      // Очищаем форму пароля при успехе
      setPasswordForm({ current_password: '', new_password: '', new_password2: '' });
    } catch (error) {
      console.error('Password change error:', error);
    }
  };

  const handleEmailVerification = async () => {
    try {
      await dispatch(requestEmailVerification());
    } catch (error) {
      console.error('Email verification error:', error);
    }
  };

  const getProfileCompletion = () => {
    if (!user) return 0;
    
    const fields = ['username', 'email', 'first_name', 'last_name'];
    const filled = fields.filter(field => user[field]).length;
    const emailBonus = user.is_email_verified ? 1 : 0;
    
    return Math.round(((filled + emailBonus) / (fields.length + 1)) * 100);
  };
  // Процент заполненности профиля
  const completion = getProfileCompletion();

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

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button type="button" className="back-button" onClick={() => navigate(-1)}>
          ← Назад
        </button>
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
          </div>
        </div>
        <div className="profile-info">
          <h1>{user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}</h1>
          <p className="profile-email">
            {user.email}
            {user.is_email_verified ? (
              <span className="verified-badge">✓ Подтвержден</span>
            ) : (
              <span className="unverified-badge">⚠ Не подтвержден</span>
            )}
          </p>
          {completion < 100 && (
            <div className="profile-completion">
              <div className="completion-bar">
                <div 
                  className="completion-fill" 
                  style={{ width: `${completion}%` }}
                ></div>
              </div>
              <span>Заполненность профиля: {completion}%</span>
            </div>
          )}
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Выйти
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Профиль
          </button>
          <button 
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Безопасность
          </button>
          <button 
            className={`tab-button ${activeTab === 'subscription' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscription')}
          >
            Подписка
          </button>
        </div>

        <div className="tab-content">
          {/* Вкладка профиля */}
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <h2>Личная информация</h2>
              
              {success && (
                <div className="form-success">
                  {success}
                </div>
              )}

              {error && (
                <div className="form-error">
                  {typeof error === 'string' ? error : error.error || 'Ошибка обновления'}
                </div>
              )}

              <form onSubmit={handleProfileSave}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Имя пользователя</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <div className="email-input-group">
                      <input
                        type="email"
                        className="form-input"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      />
                      {!user.is_email_verified && (
                        <button
                          type="button"
                          className="verify-email-button"
                          onClick={handleEmailVerification}
                          disabled={emailVerificationSent}
                        >
                          {emailVerificationSent ? 'Отправлено' : 'Подтвердить'}
                        </button>
                      )}
                    </div>
                    {emailVerificationSent && (
                      <p className="verification-sent">
                        Письмо для подтверждения отправлено на ваш email
                      </p>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Имя</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Фамилия</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="save-button"
                  disabled={profileUpdating}
                >
                  {profileUpdating ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </form>
            </div>
          )}

          {/* Вкладка безопасности */}
          {activeTab === 'security' && (
            <div className="security-tab">
              <h2>Безопасность</h2>

              {success && (
                <div className="form-success">
                  {success}
                </div>
              )}

              {error && (
                <div className="form-error">
                  {typeof error === 'string' ? error : error.error || 'Ошибка изменения пароля'}
                </div>
              )}

              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label className="form-label">Текущий пароль</label>
                  <div className="password-input-container">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      className="form-input"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    >
                      {showPasswords.current ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Новый пароль</label>
                  <div className="password-input-container">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      className="form-input"
                      value={passwordForm.new_password}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\x20-\x7E]/g, '');
                        setPasswordForm({...passwordForm, new_password: v});
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    >
                      {showPasswords.new ? "🙈" : "👁️"}
                    </button>
                  </div>
                  
                  {passwordForm.new_password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div 
                          className="strength-fill" 
                          style={{ 
                            width: `${(getPasswordStrength(passwordForm.new_password).level === 'weak' ? 25 : 
                                     getPasswordStrength(passwordForm.new_password).level === 'fair' ? 50 : 
                                     getPasswordStrength(passwordForm.new_password).level === 'good' ? 75 : 100)}%`,
                            backgroundColor: getPasswordStrength(passwordForm.new_password).color 
                          }}
                        ></div>
                      </div>
                      <span style={{ color: getPasswordStrength(passwordForm.new_password).color }}>
                        {getPasswordStrength(passwordForm.new_password).text}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Подтвердите новый пароль</label>
                  <div className="password-input-container">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      className="form-input"
                      value={passwordForm.new_password2}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\x20-\x7E]/g, '');
                        setPasswordForm({...passwordForm, new_password2: v});
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    >
                      {showPasswords.confirm ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {passwordForm.new_password2 && passwordForm.new_password !== passwordForm.new_password2 && (
                    <div className="form-error">Пароли не совпадают</div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="change-password-button"
                  disabled={passwordChanging || passwordForm.new_password !== passwordForm.new_password2}
                >
                  {passwordChanging ? 'Изменение...' : 'Изменить пароль'}
                </button>
              </form>

              <div className="security-info">
                <h3>Рекомендации по безопасности:</h3>
                <ul>
                  <li>Используйте уникальный пароль для каждого сервиса</li>
                  <li>Пароль должен содержать минимум 8 символов</li>
                  <li>Включите заглавные и строчные буквы, цифры и символы</li>
                  <li>Не используйте личную информацию в пароле</li>
                  <li>Регулярно обновляйте пароли</li>
                </ul>
              </div>
            </div>
          )}

          {/* Вкладка подписки */}
          {activeTab === 'subscription' && (
            <div className="subscription-tab">
              <h2>Подписка</h2>
              
              {user.subscription ? (
                <div className="subscription-info">
                  <div className="subscription-card">
                    <h3>Текущий план: {user.subscription.plan}</h3>
                    <div className="subscription-status">
                      <span className={`status-badge ${user.subscription.is_active ? 'active' : 'inactive'}`}>
                        {user.subscription.is_active ? 'Активна' : 'Неактивна'}
                      </span>
                    </div>
                    
                    {user.subscription.is_active && (
                      <div className="subscription-details">
                        <p><strong>Начало:</strong> {new Date(user.subscription.starts_at).toLocaleDateString('ru-RU')}</p>
                        <p><strong>Окончание:</strong> {new Date(user.subscription.expires_at).toLocaleDateString('ru-RU')}</p>
                        <p><strong>Осталось дней:</strong> {user.subscription.days_left}</p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className="upgrade-button"
                    onClick={() => navigate('/payment')}
                  >
                    {user.subscription.is_active ? 'Продлить подписку' : 'Оформить подписку'}
                  </button>
                </div>
              ) : (
                <div className="no-subscription">
                  <h3>У вас нет активной подписки</h3>
                  <p>Оформите подписку, чтобы получить доступ ко всем возможностям платформы</p>
                  <button 
                    className="upgrade-button"
                    onClick={() => navigate('/payment')}
                  >
                    Оформить подписку
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default ProfilePage;
