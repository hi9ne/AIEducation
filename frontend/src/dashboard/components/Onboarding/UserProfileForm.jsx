import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';
import { updateProfileComplete, updateProfile, fetchProfile } from '../../../store/authSlice';
import {
  Box,
  Container,
  Paper,
  Button,
  Group,
  Text,
  Title,
  Stack,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
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
  Radio,
  SimpleGrid,
  ThemeIcon,
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
  IconCertificate,
  IconSchool,
  IconMap,
} from '@tabler/icons-react';

const UserProfileForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  // Normalize helpers to keep UI components stable
  const toArray = (val) => {
    if (Array.isArray(val)) return val;
    if (val == null) return [];
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
        return val ? [val] : [];
      } catch {
        return val ? [val] : [];
      }
    }
    return [];
  };

  const toObject = (val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      } catch {
        return {};
      }
    }
    return {};
  };
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Личные данные
  first_name: '',
  last_name: '',
    phone_code: '+7',
    phone_local: '',
    date_of_birth: null,
    city: '',
    avatar: null,
    
    // Образование и опыт
  education_level: '',
    bio: '',
    education_background: '',
    work_experience: '',
    
    // Интересы и цели
    interests: [],
    goals: [],
    
    // Языковые навыки
    language_levels: {},
    
  // Предпочтения по обучению
    budget_range: '',
    study_duration: '',
    // Внутренние поля для сертификатов
    exams: {
      ielts: { status: '', date: '', score: '', file: null },
      toefl: { status: '', date: '', score: '', file: null },
      tolc: { status: '', date: '', score: '', file: null },
    },
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
      user.city &&
      profile.education_background &&
      profile.interests?.length > 0 &&
      profile.goals?.length > 0 &&
      Object.keys(profile.language_levels || {}).length > 0 &&
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
  // Перенесено в PrivateLayout, чтобы избежать конфликтующих редиректов
  // if (isProfileComplete()) {
  //   navigate('/app/dashboard');
  //   return;
  // }

      // Заполняем форму данными пользователя
      setFormData(prev => ({
        ...prev,
  first_name: user.first_name || '',
  last_name: user.last_name || '',
        phone_code: '+7',
        phone_local: '',
        date_of_birth: user.date_of_birth ? new Date(user.date_of_birth) : null,
        city: user.city || '',
        bio: user.profile?.bio || '',
        education_background: user.profile?.education_background || '',
        work_experience: user.profile?.work_experience || '',
        interests: toArray(user.profile?.interests),
        goals: toArray(user.profile?.goals),
        language_levels: toObject(user.profile?.language_levels),
        budget_range: user.profile?.budget_range || '',
        study_duration: user.profile?.study_duration || '',
      }));
    }
  }, [user, navigate]);

  const steps = [
    { title: 'Личные данные', icon: IconUser },
    { title: 'Образование', icon: IconBook },
    { title: 'Сертификаты', icon: IconCertificate },
    { title: 'Направления', icon: IconTarget },
    { title: 'География', icon: IconMap },
    { title: 'Предпочтения', icon: IconMapPin },
    { title: 'Завершение', icon: IconCheck },
  ];

  // Список телефонных кодов с флагами
  const phoneCodes = [
    { value: '+39', label: '🇮🇹 +39' },
    { value: '+7', label: '🇷🇺 +7' },
    { value: '+380', label: '🇺🇦 +380' },
    { value: '+375', label: '🇧🇾 +375' },
    { value: '+1', label: '🇺🇸 +1' },
    { value: '+44', label: '🇬🇧 +44' },
    { value: '+49', label: '🇩🇪 +49' },
    { value: '+33', label: '🇫🇷 +33' },
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
        if (!formData.first_name.trim()) newErrors.first_name = 'Имя обязательно';
        if (!formData.last_name.trim()) newErrors.last_name = 'Фамилия обязательна';
        if (!formData.phone_local || !String(formData.phone_local).trim()) newErrors.phone_local = 'Телефон обязателен';
        if (!formData.city || !String(formData.city).trim()) newErrors.city = 'Город обязателен';
        break;
      case 1: // Образование
        if (!formData.education_level) newErrors.education_level = 'Выберите уровень образования';
        break;
      case 2: // Сертификаты — опционально
        if (!formData.exams?.ielts?.status || !formData.exams?.toefl?.status || !formData.exams?.tolc?.status) {
          newErrors.exams = 'Выберите статус по каждому экзамену (IELTS, TOEFL, TOLC)';
        }
        break;
      case 3: // Направления
        if (formData.interests.length === 0) newErrors.interests = 'Выберите хотя бы одно направление';
        if (formData.goals.length === 0) newErrors.goals = 'Выберите хотя бы одну цель';
        break;
      case 4: // География (пока без обязательных полей)
        break;
      case 5: // Предпочтения
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
      // Validate the current step before submitting
      if (!validateStep(activeStep)) {
        setIsSubmitting(false);
        return;
      }
      // Сначала обновим имя/фамилию при необходимости
      const baseUpdate = {};
      if (formData.first_name && formData.first_name !== (user?.first_name || '')) baseUpdate.first_name = formData.first_name;
      if (formData.last_name && formData.last_name !== (user?.last_name || '')) baseUpdate.last_name = formData.last_name;
      if (Object.keys(baseUpdate).length > 0) {
        await dispatch(updateProfile(baseUpdate));
      }

      // Маппинг полей в формат backend
      const payload = {
        phone: `${formData.phone_code} ${formData.phone_local}`.trim(),
        date_of_birth: formData.date_of_birth instanceof Date ? formData.date_of_birth.toISOString().slice(0,10) : formData.date_of_birth,
        city: formData.city,
        avatar: formData.avatar,
        bio: formData.bio,
        education_background: formData.education_level || formData.education_background,
        work_experience: formData.work_experience,
        interests: formData.interests,
        goals: formData.goals,
        language_levels: formData.language_levels,
        budget_range: formData.budget_range,
        study_duration: formData.study_duration,
      };

      await dispatch(updateProfileComplete(payload)).unwrap();
      
      // Show success notification
      showNotification({
        title: 'Успешно',
        message: 'Профиль успешно обновлен',
        color: 'green',
      });

  // Update profile data and navigate
  // Отметим прохождение онбординга локально и сразу перейдем в кабинет
  try { localStorage.setItem('onboardingComplete', 'true'); } catch {}
  navigate('/app/dashboard', { replace: true });
  // Обновим профиль в фоне (не блокируем переход)
  dispatch(fetchProfile());
    } catch (error) {
      console.error('Error updating profile:', error);
      // Show error notification
      showNotification({
        title: 'Ошибка',
        message: 'Ошибка при обновлении профиля. Пожалуйста, проверьте введенные данные.',
        color: 'red',
      });
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
            <DateInput
              label="Дата рождения"
              placeholder="Выберите дату"
              value={formData.date_of_birth}
              onChange={(value) => handleInputChange('date_of_birth', value)}
              icon={<IconCalendar size={16} />}
            />
            <TextInput
              label="Город"
              placeholder="Введите город"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              error={errors.city}
            />
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

      case 1: // Образование
        return (
          <Stack spacing="md">
            <Title order={3}>Уровень образования</Title>
            <Radio.Group value={formData.education_level} onChange={(v)=>handleInputChange('education_level', v)} error={errors.education_level}>
              <Stack>
                <Radio value="12 класс" label="12 класс" />
                <Radio value="1 курс университета" label="1 курс университета" />
              </Stack>
            </Radio.Group>
            <Divider label="Дополнительно (необязательно)" />
            <Textarea label="О себе" placeholder="Расскажите немного о себе..." value={formData.bio} onChange={(e)=>handleInputChange('bio', e.target.value)} minRows={3} />
            <Textarea label="Опыт работы" placeholder="Опишите ваш профессиональный опыт..." value={formData.work_experience} onChange={(e)=>handleInputChange('work_experience', e.target.value)} minRows={3} />
          </Stack>
        );

      case 2: // Сертификаты + языки
        return (
          <Stack spacing="md">
            <Title order={3}>Языковые сертификаты</Title>
            {['ielts','toefl','tolc'].map((examKey) => (
              <Card key={examKey} withBorder p="md">
                <Group position="apart" mb="sm">
                  <Group>
                    <ThemeIcon variant="light" size="lg"><IconCertificate size={18} /></ThemeIcon>
                    <Text weight={500}>{examKey.toUpperCase()}</Text>
                  </Group>
                </Group>
                <SimpleGrid cols={3} spacing="sm" breakpoints={[{ maxWidth: 'sm', cols: 1 }] }>
                  <Select label="Статус" placeholder="Выберите" data={[{value:'have',label:'Есть сертификат'},{value:'passed',label:'Сдавал'},{value:'no',label:'Нет'}]} value={formData.exams[examKey].status} onChange={(v)=>setFormData(prev=>({...prev, exams:{...prev.exams,[examKey]:{...prev.exams[examKey], status:v}}}))} />
                  <TextInput label="Дата" placeholder="YYYY-MM" value={formData.exams[examKey].date}
                    onChange={(e)=>{
                      const val = (e.target.value || '').toUpperCase();
                      const cleaned = val.replace(/[^0-9-]/g,'').slice(0,7);
                      // enforce basic YYYY-MM structure
                      const normalized = cleaned.length > 4 && cleaned[4] !== '-' ? cleaned.slice(0,4) + '-' + cleaned.slice(4,6) : cleaned;
                      setFormData(prev=>({...prev, exams:{...prev.exams,[examKey]:{...prev.exams[examKey], date: normalized}}}));
                    }} />
                  <TextInput label="Баллы" placeholder="Напр. 6.5" value={formData.exams[examKey].score}
                    inputMode="decimal"
                    onChange={(e)=>{
                      const raw = e.target.value || '';
                      const cleaned = raw.replace(/[^0-9.,]/g,'').replace(',','.');
                      // allow only one dot
                      const parts = cleaned.split('.');
                      const normalized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
                      setFormData(prev=>({...prev, exams:{...prev.exams,[examKey]:{...prev.exams[examKey], score: normalized}}}));
                    }} />
                </SimpleGrid>
                <Group mt="sm">
                  <FileInput label="Загрузить PDF" placeholder="Выберите файл" accept="application/pdf" value={formData.exams[examKey].file} onChange={(file)=>setFormData(prev=>({...prev, exams:{...prev.exams,[examKey]:{...prev.exams[examKey], file}}}))} />
                </Group>
              </Card>
            ))}

            <Divider label="Уровень владения языками" />
            {Object.entries(formData.language_levels).map(([language, level]) => (
              <Card key={language} withBorder p="sm">
                <Group position="apart">
                  <Text weight={500}>{language}</Text>
                  <Group spacing="xs">
                    <Badge color="blue">{level}</Badge>
                    <ActionIcon color="red" variant="light" size="sm" onClick={() => removeLanguage(language)}>
                      <IconX size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            ))}
            <Grid>
              <Grid.Col span={5}>
                <Select label="Язык" placeholder="Выберите язык" data={languages.filter(lang => !formData.language_levels[lang])} value={newLanguage} onChange={setNewLanguage} searchable />
              </Grid.Col>
              <Grid.Col span={5}>
                <Select label="Уровень" placeholder="Выберите уровень" data={languageLevels} value={newLanguageLevel} onChange={setNewLanguageLevel} />
              </Grid.Col>
              <Grid.Col span={2}>
                <Button onClick={addLanguage} disabled={!newLanguage || !newLanguageLevel} fullWidth style={{ marginTop: 25 }}>
                  <IconPlus size={16} />
                </Button>
              </Grid.Col>
            </Grid>
            {errors.language_levels && (<Text size="sm" c="red">{errors.language_levels}</Text>)}
          </Stack>
        );

      case 3: // Направления
        return (
          <Stack spacing="md">
            <MultiSelect
              label="Интересы"
              placeholder="Выберите ваши интересы"
              data={interests}
              value={Array.isArray(formData.interests) ? formData.interests : toArray(formData.interests)}
              onChange={(value) => handleInputChange('interests', Array.isArray(value) ? value : toArray(value))}
              error={errors.interests}
              searchable
            />
            
            <MultiSelect
              label="Цели"
              placeholder="Выберите ваши цели"
              data={goals}
              value={Array.isArray(formData.goals) ? formData.goals : toArray(formData.goals)}
              onChange={(value) => handleInputChange('goals', Array.isArray(value) ? value : toArray(value))}
              searchable
            />
          </Stack>
        );

      case 4: // География (пока без выбора стран)
        return (
          <Stack spacing="md">
            <Card withBorder p="md">
              <Group>
                <ThemeIcon variant="light"><IconMap size={16}/></ThemeIcon>
                <Text size="sm" c="dimmed">Мы подберем варианты в разных странах на основе ваших интересов и бюджета. Этот шаг пока необязателен.</Text>
              </Group>
            </Card>
          </Stack>
        );

      case 5: // Предпочтения
        return (
          <Stack spacing="md">
            <Select label="Бюджет на обучение" placeholder="Выберите бюджет" data={budgetRanges} value={formData.budget_range} onChange={(value) => handleInputChange('budget_range', value)} error={errors.budget_range} icon={<IconCurrencyDollar size={16} />} />
            <Select label="Планируемая продолжительность обучения" placeholder="Выберите продолжительность" data={studyDurations} value={formData.study_duration} onChange={(value) => handleInputChange('study_duration', value)} error={errors.study_duration} icon={<IconClock size={16} />} />
          </Stack>
        );

      case 6: // Завершение
        return (
          <Stack spacing="md">
            <Alert color="green" icon={<IconCheck size={16} />}>
              Проверьте введенные данные и нажмите "Завершить" для сохранения профиля.
            </Alert>
            
            <Card withBorder p="md">
              <Text weight={500} mb="md">Сводка профиля</Text>
              <Stack spacing="xs">
                <Text size="sm"><strong>Телефон:</strong> {`${formData.phone_code} ${formData.phone_local}`.trim() || 'Не указан'}</Text>
                <Text size="sm"><strong>Город:</strong> {formData.city || 'Не указан'}</Text>
                <Text size="sm"><strong>Интересы:</strong> {formData.interests.join(', ') || 'Не указаны'}</Text>
                <Text size="sm"><strong>Цели:</strong> {formData.goals.join(', ') || 'Не указаны'}</Text>
                <Text size="sm"><strong>Языки:</strong> {Object.keys(formData.language_levels).length} языков</Text>
                
              </Stack>
            </Card>
          </Stack>
        );

      default:
        return null;
    }
  };

  // Подсказки AI
  const aiHints = useMemo(() => {
    const hints = [];
    if (activeStep === 1 && formData.education_level === '12 класс') {
      hints.push('Вы выбрали 12 класс — проверьте шаги для поступления');
    }
    if (activeStep === 2 && Object.keys(formData.language_levels).length > 0) {
      hints.push('Добавьте сертификаты, если они есть — это усилит заявку');
    }
    if (activeStep === 3 && formData.interests.includes('Программирование')) {
      hints.push('Рекомендации: Data Science, Cybersecurity, AI');
    }
  // География пока без выбора стран
    if (activeStep === 5 && formData.budget_range) {
      hints.push(`Подберем направления в бюджете: ${formData.budget_range}`);
    }
    return hints;
  }, [activeStep, formData]);

  const pct = Math.round(((activeStep + 1) / steps.length) * 100);

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
    <Container size="xl" py="xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Grid gutter="xl">
          {/* Левое меню шагов */}
          <Grid.Col span={2}>
            <Paper withBorder radius="md" p="md" style={{ paddingTop: 14 }}>
              <Stack>
                {steps.map((s, idx) => (
                  <Group
                    key={s.title}
                    spacing="sm"
                    style={{ cursor: idx <= activeStep ? 'pointer' : 'not-allowed', opacity: idx <= activeStep ? 1 : 0.5 }}
                    onClick={() => {
                      if (idx <= activeStep) setActiveStep(idx);
                    }}
                  >
                    <ThemeIcon
                      color={idx === activeStep ? 'teal' : 'gray'}
                      radius="xl"
                      size="lg"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <span style={{ fontWeight: 700, lineHeight: 1 }}>{idx + 1}</span>
                    </ThemeIcon>
                    <Text size="sm" weight={idx === activeStep ? 600 : 400}>{s.title}</Text>
                  </Group>
                ))}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Центральный контент */}
          <Grid.Col span={7}>
            <Paper withBorder radius="md" p="lg">
              <Group position="apart" mb="md">
                <Title order={2}>{steps[activeStep].title}</Title>
                <Group spacing="xs" align="center">
                  <Text size="sm" c="dimmed">{activeStep + 1}/{steps.length}</Text>
                  <Progress value={pct} w={120} size="sm"/>
                </Group>
              </Group>

              <Box style={{ minHeight: 420 }}>
                {activeStep === 0 ? (
                  <Stack spacing="md">
                    <Grid>
                      <Grid.Col span={6}>
                        <TextInput label="Имя" placeholder="Имя" value={formData.first_name} onChange={(e)=>handleInputChange('first_name', e.target.value)} error={errors.first_name} leftSection={<IconUser size={16} />} />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <TextInput label="Фамилия" placeholder="Фамилия" value={formData.last_name} onChange={(e)=>handleInputChange('last_name', e.target.value)} error={errors.last_name} leftSection={<IconUser size={16} />} />
                      </Grid.Col>
                    </Grid>
                    <Grid>
                      <Grid.Col span={6}>
                        <DateInput
                          label="Дата рождения"
                          placeholder="Выберите дату"
                          value={formData.date_of_birth}
                          onChange={(value)=>handleInputChange('date_of_birth', value)}
                          valueFormat="YYYY-MM-DD"
                          maxDate={new Date()}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                          <Group spacing="xs" align="flex-end" wrap="nowrap">
                          <Select
                            label="Код"
                            data={phoneCodes}
                            value={formData.phone_code}
                            onChange={(v)=>handleInputChange('phone_code', v)}
                            w={120}
                          />
                          <TextInput
                            label="Телефон"
                            placeholder="(999) 123-45-67"
                            value={formData.phone_local}
                            inputMode="numeric"
                            onChange={(e)=>{
                              const onlyDigits = (e.target.value || '').replace(/\D+/g, '').slice(0, 15);
                              handleInputChange('phone_local', onlyDigits);
                            }}
                            error={errors.phone_local}
                            leftSection={<IconPhone size={16} />}
                            style={{ flex: 1 }}
                          />
                        </Group>
                      </Grid.Col>
                    </Grid>
                    <Grid>
                      <Grid.Col span={6}>
                        <TextInput label="Город" placeholder="Введите город" value={formData.city} onChange={(e)=>handleInputChange('city', e.target.value)} error={errors.city} />
                      </Grid.Col>
                    </Grid>
                  </Stack>
                ) : (
                  <Box>{renderStepContent()}</Box>
                )}
              </Box>

              <Group position="apart" mt="xl">
                <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={handlePrev} disabled={activeStep === 0}>Назад</Button>
                {activeStep === steps.length - 1 ? (
                  <Button leftSection={<IconCheck size={16} />} onClick={handleSubmit} loading={isSubmitting}>Завершить</Button>
                ) : (
                  <Button rightSection={<IconArrowRight size={16} />} onClick={() => { if (validateStep(activeStep)) setActiveStep((s)=>s+1); }}>Далее</Button>
                )}
              </Group>

              {Object.keys(errors || {}).length > 0 && (
                <Alert color="red" mt="md">
                  Пожалуйста, исправьте ошибки на текущем шаге.
                </Alert>
              )}
            </Paper>
          </Grid.Col>

          {/* Правая колонка: AI-подсказки */}
          <Grid.Col span={3}>
            <Paper withBorder radius="md" p="lg">
              <Title order={4}>AI-подсказки</Title>
              <Stack mt="md" spacing="sm">
                {aiHints.length === 0 ? (
                  <Text size="sm" c="dimmed">Появятся по мере заполнения</Text>
                ) : (
                  aiHints.map((h, i) => (
                    <Group key={i} align="flex-start" spacing="xs">
                      <ThemeIcon radius="xl" size={22} color="teal"><IconCheck size={14} /></ThemeIcon>
                      <Text size="sm">{h}</Text>
                    </Group>
                  ))
                )}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default UserProfileForm;
