import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAIRecommendations,
  fetchAchievements,
  fetchDashboardStats
} from '../../../store/educationSlice';
// Redux notifications slice no longer used here; using Zustand store instead
import useNotificationsStore from '../../../store/notificationsStore';
import { useAuth } from '../../../shared/hooks/useAuth';
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
import { motion } from 'framer-motion';
import api from '../../../shared/services/api';

const RightPanel = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const messagesEndRef = useRef(null);
  
  // Redux state
  const { 
  aiRecommendations = [], 
    loading: loadingEdu, 
    error: errorEdu 
  } = useSelector(state => state.education);
  
  // Select only required slices/actions from zustand to keep stable deps
  const notifications = useNotificationsStore((s) => s.notifications) || [];
  const unreadCount = useNotificationsStore((s) => s.unreadCount) || 0;
  const loadingNotif = useNotificationsStore((s) => s.loading?.notifications);
  const errorNotif = useNotificationsStore((s) => s.errors?.notifications);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);
  const fetchUnreadCount = useNotificationsStore((s) => s.fetchUnreadCount);
  const markAllAsReadZ = useNotificationsStore((s) => s.markAllAsRead);
  const markAsReadZ = useNotificationsStore((s) => s.markAsRead);

  // Local state
  const [aiMessage, setAiMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState(null);
  // UI local states trimmed to essentials

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAIRecommendations());
      fetchNotifications();
      fetchUnreadCount();
      dispatch(fetchAchievements());
      dispatch(fetchDashboardStats());
    }
    // fetch* are stable from zustand; do not include full store
  }, [dispatch, isAuthenticated, fetchNotifications, fetchUnreadCount]);

  // Fallback: if no AI recommendations were returned, ask backend to generate demo ones once
  useEffect(() => {
    if (!isAuthenticated) return;
    const tryGenerate = async () => {
      try {
        if (Array.isArray(aiRecommendations) && aiRecommendations.length === 0) {
          await api.post('/api/education/generate-ai-recommendations/', {});
          dispatch(fetchAIRecommendations());
        }
    } catch {
        // swallow; optional helper
      }
    };
    tryGenerate();
    // run when auth flips or recommendations become empty
  }, [isAuthenticated, aiRecommendations, dispatch]);

  // AI message handling
  const handleSendMessage = async () => {
    const message = aiMessage.trim();
    if (!message || isTyping) return;
    setChatError(null);

    // Push user message to chat
    setChatHistory((prev) => [...prev, { id: Date.now(), role: 'user', content: message }]);
    setAiMessage('');

    // Simulate assistant typing and reply
    setIsTyping(true);
    try {
      const payload = {
        messages: [
          { role: 'system', content: 'Ты — дружелюбный помощник по учебе. Отвечай кратко и по делу.' },
          ...chatHistory.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ],
        model: 'gpt-4o-mini',
        temperature: 0.6,
        max_tokens: 300,
      };
      const res = await api.post('/api/education/ai/chat/', payload);
      const assistant = res.data?.content || 'Не удалось получить ответ.';
      setChatHistory((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: assistant }]);
  } catch {
      const fallback = 'Произошла ошибка сервиса ИИ. Попробуйте позже.';
      setChatHistory((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: fallback }]);
  setChatError('Ошибка запроса к ИИ. Проверьте, что бэкенд запущен (порт 8000).');
    } finally {
      setIsTyping(false);
    }
  };

  // Auto-scroll chat to bottom when new messages or typing state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  // Notification handlers
  const handleMarkAsRead = (id) => {
    // Use zustand action to keep the same source of truth
    markAsReadZ(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadZ();
  };

  const isLoadingAI = Boolean(loadingEdu?.aiRecommendations);
  const isLoadingNotif = Boolean(loadingNotif);
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
              {/* Chat messages area */}
              <ScrollArea h={220} offsetScrollbars className={styles.chatMessages}>
                <Stack spacing="sm">
                  {chatHistory.length === 0 && (
                    <Text size="sm" c="dimmed" ta="center">
                      Начните диалог — задайте вопрос внизу
                    </Text>
                  )}
                  {chatHistory.map((msg) => (
                    <Group key={msg.id} position={msg.role === 'user' ? 'right' : 'left'}>
                      <Box
                        p="sm"
                        sx={(theme) => ({
                          maxWidth: '85%',
                          borderRadius: theme.radius.md,
                          backgroundColor:
                            msg.role === 'user' ? theme.colors.blue[0] : theme.colors.gray[0],
                          border: `1px solid ${
                            msg.role === 'user' ? theme.colors.blue[2] : theme.colors.gray[3]
                          }`
                        })}
                      >
                        <Text size="sm">{msg.content}</Text>
                      </Box>
                    </Group>
                  ))}
                  {isTyping && (
                    <Group position="left">
                      <Box p="sm" sx={(theme) => ({
                        borderRadius: theme.radius.md,
                        backgroundColor: theme.colors.gray[0],
                        border: `1px solid ${theme.colors.gray[3]}`
                      })}>
                        <Text size="sm" c="dimmed">Печатает…</Text>
                      </Box>
                    </Group>
                  )}
                  <div ref={messagesEndRef} />
                </Stack>
              </ScrollArea>

              <Textarea
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder="Задайте вопрос AI помощнику..."
                minRows={2}
                maxRows={4}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              <Group position="apart">
                <Button
                  leftSection={<IconSend size={16} />}
                  onClick={handleSendMessage}
                  disabled={!aiMessage.trim() || isTyping}
                  size="sm"
                >
                  {isTyping ? 'Печатает...' : 'Отправить'}
                </Button>
                <Button
                  variant="light"
                  onClick={() => setChatHistory([])}
                  size="sm"
                >
                  Очистить чат
                </Button>
              </Group>
              {chatError && (
                <Text size="xs" c="red">
                  {chatError}
                </Text>
              )}
            </Stack>
          </Card>

          {/* AI Recommendations Card */}
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group position="apart" mb="md">
              <Text size="lg" fw={600}>AI Рекомендации</Text>
              <Badge>{aiRecommendations.length}</Badge>
            </Group>

            {isLoadingAI && aiRecommendations.length === 0 ? (
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

            {isLoadingNotif && notifications.length === 0 ? (
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

          {/* Stats Card removed as requested */}
        </Stack>
      </motion.div>
    </Box>
  );
};

export default RightPanel;
