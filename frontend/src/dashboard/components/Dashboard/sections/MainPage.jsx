import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../../../store/educationSlice';
import { useAuth } from '../../../../shared/hooks/useAuth';
import {
  Box,
  Grid,
  Card,
  Text,
  Group,
  Badge,
  Button,
  Progress,
  Stack,
  ActionIcon,
  ThemeIcon,
  Skeleton,
  Alert,
} from '@mantine/core';
import { motion } from "framer-motion";
import { IconBook, IconCalendar, IconTrophy, IconRefresh, IconTrendingUp } from '@tabler/icons-react';
import CircularProgress from '../../../../shared/components/Animations/CircularProgress';

const ProgressSection = ({ user }) => {
  const calculateStatusText = (progress) => {
    if (progress === 100) return "Completed";
    if (progress > 0) return "In progress";
    return "Not started";
  };

  // Вычисляем общий прогресс на основе заполненности профиля
  const calculateOverallProgress = () => {
    if (!user || !user.profile) return 0;
    
    const fields = [
      user.phone,
      user.country,
      user.city,
      user.profile.education_background,
      user.profile.interests?.length > 0,
      user.profile.goals?.length > 0,
      Object.keys(user.profile.language_levels || {}).length > 0,
      user.profile.preferred_countries?.length > 0,
      user.profile.budget_range,
      user.profile.study_duration
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const overallProgress = calculateOverallProgress();

  return (
    <Card withBorder p="lg" radius="md">
      <Stack spacing="md">
        <Group position="apart">
          <Text size="xl" weight={500}>Профиль</Text>
          <Badge color="green">
            {calculateStatusText(overallProgress)}
          </Badge>
        </Group>

        <Group position="center" p="md">
          <CircularProgress 
            value={overallProgress} 
            size={140}
            strokeWidth={12}
            color="#37B34A"
          />
        </Group>

        <Box>
          <Text size="md" weight={500} mb="md">Статус заполнения</Text>
          <Stack spacing="xs">
            <Group position="apart">
              <Text size="sm">Личные данные</Text>
              <Badge color={user?.phone && user?.country && user?.city ? "green" : "gray"}>
                {user?.phone && user?.country && user?.city ? "Заполнено" : "Не заполнено"}
              </Badge>
            </Group>
            <Group position="apart">
              <Text size="sm">Образование</Text>
              <Badge color={user?.profile?.education_background ? "green" : "gray"}>
                {user?.profile?.education_background ? "Заполнено" : "Не заполнено"}
              </Badge>
            </Group>
            <Group position="apart">
              <Text size="sm">Интересы и цели</Text>
              <Badge color={user?.profile?.interests?.length > 0 && user?.profile?.goals?.length > 0 ? "green" : "gray"}>
                {user?.profile?.interests?.length > 0 && user?.profile?.goals?.length > 0 ? "Заполнено" : "Не заполнено"}
              </Badge>
            </Group>
            <Group position="apart">
              <Text size="sm">Языковые навыки</Text>
              <Badge color={Object.keys(user?.profile?.language_levels || {}).length > 0 ? "green" : "gray"}>
                {Object.keys(user?.profile?.language_levels || {}).length > 0 ? "Заполнено" : "Не заполнено"}
              </Badge>
            </Group>
            <Group position="apart">
              <Text size="sm">Предпочтения</Text>
              <Badge color={user?.profile?.preferred_countries?.length > 0 && user?.profile?.budget_range && user?.profile?.study_duration ? "green" : "gray"}>
                {user?.profile?.preferred_countries?.length > 0 && user?.profile?.budget_range && user?.profile?.study_duration ? "Заполнено" : "Не заполнено"}
              </Badge>
            </Group>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
};

const MainPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();
  const hasFetchedRef = useRef(false);
  
  const loading = useSelector((state) => state.education.loading);
  const error = useSelector((state) => state.education.error);

  // Вычисляем статистику на основе данных пользователя
  const displayStats = useMemo(() => {
    if (!user || !user.profile) {
      return {
        total_courses: 0,
        completed_courses: 0,
        achievements_unlocked: 0,
        current_streak: 0,
        weekly_progress: 0,
        weekly_goal: 20,
        recommended_courses: [],
        recent_achievements: [],
        upcoming_events: []
      };
    }

    const profile = user.profile;
    
    // Генерируем рекомендуемые курсы на основе интересов пользователя
    const generateRecommendedCourses = () => {
      const courses = [];
      const interests = profile.interests || [];
      
      if (interests.includes('Программирование')) {
        courses.push({
          id: 1,
          title: "Основы программирования",
          progress: 0,
          difficulty: "Начальный",
          duration: "8 недель"
        });
      }
      
      if (interests.includes('Дизайн')) {
        courses.push({
          id: 2,
          title: "UI/UX Дизайн",
          progress: 0,
          difficulty: "Средний",
          duration: "12 недель"
        });
      }
      
      if (interests.includes('Бизнес')) {
        courses.push({
          id: 3,
          title: "Основы бизнеса",
          progress: 0,
          difficulty: "Начальный",
          duration: "6 недель"
        });
      }
      
      // Добавляем языковые курсы на основе предпочтений
      const languages = Object.keys(profile.language_levels || {});
      languages.forEach((lang, index) => {
        courses.push({
          id: 10 + index,
          title: `${lang} для начинающих`,
          progress: 0,
          difficulty: "Начальный",
          duration: "16 недель"
        });
      });
      
      return courses.slice(0, 4); // Показываем максимум 4 курса
    };

    // Генерируем достижения на основе заполненности профиля
    const generateAchievements = () => {
      const achievements = [];
      
      if (profile.interests?.length > 0) {
        achievements.push({
          id: 1,
          title: "Интересы определены",
          description: "Вы указали свои интересы",
          icon: "target",
          unlocked_at: new Date().toISOString().split('T')[0]
        });
      }
      
      if (profile.goals?.length > 0) {
        achievements.push({
          id: 2,
          title: "Цели поставлены",
          description: "Вы определили свои цели",
          icon: "trophy",
          unlocked_at: new Date().toISOString().split('T')[0]
        });
      }
      
      if (Object.keys(profile.language_levels || {}).length > 0) {
        achievements.push({
          id: 3,
          title: "Языки изучены",
          description: "Вы указали свои языковые навыки",
          icon: "language",
          unlocked_at: new Date().toISOString().split('T')[0]
        });
      }
      
      return achievements;
    };

    // Генерируем предстоящие события на основе предпочтений
    const generateUpcomingEvents = () => {
      const events = [];
      const countries = profile.preferred_countries || [];
      
      countries.forEach((country, index) => {
        events.push({
          id: index + 1,
          title: `Регистрация в университеты ${country}`,
          date: new Date(Date.now() + (index + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: "deadline"
        });
      });
      
      return events.slice(0, 3); // Показываем максимум 3 события
    };

    return {
      total_courses: generateRecommendedCourses().length,
      completed_courses: 0, // Пока нет системы курсов
      achievements_unlocked: generateAchievements().length,
      current_streak: 0, // Пока нет системы активности
      weekly_progress: 0, // Пока нет системы времени
      weekly_goal: 20,
      recommended_courses: generateRecommendedCourses(),
      recent_achievements: generateAchievements(),
      upcoming_events: generateUpcomingEvents()
    };
  }, [user]);

  // Debug information
  console.log('MainPage - isAuthenticated:', isAuthenticated);
  console.log('MainPage - user:', user);
  console.log('MainPage - displayStats:', displayStats);

  useEffect(() => {
    if (isAuthenticated && !hasFetchedRef.current) {
      console.log('MainPage useEffect - isAuthenticated:', isAuthenticated);
      console.log('Dispatching fetchDashboardStats (once)');
      hasFetchedRef.current = true;
      dispatch(fetchDashboardStats());
    }
  }, [dispatch, isAuthenticated]);

  const handleRefresh = () => {
    if (isAuthenticated) {
      dispatch(fetchDashboardStats());
    }
  };

  // Show loading state
  if (loading.dashboardStats && !user) {
    return (
      <Box>
        <Grid>
          {[1, 2, 3, 4].map((i) => (
            <Grid.Col key={i} span={{ base: 12, md: 6, lg: 3 }}>
              <Skeleton height={120} />
            </Grid.Col>
          ))}
        </Grid>
      </Box>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <Alert color="red" title="Error" mb="xl">
        {error}
        </Alert>
    );
  }

  return (
          <Box>
      {/* Header with refresh button */}
      <Group justify="space-between" mb="xl">
        <Text size="xl" fw={600}>Добро пожаловать, {user?.first_name || 'Пользователь'}!</Text>
        <ActionIcon
          variant="light"
          size="lg"
            onClick={handleRefresh}
          loading={loading.dashboardStats}
          >
          <IconRefresh size={20} />
        </ActionIcon>
        </Group>

      {/* Progress Section */}
      <Grid mb="xl">
        <Grid.Col span={12}>
          <ProgressSection user={user} />
        </Grid.Col>
      </Grid>

    {/* Main Statistics (without recommended courses tile) */}
      <Grid mb="xl">
      {/* Removed Recommended courses tile */}

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
                    Завершено
                </Text>
                  <Text fw={700} size="xl">
                    {displayStats?.completed_courses || 0}
                </Text>
                </div>
                <ThemeIcon color="green" size="xl" radius="md">
                  <IconTrophy size={24} />
                </ThemeIcon>
              </Group>
              </Card>
            </motion.div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
                    Достижения
                  </Text>
                  <Text fw={700} size="xl">
                    {displayStats?.achievements_unlocked || 0}
                  </Text>
                </div>
                <ThemeIcon color="yellow" size="xl" radius="md">
                  <IconTrophy size={24} />
                  </ThemeIcon>
                </Group>
              </Card>
            </motion.div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
                    Серия дней
                  </Text>
                  <Text fw={700} size="xl">
                    {displayStats?.current_streak || 0}
                  </Text>
                </div>
                <ThemeIcon color="red" size="xl" radius="md">
                  <IconTrendingUp size={24} />
                  </ThemeIcon>
                </Group>
              </Card>
            </motion.div>
          </Grid.Col>
        </Grid>

      {/* Прогресс недели */}
      <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
        <Text fw={600} size="lg" mb="md">Прогресс этой недели</Text>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {displayStats?.weekly_progress || 0} из {displayStats?.weekly_goal || 20} часов
              </Text>
            <Text size="sm" fw={500}>
              {Math.round(((displayStats?.weekly_progress || 0) / (displayStats?.weekly_goal || 20)) * 100)}%
              </Text>
            </Group>
            <Progress
            value={((displayStats?.weekly_progress || 0) / (displayStats?.weekly_goal || 20)) * 100}
              size="lg"
            radius="xl"
              color="blue"
          />
        </Stack>
          </Card>

  {/* Recommended courses section removed as requested */}

      {/* Последние достижения */}
      {displayStats?.recent_achievements?.length > 0 && (
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
          <Text fw={600} size="lg" mb="md">Последние достижения</Text>
          <Stack gap="md">
            {displayStats?.recent_achievements?.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Group>
                  <ThemeIcon color="yellow" size="lg" radius="md">
                    <IconTrophy size={20} />
                    </ThemeIcon>
                  <div>
                    <Text fw={500}>{achievement.title}</Text>
                    <Text size="sm" c="dimmed">{achievement.description}</Text>
                  </div>
                  </Group>
              </motion.div>
            ))}
                  </Stack>
                </Card>
      )}

      {/* Предстоящие события */}
      {displayStats?.upcoming_events?.length > 0 && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={600} size="lg" mb="md">Предстоящие события</Text>
          <Stack gap="md">
            {displayStats?.upcoming_events?.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Group>
                  <ThemeIcon color="red" size="lg" radius="md">
                    <IconCalendar size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>{event.title}</Text>
                    <Text size="sm" c="dimmed">{event.date}</Text>
                  </div>
                </Group>
              </motion.div>
            ))}
        </Stack>
        </Card>
      )}
    </Box>
  );
};

export default MainPage;
