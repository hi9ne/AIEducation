import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../../store/educationSlice';
import { useAuth } from '../../../hooks/useAuth';
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
import {
  IconSchool,
  IconBook,
  IconCalendar,
  IconTrophy,
  IconRefresh,
  IconAlertCircle,
  IconTrendingUp,
  IconUsers,
  IconTarget,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

// Тестовые данные для дашборда
const mockDashboardStats = {
  total_courses: 3,
  completed_courses: 0,
  upcoming_deadlines: 0,
  achievements_unlocked: 0,
  current_streak: 7,
  total_study_time: 45,
  weekly_goal: 20,
  weekly_progress: 12,
  recommended_courses: [
    {
      id: 1,
      title: "IELTS Preparation",
      progress: 25,
      difficulty: "Intermediate",
      duration: "8 weeks"
    },
    {
      id: 2,
      title: "Italian Language Basics",
      progress: 60,
      difficulty: "Beginner",
      duration: "12 weeks"
    }
  ],
  recent_achievements: [
    {
      id: 1,
      title: "First Week Complete",
      description: "Completed your first week of study",
      icon: "trophy",
      unlocked_at: "2024-01-15"
    }
  ],
  upcoming_events: [
    {
      id: 1,
      title: "IELTS Test Registration",
      date: "2024-02-15",
      type: "deadline"
    }
  ]
};

const MainPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  
  const { dashboardStats, loading, error } = useSelector((state) => ({
    dashboardStats: state.education.dashboardStats,
    loading: state.education.loading,
    error: state.education.error,
  }));

  // Используем тестовые данные, если нет данных из API
  const displayStats = dashboardStats || mockDashboardStats;

  // Отладочная информация
  console.log('MainPage - isAuthenticated:', isAuthenticated);
  console.log('MainPage - loading:', loading);
  console.log('MainPage - error:', error);
  console.log('MainPage - dashboardStats:', dashboardStats);
  console.log('MainPage - displayStats:', displayStats);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('MainPage useEffect - isAuthenticated:', isAuthenticated);
      console.log('Dispatching fetchDashboardStats');
      dispatch(fetchDashboardStats());
    }
  }, [dispatch, isAuthenticated]);

  const handleRefresh = () => {
    if (isAuthenticated) {
      dispatch(fetchDashboardStats());
    }
  };

  if (loading.dashboardStats && !displayStats) {
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

  return (
    <Box>
      {/* Заголовок с кнопкой обновления */}
      <Group justify="space-between" mb="xl">
        <Text size="xl" fw={600}>Добро пожаловать в личный кабинет!</Text>
        <ActionIcon
          variant="light"
          size="lg"
          onClick={handleRefresh}
          loading={loading.dashboardStats}
        >
          <IconRefresh size={20} />
        </ActionIcon>
      </Group>

      {/* Основная статистика */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
                    Всего курсов
                  </Text>
                  <Text fw={700} size="xl">
                    {displayStats?.total_courses || 0}
                  </Text>
                </div>
                <ThemeIcon color="blue" size="xl" radius="md">
                  <IconBook size={24} />
                </ThemeIcon>
              </Group>
            </Card>
          </motion.div>
        </Grid.Col>

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

      {/* Рекомендуемые курсы */}
      <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
        <Group justify="space-between" mb="md">
          <Text fw={600} size="lg">Рекомендуемые курсы</Text>
          <Button variant="light" size="sm">
            Посмотреть все
          </Button>
        </Group>
        <Grid>
          {displayStats?.recommended_courses?.map((course, index) => (
            <Grid.Col key={course.id} span={{ base: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Group justify="space-between" mb="sm">
                    <Text fw={500}>{course.title}</Text>
                    <Badge color="blue" variant="light">
                      {course.difficulty}
                    </Badge>
                  </Group>
                  <Text size="sm" c="dimmed" mb="sm">
                    {course.duration}
                  </Text>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm">Прогресс</Text>
                      <Text size="sm" fw={500}>{course.progress}%</Text>
                    </Group>
                    <Progress value={course.progress} size="sm" radius="xl" />
                  </Stack>
                </Card>
              </motion.div>
            </Grid.Col>
          ))}
        </Grid>
      </Card>

      {/* Последние достижения */}
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

      {/* Предстоящие события */}
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
    </Box>
  );
};

export default MainPage;
