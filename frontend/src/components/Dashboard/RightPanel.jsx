import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAIRecommendations,
  fetchAchievements,
  fetchDashboardStats
} from '../../store/educationSlice';
import { 
  fetchNotifications, 
  markNotificationAsRead 
} from '../../store/notificationsSlice';
import { useAuth } from '../../hooks/useAuth';
import styles from './RightPanel.module.css';
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
  ThemeIcon,
  Skeleton,
  Alert,
  Paper,
  Divider,
  Chip,
  Tooltip,
  Progress,
  RingProgress,
  Center,
  Loader,
  Collapse,
  Tabs,
  List,
  Timeline,
  Indicator
} from '@mantine/core';
import {
  IconBulb,
  IconBell,
  IconCheck,
  IconSend,
  IconAlertCircle,
  IconTrophy,
  IconTrendingUp,
  IconRobot,
  IconSparkles,
  IconMessageCircle,
  IconBrain,
  IconTarget,
  IconClock,
  IconStar,
  IconChevronDown,
  IconChevronUp,
  IconRefresh,
  IconSettings,
  IconX,
  IconPlus,
  IconMinus,
  IconEye,
  IconEyeOff
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

const RightPanel = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const messagesEndRef = useRef(null);
  
  // Redux state
  const { 
    aiRecommendations = [], 
    achievements = [], 
    dashboardStats = {}, 
    loading: loadingEdu, 
    error: errorEdu 
  } = useSelector(state => state.education);
  
  const { 
    notifications = [], 
    unreadCount = 0, 
    loading: loadingNotif, 
    error: errorNotif 
  } = useSelector(state => state.notifications);

  // Local state
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [expandedSections, setExpandedSections] = useState({
    recommendations: true,
    notifications: true,
    stats: true
  });
  const [quickActions] = useState([
    { id: 'analyze', label: 'Анализ прогресса', icon: IconTarget, color: 'blue' },
    { id: 'suggest', label: 'Рекомендации', icon: IconBulb, color: 'green' },
    { id: 'motivate', label: 'Мотивация', icon: IconTrophy, color: 'orange' },
    { id: 'plan', label: 'План обучения', icon: IconClock, color: 'purple' }
  ]);

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAIRecommendations());
      dispatch(fetchNotifications());
      dispatch(fetchAchievements());
      dispatch(fetchDashboardStats());
    }
  }, [dispatch, isAuthenticated]);

  // AI message handling
  const handleSendMessage = async () => {
    if (!aiMessage.trim()) return;
    
    setIsTyping(true);
    setAiResponse('');
    
    // Simulate typing effect
    const response = 'Анализирую ваши данные и готовлю персонализированные рекомендации...';
    let currentText = '';
    
    for (const char of response) {
      await new Promise(resolve => setTimeout(resolve, 30));
      currentText += char;
      setAiResponse(currentText);
    }
    
    setIsTyping(false);
    setAiMessage('');
  };

  // Notification handlers
  const handleMarkAsRead = (id) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    notifications
      .filter(n => !n.is_read)
      .forEach(n => dispatch(markNotificationAsRead(n.id)));
  };

  const isLoading = loadingEdu || loadingNotif;
  const hasError = errorEdu || errorNotif;

  return (
    <Box className={styles.rightPanel}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Text size="xl" fw={700} mb="xl" className={styles.gradientText}>
          AI Ассистент
        </Text>

        {hasError && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Ошибка" 
            color="red"
            radius="md"
            mb="md"
          >
            Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.
          </Alert>
        )}

        <Stack spacing="lg">
          {/* AI Assistant Card */}
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group position="apart" mb="md">
              <Text size="lg" fw={600}>AI Помощник</Text>
              <ThemeIcon 
                size="lg" 
                variant="gradient" 
                gradient={{ from: 'blue', to: 'cyan' }}
              >
                <IconBulb size={20} />
              </ThemeIcon>
            </Group>

            <Stack spacing="md">
              <Textarea
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder="Задайте вопрос AI помощнику..."
                minRows={2}
                maxRows={4}
              />

              <Group position="apart">
                <Button
                  leftIcon={<IconSend size={16} />}
                  onClick={handleSendMessage}
                  disabled={!aiMessage.trim() || isTyping}
                  size="sm"
                >
                  {isTyping ? 'Печатает...' : 'Отправить'}
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
                  sx={(theme) => ({
                    backgroundColor: theme.colors.blue[0],
                    borderRadius: theme.radius.md,
                    border: `1px solid ${theme.colors.blue[2]}`
                  })}
                >
                  <Text size="sm">{aiResponse}</Text>
                </Box>
              )}
            </Stack>
          </Card>

          {/* AI Recommendations Card */}
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group position="apart" mb="md">
              <Text size="lg" fw={600}>AI Рекомендации</Text>
              <Badge>{aiRecommendations.length}</Badge>
            </Group>

            {isLoading ? (
              <Stack spacing="sm">
                <Skeleton height={50} radius="sm" />
                <Skeleton height={50} radius="sm" />
                <Skeleton height={50} radius="sm" />
              </Stack>
            ) : (
              <ScrollArea h={200} offsetScrollbars>
                <Stack spacing="sm">
                  {!aiRecommendations.length ? (
                    <Text c="dimmed" ta="center" size="sm">
                      Нет доступных рекомендаций
                    </Text>
                  ) : (
                    aiRecommendations.map((rec, index) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Box
                          p="sm"
                          sx={(theme) => ({
                            backgroundColor: theme.colors.gray[0],
                            borderRadius: theme.radius.sm,
                            border: `1px solid ${theme.colors.gray[2]}`
                          })}
                        >
                          <Text size="sm" fw={500} mb="xs">{rec.title}</Text>
                          <Text size="xs" c="dimmed" lineClamp={2}>
                            {rec.content}
                          </Text>
                        </Box>
                      </motion.div>
                    ))
                  )}
                </Stack>
              </ScrollArea>
            )}
          </Card>

          {/* Notifications Card */}
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group position="apart" mb="md">
              <Text size="lg" fw={600}>Уведомления</Text>
              <Group spacing="xs">
                <Badge color="red">{unreadCount}</Badge>
                <ActionIcon 
                  size="sm" 
                  variant="light" 
                  onClick={handleMarkAllAsRead}
                >
                  <IconCheck size={14} />
                </ActionIcon>
              </Group>
            </Group>

            {isLoading ? (
              <Stack spacing="sm">
                <Skeleton height={50} radius="sm" />
                <Skeleton height={50} radius="sm" />
                <Skeleton height={50} radius="sm" />
              </Stack>
            ) : (
              <ScrollArea h={200} offsetScrollbars>
                <Stack spacing="sm">
                  {!notifications.length ? (
                    <Text c="dimmed" ta="center" size="sm">
                      Нет новых уведомлений
                    </Text>
                  ) : (
                    notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Group
                          p="sm"
                          sx={(theme) => ({
                            backgroundColor: notification.is_read 
                              ? 'transparent' 
                              : theme.colors.blue[0],
                            borderRadius: theme.radius.sm,
                            border: `1px solid ${notification.is_read 
                              ? theme.colors.gray[2]
                              : theme.colors.blue[2]}`,
                            cursor: 'pointer'
                          })}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Avatar size="sm" color="blue">
                            <IconBell size={14} />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Text size="sm" fw={500}>
                              {notification.title}
                            </Text>
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {notification.message}
                            </Text>
                          </Box>
                          {!notification.is_read && (
                            <Badge size="xs" color="red">
                              Новое
                            </Badge>
                          )}
                        </Group>
                      </motion.div>
                    ))
                  )}
                </Stack>
              </ScrollArea>
            )}
          </Card>

          {/* Stats Card */}
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group position="apart" mb="md">
              <Text size="lg" fw={600}>Статистика</Text>
              <ThemeIcon size="lg" color="green" variant="light">
                <IconTrendingUp size={20} />
              </ThemeIcon>
            </Group>

            {isLoading ? (
              <Stack spacing="sm">
                <Skeleton height={20} radius="sm" />
                <Skeleton height={20} radius="sm" />
                <Skeleton height={20} radius="sm" />
              </Stack>
            ) : (
              <Stack spacing="sm">
                <Group position="apart">
                  <Text size="sm">Всего очков</Text>
                  <Text size="sm" fw={500} c="green">
                    {dashboardStats.total_points || 0}
                  </Text>
                </Group>
                <Group position="apart">
                  <Text size="sm">Достижений</Text>
                  <Text size="sm" fw={500} c="blue">
                    {dashboardStats.achievements_unlocked || 0}
                  </Text>
                </Group>
                <Group position="apart">
                  <Text size="sm">Серия</Text>
                  <Text size="sm" fw={500} c="orange">
                    {dashboardStats.current_streak || 0} дней
                  </Text>
                </Group>
              </Stack>
            )}
          </Card>
        </Stack>
      </motion.div>
    </Box>
  );
};

export default RightPanel;
