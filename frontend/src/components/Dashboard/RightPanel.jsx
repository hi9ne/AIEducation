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
  IconEyeOff,
  IconMicrophone
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceAssistant from '../AI/VoiceAssistant';

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
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [expandedSections, setExpandedSections] = useState({
    recommendations: true,
    notifications: true,
    stats: true
  });
  const [isVoiceListening, setIsVoiceListening] = useState(false);
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

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // AI message handling
  const handleSendMessage = async () => {
    if (!aiMessage.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: aiMessage,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setAiMessage('');
    setIsTyping(true);
    
    // Simulate AI response
    const responses = [
      'Анализирую ваши данные и готовлю персонализированные рекомендации...',
      'На основе вашего прогресса предлагаю следующие шаги...',
      'Отличный вопрос! Вот что я рекомендую...',
      'Изучив ваши достижения, вижу потенциал для роста...'
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    let currentText = '';
    
    for (const char of response) {
      await new Promise(resolve => setTimeout(resolve, 30));
      currentText += char;
    }
    
    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: currentText,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  // Quick action handler
  const handleQuickAction = (actionId) => {
    const messages = {
      analyze: 'Проанализируй мой текущий прогресс обучения',
      suggest: 'Дай рекомендации по улучшению результатов',
      motivate: 'Мотивируй меня продолжать обучение',
      plan: 'Создай план обучения на ближайшие недели'
    };
    
    setAiMessage(messages[actionId]);
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Clear chat history
  const clearChat = () => {
    setChatHistory([]);
  };

  // Voice assistant handlers
  const handleVoiceCommand = (command) => {
    setAiMessage(command);
    // Auto-send the voice command
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleToggleVoiceListening = (listening) => {
    setIsVoiceListening(listening);
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
        {/* Header */}
        <Paper p="lg" radius="md" mb="lg" className={styles.headerCard}>
          <Group position="apart" mb="md">
            <Group spacing="sm">
              <ThemeIcon 
                size="xl" 
                variant="gradient" 
                gradient={{ from: 'blue', to: 'purple' }}
                className={styles.pulse}
              >
                <IconRobot size={24} />
              </ThemeIcon>
              <Box>
                <Text size="xl" fw={700} className={styles.gradientText}>
                  AI Ассистент
                </Text>
                <Text size="sm" c="dimmed">
                  Ваш персональный помощник в обучении
                </Text>
              </Box>
            </Group>
            <Group spacing="xs">
              <Tooltip label="Настройки">
                <ActionIcon variant="light" size="lg">
                  <IconSettings size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Обновить данные">
                <ActionIcon 
                  variant="light" 
                  size="lg"
                  onClick={() => {
                    dispatch(fetchAIRecommendations());
                    dispatch(fetchNotifications());
                    dispatch(fetchAchievements());
                    dispatch(fetchDashboardStats());
                  }}
                >
                  <IconRefresh size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>

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
        </Paper>

        <Tabs value={activeTab} onTabChange={setActiveTab} className={styles.tabsContainer}>
          <Tabs.List className={styles.tabsList}>
            <Tabs.Tab value="chat" icon={<IconMessageCircle size={16} />}>
              Чат
            </Tabs.Tab>
            <Tabs.Tab value="insights" icon={<IconBrain size={16} />}>
              Аналитика
            </Tabs.Tab>
            <Tabs.Tab value="notifications" icon={<IconBell size={16} />}>
              <Group spacing="xs">
                Уведомления
                {unreadCount > 0 && (
                  <Badge size="xs" color="red" variant="filled">
                    {unreadCount}
                  </Badge>
                )}
              </Group>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="chat" pt="lg">
            <Stack spacing="lg">
              {/* Voice Assistant */}
              <VoiceAssistant
                onCommand={handleVoiceCommand}
                isListening={isVoiceListening}
                onToggleListening={handleToggleVoiceListening}
              />

              {/* Quick Actions */}
              <Paper p="md" radius="md" withBorder className={styles.quickActionsCard}>
                <Text size="sm" fw={600} mb="sm" c="dimmed">
                  Быстрые действия
                </Text>
                <Group spacing="xs">
                  {quickActions.map((action) => (
                    <Chip
                      key={action.id}
                      variant="light"
                      color={action.color}
                      size="sm"
                      onClick={() => handleQuickAction(action.id)}
                      className={styles.quickActionChip}
                    >
                      <Group spacing="xs">
                        <action.icon size={14} />
                        {action.label}
                      </Group>
                    </Chip>
                  ))}
                </Group>
              </Paper>

              {/* Chat Interface */}
              <Card shadow="sm" p="lg" radius="md" withBorder className={styles.chatCard}>
                <Group position="apart" mb="md">
                  <Text size="lg" fw={600}>AI Помощник</Text>
                  <Group spacing="xs">
                    <Tooltip label="Очистить чат">
                      <ActionIcon 
                        variant="light" 
                        color="red" 
                        size="sm"
                        onClick={clearChat}
                        disabled={!chatHistory.length}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>

                {/* Chat Messages */}
                <ScrollArea h={300} offsetScrollbars className={styles.chatMessages}>
                  <Stack spacing="sm">
                    {!chatHistory.length ? (
                      <Center h={200}>
                        <Stack align="center" spacing="sm">
                          <ThemeIcon size="xl" variant="light" color="blue">
                            <IconMessageCircle size={32} />
                          </ThemeIcon>
                          <Text c="dimmed" ta="center">
                            Начните диалог с AI помощником
                          </Text>
                        </Stack>
                      </Center>
                    ) : (
                      <AnimatePresence>
                        {chatHistory.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Paper
                              p="md"
                              radius="md"
                              className={`${styles.message} ${
                                message.type === 'user' ? styles.userMessage : styles.aiMessage
                              }`}
                            >
                              <Group spacing="sm" noWrap>
                                <Avatar
                                  size="sm"
                                  color={message.type === 'user' ? 'blue' : 'green'}
                                  variant="light"
                                >
                                  {message.type === 'user' ? (
                                    <IconMessageCircle size={14} />
                                  ) : (
                                    <IconRobot size={14} />
                                  )}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Text size="sm" fw={500} mb="xs">
                                    {message.type === 'user' ? 'Вы' : 'AI Ассистент'}
                                  </Text>
                                  <Text size="sm">{message.content}</Text>
                                  <Text size="xs" c="dimmed" mt="xs">
                                    {message.timestamp.toLocaleTimeString()}
                                  </Text>
                                </Box>
                              </Group>
                            </Paper>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                    
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={styles.typingIndicator}
                      >
                        <Paper p="md" radius="md" className={styles.aiMessage}>
                          <Group spacing="sm" noWrap>
                            <Avatar size="sm" color="green" variant="light">
                              <IconRobot size={14} />
                            </Avatar>
                            <Box>
                              <Text size="sm" fw={500} mb="xs">AI Ассистент</Text>
                              <Group spacing="xs">
                                <Loader size="xs" />
                                <Text size="sm" c="dimmed">Печатает...</Text>
                              </Group>
                            </Box>
                          </Group>
                        </Paper>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </Stack>
                </ScrollArea>

                {/* Message Input */}
                <Box mt="md">
                  <Group position="apart" mb="xs">
                    <Text size="xs" c="dimmed">
                      {isVoiceListening ? '🎤 Слушаю голосовую команду...' : 'Введите сообщение или используйте голосовой ввод'}
                    </Text>
                    {isVoiceListening && (
                      <Badge color="red" variant="filled" size="sm">
                        <Group spacing="xs">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <IconMicrophone size={12} />
                          </motion.div>
                          Запись
                        </Group>
                      </Badge>
                    )}
                  </Group>
                  <Textarea
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    placeholder={isVoiceListening ? "Говорите сейчас..." : "Задайте вопрос AI помощнику..."}
                    minRows={2}
                    maxRows={4}
                    className={styles.messageInput}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isVoiceListening}
                  />
                  <Group position="apart" mt="sm">
                    <Text size="xs" c="dimmed">
                      Нажмите Enter для отправки, Shift+Enter для новой строки
                    </Text>
                    <Button
                      leftIcon={<IconSend size={16} />}
                      onClick={handleSendMessage}
                      disabled={!aiMessage.trim() || isTyping || isVoiceListening}
                      size="sm"
                      className={styles.sendButton}
                    >
                      {isTyping ? 'Печатает...' : 'Отправить'}
                    </Button>
                  </Group>
                </Box>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="insights" pt="lg">
            <Stack spacing="lg">
              {/* AI Recommendations */}
              <Card shadow="sm" p="lg" radius="md" withBorder className={styles.recommendationsCard}>
                <Group position="apart" mb="md">
                  <Group spacing="sm">
                    <ThemeIcon size="lg" color="blue" variant="light">
                      <IconBulb size={20} />
                    </ThemeIcon>
                    <Text size="lg" fw={600}>AI Рекомендации</Text>
                  </Group>
                  <Group spacing="xs">
                    <Badge color="blue" variant="light">{aiRecommendations.length}</Badge>
                    <ActionIcon 
                      variant="light" 
                      size="sm"
                      onClick={() => toggleSection('recommendations')}
                    >
                      {expandedSections.recommendations ? 
                        <IconChevronUp size={14} /> : 
                        <IconChevronDown size={14} />
                      }
                    </ActionIcon>
                  </Group>
                </Group>

                <Collapse in={expandedSections.recommendations}>
                  {isLoading ? (
                    <Stack spacing="sm">
                      <Skeleton height={60} radius="sm" />
                      <Skeleton height={60} radius="sm" />
                      <Skeleton height={60} radius="sm" />
                    </Stack>
                  ) : (
                    <ScrollArea h={250} offsetScrollbars>
                      <Stack spacing="sm">
                        {!aiRecommendations.length ? (
                          <Center h={150}>
                            <Stack align="center" spacing="sm">
                              <ThemeIcon size="xl" variant="light" color="blue">
                                <IconBulb size={32} />
                              </ThemeIcon>
                              <Text c="dimmed" ta="center">
                                Нет доступных рекомендаций
                              </Text>
                            </Stack>
                          </Center>
                        ) : (
                          aiRecommendations.map((rec, index) => (
                            <motion.div
                              key={rec.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Paper
                                p="md"
                                radius="md"
                                withBorder
                                className={styles.recommendationItem}
                              >
                                <Group spacing="sm" noWrap>
                                  <ThemeIcon size="sm" color="blue" variant="light">
                                    <IconStar size={14} />
                                  </ThemeIcon>
                                  <Box sx={{ flex: 1 }}>
                                    <Text size="sm" fw={500} mb="xs">{rec.title}</Text>
                                    <Text size="xs" c="dimmed" lineClamp={2}>
                                      {rec.content}
                                    </Text>
                                  </Box>
                                </Group>
                              </Paper>
                            </motion.div>
                          ))
                        )}
                      </Stack>
                    </ScrollArea>
                  )}
                </Collapse>
              </Card>

              {/* Statistics */}
              <Card shadow="sm" p="lg" radius="md" withBorder className={styles.statsCard}>
                <Group position="apart" mb="md">
                  <Group spacing="sm">
                    <ThemeIcon size="lg" color="green" variant="light">
                      <IconTrendingUp size={20} />
                    </ThemeIcon>
                    <Text size="lg" fw={600}>Статистика</Text>
                  </Group>
                  <ActionIcon 
                    variant="light" 
                    size="sm"
                    onClick={() => toggleSection('stats')}
                  >
                    {expandedSections.stats ? 
                      <IconChevronUp size={14} /> : 
                      <IconChevronDown size={14} />
                    }
                  </ActionIcon>
                </Group>

                <Collapse in={expandedSections.stats}>
                  {isLoading ? (
                    <Stack spacing="sm">
                      <Skeleton height={20} radius="sm" />
                      <Skeleton height={20} radius="sm" />
                      <Skeleton height={20} radius="sm" />
                    </Stack>
                  ) : (
                    <Stack spacing="md">
                      <Group position="apart">
                        <Text size="sm">Общий прогресс</Text>
                        <RingProgress
                          size={60}
                          thickness={6}
                          sections={[
                            { value: 75, color: 'blue' }
                          ]}
                          label={
                            <Text size="xs" ta="center" fw={500}>
                              75%
                            </Text>
                          }
                        />
                      </Group>
                      
                      <Stack spacing="sm">
                        <Group position="apart">
                          <Text size="sm">Всего очков</Text>
                          <Badge color="green" variant="light">
                            {dashboardStats.total_points || 0}
                          </Badge>
                        </Group>
                        <Group position="apart">
                          <Text size="sm">Достижений</Text>
                          <Badge color="blue" variant="light">
                            {dashboardStats.achievements_unlocked || 0}
                          </Badge>
                        </Group>
                        <Group position="apart">
                          <Text size="sm">Серия</Text>
                          <Badge color="orange" variant="light">
                            {dashboardStats.current_streak || 0} дней
                          </Badge>
                        </Group>
                      </Stack>
                    </Stack>
                  )}
                </Collapse>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="notifications" pt="lg">
            <Card shadow="sm" p="lg" radius="md" withBorder className={styles.notificationsCard}>
              <Group position="apart" mb="md">
                <Group spacing="sm">
                  <ThemeIcon size="lg" color="red" variant="light">
                    <IconBell size={20} />
                  </ThemeIcon>
                  <Text size="lg" fw={600}>Уведомления</Text>
                </Group>
                <Group spacing="xs">
                  {unreadCount > 0 && (
                    <Badge color="red" variant="filled">{unreadCount}</Badge>
                  )}
                  <ActionIcon 
                    variant="light" 
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    <IconCheck size={14} />
                  </ActionIcon>
                  <ActionIcon 
                    variant="light" 
                    size="sm"
                    onClick={() => toggleSection('notifications')}
                  >
                    {expandedSections.notifications ? 
                      <IconChevronUp size={14} /> : 
                      <IconChevronDown size={14} />
                    }
                  </ActionIcon>
                </Group>
              </Group>

              <Collapse in={expandedSections.notifications}>
                {isLoading ? (
                  <Stack spacing="sm">
                    <Skeleton height={60} radius="sm" />
                    <Skeleton height={60} radius="sm" />
                    <Skeleton height={60} radius="sm" />
                  </Stack>
                ) : (
                  <ScrollArea h={300} offsetScrollbars>
                    <Stack spacing="sm">
                      {!notifications.length ? (
                        <Center h={150}>
                          <Stack align="center" spacing="sm">
                            <ThemeIcon size="xl" variant="light" color="gray">
                              <IconBell size={32} />
                            </ThemeIcon>
                            <Text c="dimmed" ta="center">
                              Нет новых уведомлений
                            </Text>
                          </Stack>
                        </Center>
                      ) : (
                        notifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Paper
                              p="md"
                              radius="md"
                              withBorder
                              className={`${styles.notificationItem} ${
                                !notification.is_read ? styles.unreadNotification : ''
                              }`}
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Group spacing="sm" noWrap>
                                <Avatar size="sm" color="blue" variant="light">
                                  <IconBell size={14} />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Group position="apart" mb="xs">
                                    <Text size="sm" fw={500}>
                                      {notification.title}
                                    </Text>
                                    {!notification.is_read && (
                                      <Badge size="xs" color="red" variant="filled">
                                        Новое
                                      </Badge>
                                    )}
                                  </Group>
                                  <Text size="xs" c="dimmed" lineClamp={2}>
                                    {notification.message}
                                  </Text>
                                </Box>
                              </Group>
                            </Paper>
                          </motion.div>
                        ))
                      )}
                    </Stack>
                  </ScrollArea>
                )}
              </Collapse>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </motion.div>
    </Box>
  );
};

export default RightPanel;
