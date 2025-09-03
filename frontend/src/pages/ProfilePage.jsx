import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchProfile } from '../store/authSlice';
import { authAPI } from '../services/api';

export function ProfilePage() {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({ username: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '' });
  const [saveMsg, setSaveMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) setProfileForm({ username: user.username || '', email: user.email || '' });
  }, [user]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaveMsg('');
    try {
      await authAPI.updateProfile(profileForm);
      await dispatch(fetchProfile());
      setSaveMsg('Сохранено');
    } catch {
      setSaveMsg('Ошибка сохранения');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    try {
      await authAPI.changePassword(passwordForm);
      setPwdMsg('Пароль изменён');
      setPasswordForm({ current_password: '', new_password: '' });
    } catch {
      setPwdMsg('Ошибка смены пароля');
    }
  };

  const handleEmailVerify = async () => {
    setVerifyMsg('');
    setVerifyLoading(true);
    try {
      await authAPI.requestEmailVerify();
      setVerifyMsg('Письмо отправлено. Проверьте почту.');
    } catch {
      setVerifyMsg('Не удалось отправить письмо. Попробуйте позже.');
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="back-button-container">
          <button 
            className="back-button" 
            onClick={() => navigate('/')}
            type="button"
          >
            ← Назад
          </button>
        </div>
        
        <h1 className="profile-title">Профиль</h1>
        
        {user ? (
          <div>
            {!user.email_verified && (
              <div style={{
                background:'linear-gradient(180deg, rgba(253,230,138,0.25), rgba(254,215,170,0.2))',
                border:'1px solid rgba(251,191,36,0.6)',
                color:'#7c2d12', padding:12, borderRadius:12, marginBottom:12
              }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap'}}>
                  <div style={{fontWeight:700}}>Подтвердите почту, чтобы получать чеки об оплате</div>
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <button
                      type="button"
                      onClick={handleEmailVerify}
                      disabled={verifyLoading}
                      style={{ background:'#fff7ed', border:'1px solid #f59e0b', color:'#7c2d12', padding:'8px 12px', borderRadius:8, cursor:'pointer' }}
                    >
                      {verifyLoading ? 'Отправка...' : 'Отправить письмо'}
                    </button>
                  </div>
                </div>
                {verifyMsg && <div style={{marginTop:6, fontSize:13}}>{verifyMsg}</div>}
              </div>
            )}
            <div className="profile-info">
              <div className="profile-item">
                <span className="profile-label">Логин:</span>
                <span className="profile-value">{user.username || user.login}</span>
              </div>
              
              <div className="profile-item">
                <span className="profile-label">Email:</span>
                <span className="profile-value">{user.email} {user.email_verified ? '✓' : ''}</span>
              </div>

              {user.subscription && (
                <div className="profile-item" style={{ marginTop: '12px' }}>
                  <span className="profile-label">Подписка:</span>
                  <span className="profile-value">
                    {user.subscription.is_active ? 'Активна' : 'Не активна'}
                    {user.subscription.plan ? `, план: ${user.subscription.plan}` : ''}
                    {user.subscription.starts_at ? `, с: ${new Date(user.subscription.starts_at).toLocaleDateString()}` : ''}
                    {user.subscription.expires_at ? `, до: ${new Date(user.subscription.expires_at).toLocaleDateString()}` : ''}
                  </span>
                </div>
              )}
            </div>
            
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 16 }}>
              <form onSubmit={handleProfileSave} style={{
                background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16,
                boxShadow:'0 4px 14px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{ marginTop:0, marginBottom:12 }}>Изменить профиль</h3>
                <div className="form-group" style={{ marginBottom:12 }}>
                  <label className="form-label">Логин</label>
                  <input className="form-input" type="text" placeholder="Новый логин" value={profileForm.username} onChange={e => setProfileForm({ ...profileForm, username: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom:12 }}>
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="Новый email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
                </div>
                <button className="auth-button" type="submit" style={{ width:'100%' }}>Сохранить</button>
                {saveMsg && <div className="form-hint" style={{ marginTop: 8 }}>{saveMsg}</div>}
              </form>

              <form onSubmit={handlePasswordChange} style={{
                background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16,
                boxShadow:'0 4px 14px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{ marginTop:0, marginBottom:12 }}>Сменить пароль</h3>
                <div className="form-group" style={{ marginBottom:12 }}>
                  <label className="form-label">Текущий пароль</label>
                  <input className="form-input" type="password" placeholder="Текущий пароль" value={passwordForm.current_password} onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom:12 }}>
                  <label className="form-label">Новый пароль</label>
                  <input className="form-input" type="password" placeholder="Новый пароль" value={passwordForm.new_password} onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} />
                </div>
                <button className="auth-button" type="submit" style={{ width:'100%' }}>Изменить пароль</button>
                {pwdMsg && <div className="form-hint" style={{ marginTop: 8 }}>{pwdMsg}</div>}
              </form>
            </div>

            <div style={{ display:'flex', gap:12, marginTop:16, flexWrap:'wrap' }}>
            <button
              className="payment-button"
              onClick={() => navigate('/payment')}
              style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              💳 Оплата
            </button>
            
            <button
              className="logout-button"
              onClick={handleLogout}
                style={{ padding:'12px 24px' }}
            >
              Выйти
            </button>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>Нет данных о пользователе.</p>
        )}
      </div>
    </div>
  );
}
