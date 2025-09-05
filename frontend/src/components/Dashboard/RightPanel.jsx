import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Stack, 
  Text, 
  Paper, 
  Group, 
  Badge, 
  Button, 
  TextInput,
  ScrollArea,
  Divider,
  ThemeIcon,
  Alert,
  Skeleton
} from '@mantine/core';
import { 
  IconBell, 
  IconTrophy, 
  IconRobot, 
  IconSend,
  IconAlertCircle,
  IconClock,
  IconCheck,
  IconTarget,
  IconTrendingUp
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import useEducationStore from '../../store/educationStore';

const RightPanel = () => {
  const {
    aiRecommendations,
    notifications,
    achievements,
    dashboardStats,
    loading,
    errors,
    fetchAIRecommendations,
    fetchNotifications,
    fetchAchievements,
    fetchDashboardStats,
    sendAIChatMessage
  } = useEducationStore();

  const [aiMessage, setAiMessage] = useState('');

  useEffect(() => {
    // Проверяем, что пользователь авторизован перед загрузкой данных
    const isAuthenticated = localStorage.getItem('accessToken');
    if (isAuthenticated) {
      // Не загружаем данные, так как API endpoints не существуют
      // fetchAIRecommendations();
      // fetchNotifications();
      // fetchAchievements();
      // fetchDashboardStats();
    }
  }, [fetchAIRecommendations, fetchNotifications, fetchAchievements, fetchDashboardStats]);

  const handleSendMessage = async () => {
    if (aiMessage.trim()) {
      const isAuthenticated = localStorage.getItem('accessToken');
      if (!isAuthenticated) {
        return;
      }
      
      // await sendAIChatMessage(aiMessage);
      setAiMessage('');
    }
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
            Для просмотра панели AI необходимо войти в систему.
          </Text>
        </Alert>
      </Box>
    );
  }

  // Моковые данные для демонстрации
  const mockNotifications = [
    { id: 1, title: "Добро пожаловать!", message: "Начните заполнение профиля", priority: "high" },
    { id: 2, title: "Напоминание", message: "Проверьте сроки подачи документов", priority: "medium" }
  ];

  const mockAchievements = [
    { id: 1, title: "Первый шаг", description: "Заполнен профиль" },
    { id: 2, title: "Документы", description: "Загружены документы" }
  ];

  const mockAIRecommendations = [
    { id: 1, title: "Рекомендация 1", description: "Начните с заполнения профиля" },
    { id: 2, title: "Рекомендация 2", description: "Подготовьте документы" }
  ];

  return (
    <Box style={{ height: '100%' }}>
      <ScrollArea style={{ height: '100%' }}>
        <Stack gap="md" p="md">
          {/* AI Ассистент */}
          <Paper shadow="sm" p="md" radius="md" withBorder>
            <Group mb="md">
              <ThemeIcon color="blue" variant="light" size="lg" radius="md">
                <IconRobot size={20} />
              </ThemeIcon>
              <Text fw={600} size="lg">
                AI Ассистент
              </Text>
            </Group>

            <Stack gap="sm">
              {mockAIRecommendations.slice(0, 2).map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Paper p="sm" radius="md" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                    <Text size="sm" fw={500}>
                      {rec.title}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {rec.description}
                    </Text>
                  </Paper>
                </motion.div>
              ))}
            </Stack>

            <Divider my="md" />
            
            <Stack gap="sm">
              <TextInput
                placeholder="Задайте вопрос AI..."
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                rightSection={
                  <Button
                    size="xs"
                    variant="light"
                    onClick={handleSendMessage}
                    disabled={!aiMessage.trim()}
                  >
                    <IconSend size={14} />
                  </Button>
                }
              />
            </Stack>
          </Paper>

          {/* Уведомления */}
          <Paper shadow="sm" p="md" radius="md" withBorder>
            <Group mb="md">
              <ThemeIcon color="orange" variant="light" size="lg" radius="md">
                <IconBell size={20} />
              </ThemeIcon>
              <Text fw={600} size="lg">
                Уведомления
              </Text>
            </Group>

            <Stack gap="sm">
              {mockNotifications.slice(0, 3).map((notification, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Paper p="sm" radius="md" style={{ backgroundColor: 'var(--mantine-color-orange-0)' }}>
                    <Group justify="space-between">
                      <Box>
                        <Text size="sm" fw={500}>
                          {notification.title}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {notification.message}
                        </Text>
                      </Box>
                      <Badge color="orange" variant="light" size="sm">
                        {notification.priority}
                      </Badge>
                    </Group>
                  </Paper>
                </motion.div>
              ))}
            </Stack>
          </Paper>

          {/* Достижения */}
          <Paper shadow="sm" p="md" radius="md" withBorder>
            <Group mb="md">
              <ThemeIcon color="yellow" variant="light" size="lg" radius="md">
                <IconTrophy size={20} />
              </ThemeIcon>
              <Text fw={600} size="lg">
                Достижения
              </Text>
            </Group>

            <Stack gap="sm">
              {mockAchievements.slice(0, 3).map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Paper p="sm" radius="md" style={{ backgroundColor: 'var(--mantine-color-yellow-0)' }}>
                    <Group>
                      <ThemeIcon color="yellow" variant="light" size="sm" radius="md">
                        <IconTrophy size={16} />
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
                  </Paper>
                </motion.div>
              ))}
            </Stack>
          </Paper>

          {/* Статистика */}
          <Paper shadow="sm" p="md" radius="md" withBorder>
            <Group mb="md">
              <ThemeIcon color="green" variant="light" size="lg" radius="md">
                <IconTrendingUp size={20} />
              </ThemeIcon>
              <Text fw={600} size="lg">
                Статистика
              </Text>
            </Group>

            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm">Заявок подано:</Text>
                <Badge color="blue" variant="light">
                  0
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Шагов выполнено:</Text>
                <Badge color="green" variant="light">
                  0
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Достижений:</Text>
                <Badge color="yellow" variant="light">
                  {mockAchievements.length}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Уведомлений:</Text>
                <Badge color="orange" variant="light">
                  {mockNotifications.length}
                </Badge>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </ScrollArea>
    </Box>
  );
};

export default RightPanel;
