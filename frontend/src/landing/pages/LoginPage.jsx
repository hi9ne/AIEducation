import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, fetchProfile, clearError, clearSuccess } from '../../store/authSlice';
import {
  Box,
  Container,
  Paper,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Checkbox,
  Group,
  Stack,
  Title,
  Divider,
  Alert,
  Anchor,
  Center,
  ThemeIcon,
  BackgroundImage,
  Overlay,
  ActionIcon,
  Progress
} from '@mantine/core';
import {
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconMail,
  IconLock,
  IconCheck,
  IconAlertCircle,
  IconBrandGoogle,
  IconRocket,
  IconShield,
  IconStar
} from '@tabler/icons-react';
// animations removed for performance
import './LoginPage.css';
import { authAPI } from '../../shared/services/api';
import { useRef } from 'react';

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, success } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [twofaCode, setTwofaCode] = useState('');

  // const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  // const [isVisible, setIsVisible] = useState(false);
  // const [passwordStrength, setPasswordStrength] = useState(0);
  const googleBtnRef = useRef(null);
  const emailRef = useRef(null);

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

    // init

    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [searchParams, dispatch]);

  // Анимация появления
  useEffect(() => {
    // Автофокус на email
    emailRef.current?.focus?.();
  }, []);

  // Инициализация Google Identity Services: отрисуем официальную кнопку (устойчивее к FedCM)
  useEffect(() => {
    const host = window.location.hostname || '';
    const proto = window.location.protocol || '';
    const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    const isLanHost = host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.');
    const isHttp = proto === 'http:';
    const isDevLikeOrigin = isLocalHost || isLanHost || isHttp;
    const enableDevGsi = (import.meta.env.VITE_ENABLE_GSI_DEV || '') === '1' || Boolean(import.meta.env.DEV);
    const devId = import.meta.env.VITE_GOOGLE_CLIENT_ID_DEV || '';
    const prodId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    // По умолчанию отключаем GSI в dev/HTTP/LAN, чтобы не было 403. Включается флагом VITE_ENABLE_GSI_DEV=1
    if (isDevLikeOrigin && !enableDevGsi) return;
    const clientId = isDevLikeOrigin ? devId : prodId;
    // Не инициализируем GSI, если для dev нет отдельного client_id — это уберёт 403 от GSI
    if (!clientId) return;
    const ensureGsiLoaded = () => new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) return resolve(window.google.accounts.id);
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google?.accounts?.id);
      script.onerror = reject;
      document.head.appendChild(script);
    });

    const handleCredential = async (response) => {
      try {
        const idToken = response?.credential;
        if (!idToken) return;
        const res = await authAPI.loginWithGoogle(idToken);
        const data = res.data;
        if (data?.tokens) {
          localStorage.setItem('accessToken', data.tokens.access);
          localStorage.setItem('refreshToken', data.tokens.refresh);
          localStorage.setItem('userInfo', JSON.stringify(data.user));
          const profileAction = await dispatch(fetchProfile());
          const fetchedUser = profileAction?.payload;
          const done = fetchedUser?.profile?.onboarding_completed === true;
          navigate(done ? '/app/dashboard' : '/app/onboarding');
        }
      } catch (e) {
        console.error('Google login error', e);
      }
    };

    (async () => {
      const google = await ensureGsiLoaded();
      if (!google) return;
      try {
        google.initialize({
          client_id: clientId,
          callback: handleCredential,
          use_fedcm_for_prompt: false,
        });
      } catch (e) {
        console.warn('GSI initialize blocked:', e);
        return;
      }

      const renderGsiButton = () => {
        const el = googleBtnRef.current;
        if (!el) return;
        el.innerHTML = '';
        try {
          google.renderButton(el, {
            theme: 'filled_blue',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 320,
          });
        } catch (e) {
          console.warn('GSI renderButton blocked:', e);
        }
      };

      renderGsiButton();

      // Фиксированная ширина, пересчёт не требуется
    })();
  }, [dispatch, navigate]);

  // const handleChange = (e) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.value
  //   });
  //   if (error) {
  //     dispatch(clearError());
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // submit
    
    if (!formData.email || !formData.password) {
      console.log('Email or password is empty');
      return;
    }

    try {
      
      const payload = twofaCode ? { ...formData, code: twofaCode } : formData;
      const result = await dispatch(loginUser(payload));
      
      
      if (loginUser.fulfilled.match(result)) {
        
        // Загружаем полный профиль
  const profileAction = await dispatch(fetchProfile());
  const fetchedUser = profileAction?.payload;
  const done = fetchedUser?.profile?.onboarding_completed === true;

  // Ведем пользователя в нужный раздел в зависимости от флага онбординга
  if (done) {
          navigate('/app/dashboard');
        } else {
          navigate('/app/onboarding');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Проверка больше не нужна — используем флаг с бэкенда

  const handleForgotPassword = () => {
    navigate('/reset-password');
  };

  const canSubmit = formData.email && formData.password && !loading;

  return (
    <Box className="login-page">
      <BackgroundImage
        src="/images/bg-hero.jpg"
        className="login-background"
      >
        <Overlay color="#000" opacity={0.22} zIndex={1} />
        
        <Container size="xl" className="login-container">
          <div className="login-content">
            <Paper className="login-card" p="xl" radius="xl" shadow="xl">
              {/* Header */}
              <Stack spacing="md" mb="xl">
                <Group position="apart" align="center">
                  <ActionIcon
                    variant="light"
                    size="lg"
                    onClick={() => navigate('/')}
                    className="back-button"
                  >
                    <IconArrowLeft size={20} />
                  </ActionIcon>
                  <Group spacing="xs">
                    <ThemeIcon size="lg" variant="gradient" gradient={{ from: 'blue', to: 'purple' }}>
                      <IconRocket size={20} />
                    </ThemeIcon>
                    <Text size="lg" weight={700}>
                      AI Education
                    </Text>
                  </Group>
                </Group>

                <Box>
                  <Title order={1} size="2.5rem" weight={800} className="login-title">
                    Добро пожаловать!
                  </Title>
                  <Text size="lg" color="dimmed" className="login-subtitle">
                    Войдите в свой аккаунт для продолжения
                  </Text>
                </Box>
              </Stack>

              {/* Alerts */}
              {searchParams.get('expired') && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Сессия истекла"
                  color="yellow"
                  mb="md"
                  radius="md"
                >
                  Пожалуйста, войдите снова для продолжения работы
                </Alert>
              )}

              {searchParams.get('registered') && (
                <Alert
                  icon={<IconCheck size={16} />}
                  title="Регистрация успешна"
                  color="green"
                  mb="md"
                  radius="md"
                >
                  Регистрация прошла успешно! Теперь вы можете войти в систему
                </Alert>
              )}

              {success && (
                <Alert
                  icon={<IconCheck size={16} />}
                  title="Успех"
                  color="green"
                  mb="md"
                  radius="md"
                >
                  {success}
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <Stack spacing="md">
                  <TextInput
                    label="Email"
                    placeholder="Введите ваш email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    leftSection={<IconMail size={20} />}
                    size="lg"
                    radius="md"
                    ref={emailRef}
                    required
                    autoComplete="username"
                    className="form-input"
                    disabled={loading}
                  />

                  <PasswordInput
                    label="Пароль"
                    placeholder="Введите ваш пароль"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    leftSection={<IconLock size={20} />}
                    size="lg"
                    radius="md"
                    required
                    autoComplete="current-password"
                    className="form-input"
                    visibilityToggleIcon={({ reveal, size }) => (
                      reveal ? <IconEyeOff size={size} /> : <IconEye size={size} />
                    )}
                    disabled={loading}
                  />

                  {/* 2FA code */}
                  <TextInput
                    label="Код 2FA (если включён)"
                    placeholder="123456"
                    value={twofaCode}
                    onChange={(e) => setTwofaCode(e.target.value)}
                    size="lg"
                    radius="md"
                    autoComplete="one-time-code"
                    className="form-input"
                    disabled={loading}
                  />

                  <Group position="apart" align="center">
                    <Checkbox
                      label="Запомнить меня"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.currentTarget.checked)}
                      size="md"
                    />
                    <Anchor
                      size="sm"
                      onClick={handleForgotPassword}
                      className="forgot-password-link"
                    >
                      Забыли пароль?
                    </Anchor>
                  </Group>

                  {error && (
                    <Alert
                      icon={<IconAlertCircle size={16} />}
                      title="Ошибка входа"
                      color="red"
                      radius="md"
                    >
                      {typeof error === 'string' ? error : error.error || 'Неверный логин или пароль'}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={loading}
                    disabled={!canSubmit}
                    className="login-button"
                    radius="md"
                  >
                    {loading ? 'Вход...' : 'Войти'}
                  </Button>

                  <Divider label="или" labelPosition="center" />

                  <Stack spacing="sm">
                    {/* Контейнер официальной кнопки Google */}
                    <div className="social-google" ref={googleBtnRef} />
                  </Stack>

                  <Center>
                    <Group spacing="xs">
                      <Text size="sm" color="dimmed">
                        Нет аккаунта?
                      </Text>
                      <Anchor
                        size="sm"
                        weight={600}
                        onClick={() => navigate('/register')}
                        className="register-link"
                      >
                        Зарегистрироваться
                      </Anchor>
                    </Group>
                  </Center>
                </Stack>
              </form>
            </Paper>

            
          </div>
        </Container>
      </BackgroundImage>
    </Box>
  );
}
export default LoginPage;
