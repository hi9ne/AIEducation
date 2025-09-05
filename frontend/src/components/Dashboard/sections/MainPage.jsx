import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Stack, 
  Text, 
  Paper, 
  Group, 
  Badge, 
  Button, 
  Card,
  Grid,
  Progress,
  Skeleton,
  Alert,
  ActionIcon,
  Divider,
  ThemeIcon
} from '@mantine/core';
import { 
  IconTrendingUp, 
  IconUsers, 
  IconCalendar, 
  IconTarget,
  IconTrophy,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconRefresh,
  IconArrowRight,
  IconBook,
  IconSchool,
  IconCertificate,
  IconBuilding
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

const MainPage = ({ progress }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Имитируем загрузку
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const isAuthenticated = localStorage.getItem('accessToken');

  if (!isAuthenticated) {
    return (
      <Box p="md">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Требуется авторизация"
          color="blue"
        >
          <Text size="sm">
            Для просмотра дашборда необходимо войти в систему.
          </Text>
        </Alert>
      </Box>
    );
  }

  // Моковые данные для демонстрации
  const stats = {
    totalApplications: 0,
    completedSteps: 2,
    totalSteps: 10,
    upcomingDeadlines: [
      { title: "Подача документов", description: "Срок подачи документов в университет", daysLeft: 15 },
      { title: "IELTS экзамен", description: "Регистрация на экзамен", daysLeft: 30 }
    ],
    recentActivities: [
      { title: "Профиль заполнен", description: "Основная информация добавлена", timestamp: "2 часа назад" },
      { title: "Документы загружены", description: "Паспорт и справки", timestamp: "1 день назад" }
    ],
    achievements: [
      { title: "Первый шаг", description: "Заполнен профиль" },
      { title: "Документы", description: "Загружены документы" }
    ]
  };

  const progressPercentage = stats.totalSteps > 0 
    ? Math.round((stats.completedSteps / stats.totalSteps) * 100) 
    : 0;

  return (
    <Box p="md">
      <Stack gap="lg">
        {/* Заголовок и обновление */}
        <Group justify="space-between" align="center">
          <Box>
            <Text size="xl" fw={700} c="blue">
              Добро пожаловать в личный кабинет!
            </Text>
            <Text size="sm" c="dimmed">
              Отслеживайте свой прогресс и управляйте заявками
            </Text>
          </Box>
          <ActionIcon
            variant="light"
            color="blue"
            size="lg"
            onClick={handleRefresh}
            loading={refreshing}
          >
            <IconRefresh size={20} />
          </ActionIcon>
        </Group>

        {/* Общий прогресс */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text size="lg" fw={600}>
              Общий прогресс
            </Text>
            <Badge color="blue" variant="light">
              {progressPercentage}%
            </Badge>
          </Group>
          
          <Progress 
            value={progressPercentage} 
            size="lg" 
            radius="md"
            color="blue"
            mb="md"
          />
          
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Выполнено: {stats.completedSteps} из {stats.totalSteps} шагов
            </Text>
            <Text size="sm" fw={500} c="blue">
              {stats.totalSteps - stats.completedSteps} шагов осталось
            </Text>
          </Group>
        </Card>

        {/* Статистика */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <ThemeIcon color="blue" variant="light" size="xl" radius="md">
                  <IconSchool size={24} />
                </ThemeIcon>
                <Box>
                  <Text size="lg" fw={700} c="blue">
                    {stats.totalApplications}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Заявок подано
                  </Text>
                </Box>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <ThemeIcon color="green" variant="light" size="xl" radius="md">
                  <IconCheck size={24} />
                </ThemeIcon>
                <Box>
                  <Text size="lg" fw={700} c="green">
                    {stats.completedSteps}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Шагов выполнено
                  </Text>
                </Box>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <ThemeIcon color="orange" variant="light" size="xl" radius="md">
                  <IconTrophy size={24} />
                </ThemeIcon>
                <Box>
                  <Text size="lg" fw={700} c="orange">
                    {stats.achievements?.length || 0}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Достижений получено
                  </Text>
                </Box>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <ThemeIcon color="red" variant="light" size="xl" radius="md">
                  <IconClock size={24} />
                </ThemeIcon>
                <Box>
                  <Text size="lg" fw={700} c="red">
                    {stats.upcomingDeadlines?.length || 0}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Ближайших дедлайнов
                  </Text>
                </Box>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Ближайшие дедлайны */}
        {stats.upcomingDeadlines && stats.upcomingDeadlines.length > 0 && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="lg" fw={600} mb="md">
              Ближайшие дедлайны
            </Text>
            <Stack gap="sm">
              {stats.upcomingDeadlines.slice(0, 3).map((deadline, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Paper p="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-red-0)' }}>
                    <Group justify="space-between">
                      <Box>
                        <Text fw={500} size="sm">
                          {deadline.title}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {deadline.description}
                        </Text>
                      </Box>
                      <Badge color="red" variant="light">
                        {deadline.daysLeft} дней
                      </Badge>
                    </Group>
                  </Paper>
                </motion.div>
              ))}
            </Stack>
          </Card>
        )}

        {/* Последние активности */}
        {stats.recentActivities && stats.recentActivities.length > 0 && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="lg" fw={600} mb="md">
              Последние активности
            </Text>
            <Stack gap="sm">
              {stats.recentActivities.slice(0, 5).map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Paper p="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                    <Group>
                      <ThemeIcon color="blue" variant="light" size="sm" radius="md">
                        <IconCheck size={16} />
                      </ThemeIcon>
                      <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>
                          {activity.title}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {activity.description}
                        </Text>
                      </Box>
                      <Text size="xs" c="dimmed">
                        {activity.timestamp}
                      </Text>
                    </Group>
                  </Paper>
                </motion.div>
              ))}
            </Stack>
          </Card>
        )}

        {/* Достижения */}
        {stats.achievements && stats.achievements.length > 0 && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="lg" fw={600} mb="md">
              Последние достижения
            </Text>
            <Grid>
              {stats.achievements.slice(0, 4).map((achievement, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 6, md: 3 }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card shadow="sm" padding="md" radius="md" withBorder>
                      <Group>
                        <ThemeIcon color="yellow" variant="light" size="lg" radius="md">
                          <IconTrophy size={20} />
                        </ThemeIcon>
                        <Box>
                          <Text size="sm" fw={500}>
                            {achievement.title}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {achievement.description}
                          </Text>
                        </Box>
                      </Group>
                    </Card>
                  </motion.div>
                </Grid.Col>
              ))}
            </Grid>
          </Card>
        )}

        {/* Быстрые действия */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="lg" fw={600} mb="md">
            Быстрые действия
          </Text>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Button
                variant="light"
                color="blue"
                fullWidth
                leftSection={<IconBook size={16} />}
                rightSection={<IconArrowRight size={16} />}
              >
                Подать заявку
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Button
                variant="light"
                color="green"
                fullWidth
                leftSection={<IconCertificate size={16} />}
                rightSection={<IconArrowRight size={16} />}
              >
                Загрузить документы
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Button
                variant="light"
                color="orange"
                fullWidth
                leftSection={<IconBuilding size={16} />}
                rightSection={<IconArrowRight size={16} />}
              >
                Найти университеты
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Button
                variant="light"
                color="purple"
                fullWidth
                leftSection={<IconTarget size={16} />}
                rightSection={<IconArrowRight size={16} />}
              >
                План обучения
              </Button>
            </Grid.Col>
          </Grid>
        </Card>
      </Stack>
    </Box>
  );
};

export default MainPage;
