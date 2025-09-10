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
import { motion } from 'framer-motion';
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

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const googleBtnRef = useRef(null);

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

    // Анимация появления
    setIsVisible(true);

    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [searchParams, dispatch]);

  // Анимация появления
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Инициализация Google Identity Services: отрисуем официальную кнопку (устойчивее к FedCM)
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!clientId) return;
    const google = window.google?.accounts?.id;
    if (!google) return;

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

    google.initialize({
      client_id: clientId,
      callback: handleCredential,
      // Отключаем FedCM для prompt, чтобы избежать ошибок CORS/FedCM в локальной среде
      use_fedcm_for_prompt: false,
    });

    // Отрисуем фирменную кнопку в контейнере
    if (googleBtnRef.current) {
      google.renderButton(googleBtnRef.current, {
        theme: 'filled_blue',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 320,
      });
    }
  }, [dispatch, navigate]);

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
    console.log('Submitting login form...', formData.email);
    
    if (!formData.email || !formData.password) {
      console.log('Email or password is empty');
      return;
    }

    try {
      console.log('Dispatching loginUser...');
      const payload = twofaCode ? { ...formData, code: twofaCode } : formData;
      const result = await dispatch(loginUser(payload));
      console.log('Login result:', result);
      
      if (loginUser.fulfilled.match(result)) {
        console.log('Login successful, fetching profile...');
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
      } else {
        console.log('Login not fulfilled:', result);
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
        
        <Container size="xl" className="login-container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 0.6 }}
            className="login-content"
          >
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
                <Stack spacing="lg">
                  <TextInput
                    label="Email или имя пользователя"
                    placeholder="Введите ваш email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    leftSection={<IconMail size={20} />}
                    size="lg"
                    radius="md"
                    required
                    autoComplete="username"
                    className="form-input"
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
                    size="xl"
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
                    <div ref={googleBtnRef} />
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

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 50 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="login-features"
            >
              <Stack spacing="lg">
                <Title order={3} size="xl" weight={700} className="features-title">
                  Почему выбирают нас?
                </Title>
                
                <Stack spacing="md">
                  <Group spacing="md">
                    <ThemeIcon size="lg" color="blue" variant="light">
                      <IconShield size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text weight={600}>Безопасность</Text>
                      <Text size="sm" color="dimmed">
                        Ваши данные защищены
                      </Text>
                    </Box>
                  </Group>

                  <Group spacing="md">
                    <ThemeIcon size="lg" color="green" variant="light">
                      <IconStar size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text weight={600}>Качество</Text>
                      <Text size="sm" color="dimmed">
                        Лучшие университеты Италии
                      </Text>
                    </Box>
                  </Group>

                  <Group spacing="md">
                    <ThemeIcon size="lg" color="purple" variant="light">
                      <IconRocket size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text weight={600}>Скорость</Text>
                      <Text size="sm" color="dimmed">
                        Быстрое поступление
                      </Text>
                    </Box>
                  </Group>
                </Stack>
              </Stack>
            </motion.div>
          </motion.div>
        </Container>
      </BackgroundImage>
    </Box>
  );
}
export default LoginPage;
