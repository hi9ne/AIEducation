import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Button,
  Group,
  Text,
  Title,
  Stack,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  NumberInput,
  FileInput,
  Progress,
  Alert,
  Grid,
  Card,
  Badge,
  Divider,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { motion } from 'framer-motion';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconCalendar,
  IconMapPin,
  IconCamera,
  IconBook,
  IconBriefcase,
  IconTarget,
  IconLanguage,
  IconCurrencyDollar,
  IconClock,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconX,
  IconPlus,
} from '@tabler/icons-react';
import { updateProfile, fetchProfile } from '../../../store/authSlice';

const UserProfileForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Личные данные
    phone: '',
    date_of_birth: null,
    country: '',
    city: '',
    avatar: null,
    
    // Образование и опыт
    bio: '',
    education_background: '',
    work_experience: '',
    
    // Интересы и цели
    interests: [],
    goals: [],
    
    // Языковые навыки
    language_levels: {},
    
    // Предпочтения по обучению
    preferred_countries: [],
    budget_range: '',
    study_duration: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Состояние для добавления языков
  const [newLanguage, setNewLanguage] = useState('');
  const [newLanguageLevel, setNewLanguageLevel] = useState('');

  // Проверяем, заполнен ли профиль
  const isProfileComplete = () => {
    if (!user || !user.profile) return false;
    
    const profile = user.profile;
    return (
      user.phone &&
      user.country &&
      user.city &&
      profile.education_background &&
      profile.interests?.length > 0 &&
      profile.goals?.length > 0 &&
      Object.keys(profile.language_levels || {}).length > 0 &&
      profile.preferred_countries?.length > 0 &&
      profile.budget_range &&
      profile.study_duration
    );
  };

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Загружаем актуальные данные пользователя
        await dispatch(fetchProfile());
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      // Проверяем, нужно ли показывать анкету
      if (isProfileComplete()) {
        navigate('/app/dashboard');
        return;
      }

      // Заполняем форму данными пользователя
      setFormData(prev => ({
        ...prev,
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || null,
        country: user.country || '',
        city: user.city || '',
        bio: user.profile?.bio || '',
        education_background: user.profile?.education_background || '',
        work_experience: user.profile?.work_experience || '',
        interests: user.profile?.interests || [],
        goals: user.profile?.goals || [],
        language_levels: user.profile?.language_levels || {},
        preferred_countries: user.profile?.preferred_countries || [],
        budget_range: user.profile?.budget_range || '',
        study_duration: user.profile?.study_duration || '',
      }));
    }
  }, [user, navigate]);

  const steps = [
    {
      title: 'Личные данные',
      icon: IconUser,
      description: 'Основная информация о вас'
    },
    {
      title: 'Образование и опыт',
      icon: IconBook,
      description: 'Ваше образование и профессиональный опыт'
    },
    {
      title: 'Интересы и цели',
      icon: IconTarget,
      description: 'Что вас интересует и ваши цели'
    },
    {
      title: 'Языковые навыки',
      icon: IconLanguage,
      description: 'Ваш уровень владения языками'
    },
    {
      title: 'Предпочтения',
      icon: IconMapPin,
      description: 'Предпочтения по обучению'
    },
    {
      title: 'Завершение',
      icon: IconCheck,
      description: 'Проверьте и сохраните данные'
    }
  ];

  const countries = [
    'Италия', 'Германия', 'Франция', 'Испания', 'Нидерланды', 'Швеция', 'Норвегия',
    'Дания', 'Финляндия', 'Австрия', 'Швейцария', 'Бельгия', 'Польша', 'Чехия',
    'Венгрия', 'Португалия', 'Ирландия', 'США', 'Канада', 'Австралия', 'Новая Зеландия',
    'Великобритания', 'Япония', 'Южная Корея', 'Сингапур', 'Другие'
  ];

  const interests = [
    'Программирование', 'Дизайн', 'Бизнес', 'Медицина', 'Инженерия', 'Архитектура',
    'Психология', 'Лингвистика', 'История', 'Философия', 'Математика', 'Физика',
    'Химия', 'Биология', 'Экономика', 'Право', 'Журналистика', 'Искусство',
    'Музыка', 'Спорт', 'Кулинария', 'Мода', 'Путешествия', 'Фотография'
  ];

  const goals = [
    'Получить степень бакалавра', 'Получить степень магистра', 'Получить PhD',
    'Изучить новый язык', 'Сменить профессию', 'Повысить квалификацию',
    'Найти работу за рубежом', 'Иммигрировать', 'Расширить кругозор',
    'Познакомиться с новой культурой', 'Развить лидерские качества'
  ];

  const languages = [
    'Английский', 'Итальянский', 'Немецкий', 'Французский', 'Испанский',
    'Португальский', 'Голландский', 'Шведский', 'Норвежский', 'Датский',
    'Финский', 'Польский', 'Чешский', 'Венгерский', 'Японский', 'Корейский',
    'Китайский', 'Арабский', 'Русский', 'Украинский'
  ];

  const languageLevels = [
    { value: 'A1', label: 'A1 - Начальный' },
    { value: 'A2', label: 'A2 - Элементарный' },
    { value: 'B1', label: 'B1 - Средний' },
    { value: 'B2', label: 'B2 - Выше среднего' },
    { value: 'C1', label: 'C1 - Продвинутый' },
    { value: 'C2', label: 'C2 - Владение' },
    { value: 'native', label: 'Родной язык' }
  ];

  const budgetRanges = [
    'До 5,000€ в год',
    '5,000€ - 10,000€ в год',
    '10,000€ - 20,000€ в год',
    '20,000€ - 30,000€ в год',
    '30,000€ - 50,000€ в год',
    'Более 50,000€ в год'
  ];

  const studyDurations = [
    '1 семестр',
    '1 год',
    '2 года',
    '3 года',
    '4 года',
    '5+ лет'
  ];

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Личные данные
        if (!formData.phone.trim()) newErrors.phone = 'Телефон обязателен';
        if (!formData.country.trim()) newErrors.country = 'Страна обязательна';
        if (!formData.city.trim()) newErrors.city = 'Город обязателен';
        break;
      case 1: // Образование и опыт
        if (!formData.education_background.trim()) newErrors.education_background = 'Образование обязательно';
        break;
      case 2: // Интересы и цели
        if (formData.interests.length === 0) newErrors.interests = 'Выберите хотя бы один интерес';
        if (formData.goals.length === 0) newErrors.goals = 'Выберите хотя бы одну цель';
        break;
      case 3: // Языковые навыки
        if (Object.keys(formData.language_levels).length === 0) {
          newErrors.language_levels = 'Укажите хотя бы один язык';
        }
        break;
      case 4: // Предпочтения
        if (formData.preferred_countries.length === 0) newErrors.preferred_countries = 'Выберите хотя бы одну страну';
        if (!formData.budget_range) newErrors.budget_range = 'Укажите бюджет';
        if (!formData.study_duration) newErrors.study_duration = 'Укажите продолжительность обучения';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await dispatch(updateProfile(formData));
      if (updateProfile.fulfilled.match(result)) {
        // Обновляем данные пользователя
        await dispatch(fetchProfile());
        navigate('/app/dashboard');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const addLanguage = () => {
    if (newLanguage && newLanguageLevel) {
      setFormData(prev => ({
        ...prev,
        language_levels: {
          ...prev.language_levels,
          [newLanguage]: newLanguageLevel
        }
      }));
      setNewLanguage('');
      setNewLanguageLevel('');
    }
  };

  const removeLanguage = (language) => {
    const newLanguageLevels = { ...formData.language_levels };
    delete newLanguageLevels[language];
    setFormData(prev => ({
      ...prev,
      language_levels: newLanguageLevels
    }));
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Личные данные
        return (
          <Stack spacing="md">
            <TextInput
              label="Телефон"
              placeholder="+7 (999) 123-45-67"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={errors.phone}
              icon={<IconPhone size={16} />}
            />
            
            <DateInput
              label="Дата рождения"
              placeholder="Выберите дату"
              value={formData.date_of_birth}
              onChange={(value) => handleInputChange('date_of_birth', value)}
              icon={<IconCalendar size={16} />}
            />
            
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Страна"
                  placeholder="Выберите страну"
                  data={countries}
                  value={formData.country}
                  onChange={(value) => handleInputChange('country', value)}
                  error={errors.country}
                  icon={<IconMapPin size={16} />}
                  searchable
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Город"
                  placeholder="Введите город"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  error={errors.city}
                />
              </Grid.Col>
            </Grid>
            
            <FileInput
              label="Фото профиля"
              placeholder="Выберите фото"
              accept="image/*"
              value={formData.avatar}
              onChange={(file) => handleInputChange('avatar', file)}
              icon={<IconCamera size={16} />}
            />
          </Stack>
        );

      case 1: // Образование и опыт
        return (
          <Stack spacing="md">
            <Textarea
              label="О себе"
              placeholder="Расскажите немного о себе..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              minRows={3}
            />
            
            <Textarea
              label="Образование"
              placeholder="Опишите ваше образование..."
              value={formData.education_background}
              onChange={(e) => handleInputChange('education_background', e.target.value)}
              error={errors.education_background}
              minRows={3}
            />
            
            <Textarea
              label="Опыт работы"
              placeholder="Опишите ваш профессиональный опыт..."
              value={formData.work_experience}
              onChange={(e) => handleInputChange('work_experience', e.target.value)}
              minRows={3}
            />
          </Stack>
        );

      case 2: // Интересы и цели
        return (
          <Stack spacing="md">
            <MultiSelect
              label="Интересы"
              placeholder="Выберите ваши интересы"
              data={interests}
              value={formData.interests}
              onChange={(value) => handleInputChange('interests', value)}
              error={errors.interests}
              searchable
            />
            
            <MultiSelect
              label="Цели"
              placeholder="Выберите ваши цели"
              data={goals}
              value={formData.goals}
              onChange={(value) => handleInputChange('goals', value)}
              error={errors.goals}
              searchable
            />
          </Stack>
        );

      case 3: // Языковые навыки
        return (
          <Stack spacing="md">
            <Text size="sm" c="dimmed" mb="sm">
              Укажите ваш уровень владения языками
            </Text>
            
            {Object.entries(formData.language_levels).map(([language, level]) => (
              <Card key={language} withBorder p="sm">
                <Group position="apart">
                  <Text weight={500}>{language}</Text>
                  <Group spacing="xs">
                    <Badge color="blue">{level}</Badge>
                    <ActionIcon
                      color="red"
                      variant="light"
                      size="sm"
                      onClick={() => removeLanguage(language)}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            ))}
            
            <Divider label="Добавить язык" />
            
            <Grid>
              <Grid.Col span={5}>
                <Select
                  label="Язык"
                  placeholder="Выберите язык"
                  data={languages.filter(lang => !formData.language_levels[lang])}
                  value={newLanguage}
                  onChange={setNewLanguage}
                  searchable
                />
              </Grid.Col>
              <Grid.Col span={5}>
                <Select
                  label="Уровень"
                  placeholder="Выберите уровень"
                  data={languageLevels}
                  value={newLanguageLevel}
                  onChange={setNewLanguageLevel}
                />
              </Grid.Col>
              <Grid.Col span={2}>
                <Button
                  onClick={addLanguage}
                  disabled={!newLanguage || !newLanguageLevel}
                  fullWidth
                  style={{ marginTop: 25 }}
                >
                  <IconPlus size={16} />
                </Button>
              </Grid.Col>
            </Grid>
            
            {errors.language_levels && (
              <Text size="sm" c="red">{errors.language_levels}</Text>
            )}
          </Stack>
        );

      case 4: // Предпочтения
        return (
          <Stack spacing="md">
            <MultiSelect
              label="Предпочитаемые страны для обучения"
              placeholder="Выберите страны"
              data={countries}
              value={formData.preferred_countries}
              onChange={(value) => handleInputChange('preferred_countries', value)}
              error={errors.preferred_countries}
              searchable
            />
            
            <Select
              label="Бюджет на обучение"
              placeholder="Выберите бюджет"
              data={budgetRanges}
              value={formData.budget_range}
              onChange={(value) => handleInputChange('budget_range', value)}
              error={errors.budget_range}
              icon={<IconCurrencyDollar size={16} />}
            />
            
            <Select
              label="Планируемая продолжительность обучения"
              placeholder="Выберите продолжительность"
              data={studyDurations}
              value={formData.study_duration}
              onChange={(value) => handleInputChange('study_duration', value)}
              error={errors.study_duration}
              icon={<IconClock size={16} />}
            />
          </Stack>
        );

      case 5: // Завершение
        return (
          <Stack spacing="md">
            <Alert color="green" icon={<IconCheck size={16} />}>
              Проверьте введенные данные и нажмите "Завершить" для сохранения профиля.
            </Alert>
            
            <Card withBorder p="md">
              <Text weight={500} mb="md">Сводка профиля</Text>
              <Stack spacing="xs">
                <Text size="sm"><strong>Телефон:</strong> {formData.phone || 'Не указан'}</Text>
                <Text size="sm"><strong>Страна:</strong> {formData.country || 'Не указана'}</Text>
                <Text size="sm"><strong>Город:</strong> {formData.city || 'Не указан'}</Text>
                <Text size="sm"><strong>Интересы:</strong> {formData.interests.join(', ') || 'Не указаны'}</Text>
                <Text size="sm"><strong>Цели:</strong> {formData.goals.join(', ') || 'Не указаны'}</Text>
                <Text size="sm"><strong>Языки:</strong> {Object.keys(formData.language_levels).length} языков</Text>
                <Text size="sm"><strong>Страны:</strong> {formData.preferred_countries.join(', ') || 'Не указаны'}</Text>
              </Stack>
            </Card>
          </Stack>
        );

      default:
        return null;
    }
  };

  // Показываем загрузку пока данные не загружены
  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Center>
          <Stack align="center" spacing="md">
            <Loader size="lg" />
            <Text>Загрузка данных профиля...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper shadow="sm" p="xl" radius="md">
          <Stack spacing="xl">
            {/* Заголовок */}
            <Box ta="center">
              <Title order={2} mb="sm">
                Добро пожаловать! Давайте создадим ваш профиль
              </Title>
              <Text c="dimmed">
                Заполните анкету, чтобы мы могли лучше подобрать для вас образовательные программы
              </Text>
            </Box>

            {/* Прогресс */}
            <Box>
              <Group position="apart" mb="xs">
                <Text size="sm" weight={500}>
                  Шаг {activeStep + 1} из {steps.length}
                </Text>
                <Text size="sm" c="dimmed">
                  {Math.round(((activeStep + 1) / steps.length) * 100)}%
                </Text>
              </Group>
              <Progress value={((activeStep + 1) / steps.length) * 100} size="sm" />
            </Box>

            {/* Степпер */}
            <Stepper active={activeStep} breakpoint="sm">
              {steps.map((step, index) => (
                <Stepper.Step
                  key={index}
                  label={step.title}
                  description={step.description}
                  icon={<step.icon size={18} />}
                />
              ))}
            </Stepper>

            {/* Контент шага */}
            <Box style={{ minHeight: 400 }}>
              {renderStepContent()}
            </Box>

            {/* Навигация */}
            <Group position="apart">
              <Button
                variant="default"
                leftIcon={<IconArrowLeft size={16} />}
                onClick={handlePrev}
                disabled={activeStep === 0}
              >
                Назад
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  leftIcon={<IconCheck size={16} />}
                  onClick={handleSubmit}
                  loading={isSubmitting}
                >
                  Завершить
                </Button>
              ) : (
                <Button
                  rightIcon={<IconArrowRight size={16} />}
                  onClick={handleNext}
                >
                  Далее
                </Button>
              )}
            </Group>

            {/* Ошибки */}
            {error && (
              <Alert color="red" title="Ошибка">
                {error}
              </Alert>
            )}
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default UserProfileForm;
