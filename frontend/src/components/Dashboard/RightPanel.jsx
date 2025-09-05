import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAIRecommendations,
  fetchAchievements,
  fetchDashboardStats,
} from '../../store/educationSlice';
import { fetchNotifications } from '../../store/notificationsSlice';
import { useAuth } from '../../hooks/useAuth';
import {
  Box,
  Stack,
  Text,
  Card,
  Group,
  Badge,
  Button,
  Textarea,
  ActionIcon,
  Avatar,
  ScrollArea,
  Divider,
  ThemeIcon,
  Skeleton,
  Alert,
} from '@mantine/core';
import {
  IconBulb,
  IconBell,
  IconTrophy,
  IconSend,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconStar,
  IconHeart,
  IconTrendingUp,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

const RightPanel = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { aiRecommendations, achievements, dashboardStats, loading, error } = useSelector(
    (state) => state.education
  );
  
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    // fetchNotifications,
    // markAsRead,
    // markAllAsRead,
  } = useSelector((state) => state.notifications);
  
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAIRecommendations());
    dispatch(fetchNotifications());
      dispatch(fetchAchievements());
      dispatch(fetchDashboardStats());
      fetchNotifications();
    }
  }, [dispatch, isAuthenticated, fetchNotifications]);

  const handleSendMessage = async () => {
    if (!aiMessage.trim()) return;
    
    // Имитация отправки сообщения AI
    setAiResponse('Спасибо за ваш вопрос! Я анализирую ваши данные и подготовлю персонализированные рекомендации...');
    setAiMessage('');
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  if (loading || notificationsLoading) {
    return (
      <Box p="md">
        <Stack gap="md">
          <Skeleton height={200} radius="md" />
          <Skeleton height={150} radius="md" />
          <Skeleton height={100} radius="md" />
        </Stack>
      </Box>
    );
  }

  if (error || notificationsError) {
    return (
      <Box p="md">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Ошибка загрузки данных"
          color="red"
        >
          <Text size="sm">{error || notificationsError}</Text>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p="md">
      <Stack gap="lg">
        {/* AI Помощник */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Text size="lg" fw={600}>
                AI Помощник
              </Text>
              <ThemeIcon size="lg" color="blue" variant="light">
                <IconBulb size={20} />
              </ThemeIcon>
            </Group>
            
            <Stack gap="md">
              <Textarea
                placeholder="Задайте вопрос AI помощнику..."
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                minRows={2}
                maxRows={4}
              />
              
              <Group justify="space-between">
                <Button
                  leftSection={<IconSend size={16} />}
                  onClick={handleSendMessage}
                  disabled={!aiMessage.trim()}
                  size="sm"
                >
                  Отправить
                </Button>
                <Button
                  variant="light"
                  onClick={() => setAiResponse('')}
                  size="sm"
                >
                  Очистить
                </Button>
              </Group>
              
              {aiResponse && (
                <Box
                  p="md"
                  style={{
                    backgroundColor: 'var(--mantine-color-blue-0)',
                    borderRadius: 'var(--mantine-radius-md)',
                    border: '1px solid var(--mantine-color-blue-2)',
                  }}
                >
                  <Text size="sm">{aiResponse}</Text>
                </Box>
              )}
            </Stack>
          </Card>
        </motion.div>

        {/* AI Рекомендации */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Text size="lg" fw={600}>
                AI Рекомендации
              </Text>
              <Badge color="blue" variant="light">
                {aiRecommendations?.length || 0}
              </Badge>
            </Group>
            
            <ScrollArea h={200}>
              <Stack gap="sm">
                {aiRecommendations?.slice(0, 3).map((recommendation, index) => (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Box
                      p="sm"
                      style={{
                        backgroundColor: 'var(--mantine-color-gray-0)',
                        borderRadius: 'var(--mantine-radius-sm)',
                        border: '1px solid var(--mantine-color-gray-2)',
                      }}
                    >
                      <Text size="sm" fw={500} mb="xs">
                        {recommendation.title}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {recommendation.content}
                      </Text>
                      <Group justify="space-between" mt="xs">
                        <Badge size="xs" color="blue" variant="light">
                          {recommendation.category}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          Приоритет: {recommendation.priority}
                        </Text>
                      </Group>
                    </Box>
                  </motion.div>
                ))}
              </Stack>
            </ScrollArea>
          </Card>
        </motion.div>

        {/* Уведомления */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Text size="lg" fw={600}>
                Уведомления
              </Text>
              <Group gap="xs">
                <Badge color="red" variant="light">
                  {unreadCount || 0}
                </Badge>
                <ActionIcon
                  size="sm"
                  variant="light"
                  onClick={handleMarkAllAsRead}
                >
                  <IconCheck size={14} />
                </ActionIcon>
              </Group>
            </Group>
            
            <ScrollArea h={200}>
              <Stack gap="sm">
                {notifications?.slice(0, 5).map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Group
                      p="sm"
                      style={{
                        backgroundColor: notification.is_read 
                          ? 'transparent' 
                          : 'var(--mantine-color-blue-0)',
                        borderRadius: 'var(--mantine-radius-sm)',
                        border: notification.is_read 
                          ? '1px solid var(--mantine-color-gray-2)'
                          : '1px solid var(--mantine-color-blue-2)',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Avatar size="sm" color="blue">
                        <IconBell size={14} />
                      </Avatar>
                      <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>
                          {notification.title}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {notification.message}
                        </Text>
                      </Box>
                      {!notification.is_read && (
                        <Badge size="xs" color="red" variant="filled">
                          Новое
                        </Badge>
                      )}
                    </Group>
                  </motion.div>
                ))}
              </Stack>
            </ScrollArea>
          </Card>
        </motion.div>

        {/* Достижения */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Text size="lg" fw={600}>
                Достижения
              </Text>
              <ThemeIcon size="lg" color="yellow" variant="light">
                <IconTrophy size={20} />
              </ThemeIcon>
            </Group>
            
            <ScrollArea h={200}>
              <Stack gap="sm">
                {achievements?.slice(0, 5).map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Group
                      p="sm"
                      style={{
                        backgroundColor: 'var(--mantine-color-yellow-0)',
                        borderRadius: 'var(--mantine-radius-sm)',
                        border: '1px solid var(--mantine-color-yellow-2)',
                      }}
                    >
                      <Avatar size="sm" color="yellow">
                        <IconTrophy size={14} />
                      </Avatar>
                      <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>
                          {achievement.name}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {achievement.description}
                        </Text>
                      </Box>
                      <Badge size="xs" color="yellow" variant="light">
                        {achievement.points} очков
                      </Badge>
                    </Group>
                  </motion.div>
                ))}
              </Stack>
            </ScrollArea>
          </Card>
        </motion.div>

        {/* Статистика */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Text size="lg" fw={600}>
                Статистика
              </Text>
              <ThemeIcon size="lg" color="green" variant="light">
                <IconTrendingUp size={20} />
              </ThemeIcon>
            </Group>
            
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm">Всего очков</Text>
                <Text size="sm" fw={500} c="green">
                  {dashboardStats?.total_points || 0}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Достижений</Text>
                <Text size="sm" fw={500} c="blue">
                  {dashboardStats?.achievements_unlocked || 0}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Серия</Text>
                <Text size="sm" fw={500} c="orange">
                  {dashboardStats?.current_streak || 0} дней
                </Text>
              </Group>
            </Stack>
          </Card>
        </motion.div>
      </Stack>
    </Box>
  );
};

export default RightPanel;
