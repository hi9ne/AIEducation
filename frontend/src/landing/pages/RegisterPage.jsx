import { useState, useEffect } from "react";
import { registerUser, loginUser, fetchProfile, clearError, clearSuccess } from "../../store/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { notifications } from '@mantine/notifications';
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
  Progress,
  Grid,
  Stepper,
  Badge
} from '@mantine/core';
import {
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconMail,
  IconLock,
  IconUser,
  IconCheck,
  IconAlertCircle,
  IconBrandGoogle,
  IconBrandGithub,
  IconRocket,
  IconShield,
  IconStar,
  IconChecklist,
  IconUserPlus
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import './RegisterPage.css';

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
    username: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Очищаем ошибки при размонтировании
  useEffect(() => {
    setIsVisible(true);
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  // Валидация в реальном времени
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
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
        } else if (/^\d+$/.test(value)) {
          newErrors.password = "Пароль не может состоять только из цифр";
        } else {
          // Check if password contains personal info
          const personalInfo = [
            formData.first_name,
            formData.last_name,
            formData.email.split('@')[0]
          ].filter(Boolean).map(str => str.toLowerCase());
          
          if (personalInfo.some(info => info && value.toLowerCase().includes(info))) {
            newErrors.password = "Пароль не должен содержать ваши личные данные";
          } else {
            // Check for common passwords
            const commonPasswords = [
              'password', '123456', '12345678', 'qwerty', 'admin',
              'welcome', 'monkey', 'letmein', 'dragon', 'football'
            ];
            if (commonPasswords.includes(value.toLowerCase())) {
              newErrors.password = "Этот пароль слишком простой и часто используется";
            } else {
              delete newErrors.password;
            }
          }
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
    if (!formData.email) newErrors.email = "Обязательное поле";
    if (!formData.first_name) newErrors.first_name = "Обязательное поле";
    if (!formData.last_name) newErrors.last_name = "Обязательное поле";
    if (!formData.password) newErrors.password = "Обязательное поле";
    if (!formData.password_confirm) newErrors.password2 = "Обязательное поле";
    // Проверка совпадения паролей
    if (formData.password && formData.password_confirm && formData.password !== formData.password_confirm) {
      newErrors.password2 = "Пароли не совпадают";
    }
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
      // Create the registration payload
      const payload = {
        email: formData.email,
        username: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        password_confirm: formData.password_confirm
      };

      const resultAction = await dispatch(registerUser(payload));
      
      if (registerUser.fulfilled.match(resultAction)) {
        // Show success message
        notifications.show({
          title: 'Успешная регистрация',
          message: 'Пожалуйста, войдите в систему',
          color: 'green'
        });
        
        // Navigate to login page
        navigate("/login?registered=true");
      } else {
        // Check for validation errors in resultAction.payload.details
        const errorDetails = resultAction.payload?.details;
        let errorMessage = resultAction.payload?.error || 'Пожалуйста, проверьте введенные данные';
        
        // If we have field-specific errors, format them
        if (errorDetails && typeof errorDetails === 'object') {
          const fieldErrors = Object.entries(errorDetails)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
          
          if (fieldErrors) {
            errorMessage = fieldErrors;
          }
        }

        notifications.show({
          title: 'Ошибка регистрации',
          message: errorMessage,
          color: 'red',
          autoClose: false // Keep error visible until user dismisses it
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Show unexpected error
      notifications.show({
        title: 'Ошибка регистрации',
        message: 'Произошла неожиданная ошибка. Попробуйте позже.',
        color: 'red'
      });
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

  const steps = [
    { label: 'Личные данные', icon: IconUser },
    { label: 'Безопасность', icon: IconLock },
    { label: 'Подтверждение', icon: IconCheck }
  ];

  return (
    <Box className="register-page">
      <BackgroundImage
        src="/images/bg-hero.jpg"
        className="register-background"
      >
        <Container size="xl" className="register-container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 0.6 }}
            className="register-content"
          >
            <Paper className="register-card" p="xl" radius="xl" shadow="xl">
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
                      <IconUserPlus size={20} />
                    </ThemeIcon>
                    <Text size="lg" weight={700}>
                      AI Education
                    </Text>
                  </Group>
                </Group>

                <Box>
                  <Title order={1} size="2.5rem" weight={800} className="register-title">
                    Создать аккаунт
                  </Title>
                  <Text size="lg" color="dimmed" className="register-subtitle">
                    Присоединяйтесь к тысячам студентов, которые уже получили образование в Италии
                  </Text>
                </Box>

                {/* Progress Stepper */}
                <Stepper
                  active={currentStep}
                  onStepClick={setCurrentStep}
                  breakpoint="sm"
                  className="register-stepper"
                >
                  {steps.map((step, index) => (
                    <Stepper.Step
                      key={index}
                      label={step.label}
                      icon={<step.icon size={18} />}
                    />
                  ))}
                </Stepper>
              </Stack>

              {/* Alerts */}
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
                  {/* Step 1: Personal Info */}
                  {currentStep === 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Stack spacing="lg">
                        <Text size="lg" weight={600} className="step-title">
                          Личная информация
                        </Text>
                        
                        <TextInput
                          label="Email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          leftSection={<IconMail size={20} />}
                          size="lg"
                          radius="md"
                          required
                          error={errors.email}
                          className="form-input"
                        />

                        <Grid gutter="md">
                          <Grid.Col span={6}>
                            <TextInput
                              label="Имя"
                              placeholder="Ваше имя"
                              value={formData.first_name}
                              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                              leftSection={<IconUser size={20} />}
                              size="lg"
                              radius="md"
                              required
                              error={errors.first_name}
                              className="form-input"
                            />
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <TextInput
                              label="Фамилия"
                              placeholder="Ваша фамилия"
                              value={formData.last_name}
                              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                              leftSection={<IconUser size={20} />}
                              size="lg"
                              radius="md"
                              required
                              error={errors.last_name}
                              className="form-input"
                            />
                          </Grid.Col>
                        </Grid>

                        <Button
                          size="lg"
                          fullWidth
                          onClick={() => setCurrentStep(1)}
                          className="next-button"
                          disabled={!formData.email || !formData.first_name || !formData.last_name}
                        >
                          Продолжить
                        </Button>
                      </Stack>
                    </motion.div>
                  )}

                  {/* Step 2: Security */}
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Stack spacing="lg">
                        <Group position="apart" align="center">
                          <Text size="lg" weight={600} className="step-title">
                            Безопасность
                          </Text>
                          <Button
                            variant="subtle"
                            size="sm"
                            onClick={() => setCurrentStep(0)}
                          >
                            Назад
                          </Button>
                        </Group>

                        <PasswordInput
                          label="Пароль"
                          placeholder="Создайте надежный пароль"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          leftSection={<IconLock size={20} />}
                          size="lg"
                          radius="md"
                          required
                          error={errors.password}
                          className="form-input"
                          visibilityToggleIcon={({ reveal, size }) => (
                            reveal ? <IconEyeOff size={size} /> : <IconEye size={size} />
                          )}
                        />

                        {formData.password && (
                          <Box>
                            <Group position="apart" mb="xs">
                              <Text size="sm" weight={500}>
                                Надежность пароля
                              </Text>
                              <Badge
                                color={
                                  passwordStrength.level === 'weak' ? 'red' :
                                  passwordStrength.level === 'fair' ? 'yellow' :
                                  passwordStrength.level === 'good' ? 'blue' : 'green'
                                }
                                variant="light"
                              >
                                {passwordStrength.text}
                              </Badge>
                            </Group>
                            <Progress
                              value={
                                passwordStrength.level === 'weak' ? 25 :
                                passwordStrength.level === 'fair' ? 50 :
                                passwordStrength.level === 'good' ? 75 : 100
                              }
                              color={
                                passwordStrength.level === 'weak' ? 'red' :
                                passwordStrength.level === 'fair' ? 'yellow' :
                                passwordStrength.level === 'good' ? 'blue' : 'green'
                              }
                              size="sm"
                              radius="md"
                            />
                          </Box>
                        )}

                        <PasswordInput
                          label="Подтвердите пароль"
                          placeholder="Повторите ваш пароль"
                          value={formData.password_confirm}
                          onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                          leftSection={<IconLock size={20} />}
                          size="lg"
                          radius="md"
                          required
                          error={errors.password2}
                          className="form-input"
                          visibilityToggleIcon={({ reveal, size }) => (
                            reveal ? <IconEyeOff size={size} /> : <IconEye size={size} />
                          )}
                        />

                        <Button
                          size="lg"
                          fullWidth
                          onClick={() => setCurrentStep(2)}
                          className="next-button"
                          disabled={!formData.password || !formData.password_confirm || errors.password || errors.password2}
                        >
                          Продолжить
                        </Button>
                      </Stack>
                    </motion.div>
                  )}

                  {/* Step 3: Confirmation */}
                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Stack spacing="lg">
                        <Group position="apart" align="center">
                          <Text size="lg" weight={600} className="step-title">
                            Подтверждение
                          </Text>
                          <Button
                            variant="subtle"
                            size="sm"
                            onClick={() => setCurrentStep(1)}
                          >
                            Назад
                          </Button>
                        </Group>

                        <Paper p="md" radius="md" withBorder className="summary-card">
                          <Stack spacing="sm">
                            <Text weight={600}>Сводка регистрации:</Text>
                            <Group position="apart">
                              <Text size="sm" color="dimmed">Email:</Text>
                              <Text size="sm">{formData.email}</Text>
                            </Group>
                            <Group position="apart">
                              <Text size="sm" color="dimmed">Имя:</Text>
                              <Text size="sm">{formData.first_name} {formData.last_name}</Text>
                            </Group>
                            <Group position="apart">
                              <Text size="sm" color="dimmed">Пароль:</Text>
                              <Text size="sm">••••••••</Text>
                            </Group>
                          </Stack>
                        </Paper>

                        <Checkbox
                          label={
                            <Text size="sm">
                              Я согласен с{' '}
                              <Anchor href="/offer" target="_blank" size="sm">
                                условиями использования
                              </Anchor>{' '}
                              и{' '}
                              <Anchor href="/privacy" target="_blank" size="sm">
                                политикой конфиденциальности
                              </Anchor>
                            </Text>
                          }
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.currentTarget.checked)}
                          size="md"
                          error={errors.terms}
                        />

                        {error && (
                          <Alert
                            icon={<IconAlertCircle size={16} />}
                            title="Ошибка регистрации"
                            color="red"
                            radius="md"
                          >
                            {typeof error === 'string' ? error : error.error || 'Произошла ошибка при регистрации'}
                          </Alert>
                        )}

                        <Button
                          type="submit"
                          size="xl"
                          fullWidth
                          loading={loading}
                          disabled={!agreedToTerms}
                          className="register-button"
                          radius="md"
                        >
                          {loading ? 'Регистрация...' : 'Создать аккаунт'}
                        </Button>
                      </Stack>
                    </motion.div>
                  )}

                  <Divider label="или" labelPosition="center" />

                  <Stack spacing="sm">
                    <Button
                      variant="outline"
                      size="lg"
                      fullWidth
                      leftSection={<IconBrandGoogle size={20} />}
                      className="social-button"
                      radius="md"
                    >
                      Зарегистрироваться через Google
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      fullWidth
                      leftSection={<IconBrandGithub size={20} />}
                      className="social-button"
                      radius="md"
                    >
                      Зарегистрироваться через GitHub
                    </Button>
                  </Stack>

                  <Center>
                    <Group spacing="xs">
                      <Text size="sm" color="dimmed">
                        Уже есть аккаунт?
                      </Text>
                      <Anchor
                        size="sm"
                        weight={600}
                        onClick={() => navigate('/login')}
                        className="login-link"
                      >
                        Войти
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
              className="register-features"
            >
              <Stack spacing="lg">
                <Title order={3} size="xl" weight={700} className="features-title">
                  Преимущества регистрации
                </Title>
                
                <Stack spacing="md">
                  <Group spacing="md">
                    <ThemeIcon size="lg" color="blue" variant="light">
                      <IconChecklist size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text weight={600}>Персональный план</Text>
                      <Text size="sm" color="dimmed">
                        Индивидуальная стратегия поступления
                      </Text>
                    </Box>
                  </Group>

                  <Group spacing="md">
                    <ThemeIcon size="lg" color="green" variant="light">
                      <IconShield size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text weight={600}>Безопасность</Text>
                      <Text size="sm" color="dimmed">
                        Защита персональных данных
                      </Text>
                    </Box>
                  </Group>

                  <Group spacing="md">
                    <ThemeIcon size="lg" color="purple" variant="light">
                      <IconStar size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text weight={600}>Экспертная поддержка</Text>
                      <Text size="sm" color="dimmed">
                        24/7 помощь специалистов
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
export default RegisterPage;
