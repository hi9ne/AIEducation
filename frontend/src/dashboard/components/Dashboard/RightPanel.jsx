import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAIRecommendations,
  fetchAchievements,
  fetchDashboardStats,
  fetchUniversities
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
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
  IconSettings,
  IconX,
  IconPlus,
  IconMinus,
  IconEye,
  IconEyeOff,
  IconChecks
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import api, { API_BASE_URL } from '../../../shared/services/api';
import { useDashboardStore } from '../../../store/dashboardStore';

const RightPanel = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();
  const messagesEndRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Redux state
  const { 
    aiRecommendations = [],
    achievements = [],
    dashboardStats = null,
    universities = [],
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
  const [studentData, setStudentData] = useState({ documents: [], applications: [], studyPlans: [] });
  const [studentDataLoading, setStudentDataLoading] = useState(false);
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

  // If user selected universities in dashboard store but list is empty, fetch them for name mapping
  const selectedUniversitiesSet = useDashboardStore((s) => s.selectedUniversities);
  useEffect(() => {
    if (!isAuthenticated) return;
    const hasSelected = selectedUniversitiesSet && selectedUniversitiesSet.size > 0;
    if (hasSelected && (!Array.isArray(universities) || universities.length === 0)) {
      dispatch(fetchUniversities());
    }
  }, [isAuthenticated, selectedUniversitiesSet, universities?.length, dispatch]);

  // Load extended student data (documents, applications, study plans)
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const load = async () => {
      setStudentDataLoading(true);
      try {
        const [docsRes, appsRes, plansRes] = await Promise.allSettled([
          api.get('/api/education/documents/'),
          api.get('/api/education/applications/'),
          api.get('/api/education/study-plans/'),
        ]);
        if (cancelled) return;
        setStudentData({
          documents: docsRes.status === 'fulfilled' ? (docsRes.value?.data || []) : [],
          applications: appsRes.status === 'fulfilled' ? (appsRes.value?.data || []) : [],
          studyPlans: plansRes.status === 'fulfilled' ? (plansRes.value?.data || []) : [],
        });
      } catch {
        if (!cancelled) setStudentData({ documents: [], applications: [], studyPlans: [] });
      } finally {
        if (!cancelled) setStudentDataLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  // AI message handling
  const handleSendMessage = async () => {
    const message = aiMessage.trim();
    if (!message || isTyping) return;
    setChatError(null);

    // Push user message to chat
  const now = Date.now();
  setChatHistory((prev) => [...prev, { id: now, role: 'user', content: message, timestamp: now }]);
    setAiMessage('');

    // Build lightweight student context once per send
    const studentContext = (() => {
      if (!isAuthenticated) return '';
      const prof = user?.profile || {};
      const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || user?.email || 'Студент';
      const firstName = (user?.first_name || fullName.split(' ')[0] || 'Студент').trim();
      // age
      let age = undefined;
      let birthDateStr = undefined;
      if (user?.date_of_birth) {
        const dob = new Date(user.date_of_birth);
        if (!isNaN(dob.getTime())) {
          const diffMs = Date.now() - dob.getTime();
          const ageDate = new Date(diffMs);
          age = Math.abs(ageDate.getUTCFullYear() - 1970);
          birthDateStr = dob.toLocaleDateString('ru-RU');
        }
      }
      const ieltsCurrent = prof?.ielts_current_score ?? undefined;
      const ieltsTarget = prof?.ielts_target_score ?? undefined;
      const tolcCurrent = prof?.tolc_current_score ?? undefined;
      const tolcTarget = prof?.tolc_target_score ?? undefined;
      const examDateRaw = prof?.ielts_exam_date || prof?.exam_date;
      let examDate = undefined;
      if (examDateRaw) {
        const d = new Date(examDateRaw);
        if (!isNaN(d.getTime())) examDate = d.toLocaleDateString();
      }
      const tolcExamRaw = prof?.tolc_exam_date;
      let tolcExamDate = undefined;
      if (tolcExamRaw) {
        const td = new Date(tolcExamRaw);
        if (!isNaN(td.getTime())) tolcExamDate = td.toLocaleDateString();
      }
      const overall = (dashboardStats && (dashboardStats.overall_progress ?? dashboardStats.progress)) ?? undefined;
      const stats = dashboardStats || {};
      const upcoming = Array.isArray(deadlines) ? deadlines.slice(0, 3).map((d) => {
        const due = d?.due_date ? new Date(d.due_date).toLocaleDateString() : '—';
        const days = typeof d?.days === 'number' ? `${d.days} дн.` : '';
        return `${d?.title || 'Задача'} — до ${due}${days ? ` (${days})` : ''}`;
      }) : [];
      // Applications / targets
      const applications = Array.isArray(studentData.applications) ? studentData.applications : [];
      const submittedFirst = applications.find(a => a.status === 'submitted' || a.status === 'under_review' || a.status === 'accepted');
      const latestApp = submittedFirst || applications[0];
      const targetUniv = latestApp?.university?.name || (Array.isArray(studentData.studyPlans) && studentData.studyPlans[0]?.target_university?.name) || '';
      const targetMajor = latestApp?.major?.name || (Array.isArray(studentData.studyPlans) && studentData.studyPlans[0]?.target_major?.name) || '';
      // Selected universities from UI store (fallback if no applications)
      const selectedIds = Array.from(selectedUniversitiesSet || []);
      const selectedNames = (Array.isArray(universities) ? universities : [])
        .filter(u => selectedIds.includes(u.id))
        .map(u => u.name);
      // Documents summary
      const documents = Array.isArray(studentData.documents) ? studentData.documents : [];
      const docSummary = documents.slice(0, 6).map(d => `${d.document_type}${d.is_verified ? ' (вериф.)' : ''}`).join(', ');
      return [
        'Контекст студента:',
        `- Имя: ${fullName} (обращайся только по имени: ${firstName})`,
  ...(birthDateStr ? [`- Дата рождения: ${birthDateStr}`] : []),
        ...(age !== undefined ? [`- Возраст: ${age}`] : []),
        `- IELTS текущий: ${ieltsCurrent ?? 'не указано'}`,
        `- IELTS цель: ${ieltsTarget ?? 'не указано'}`,
        `- Дата экзамена IELTS: ${examDate ?? 'не указана'}`,
  `- TOLC текущий: ${tolcCurrent ?? 'не указано'}`,
  `- TOLC цель: ${tolcTarget ?? 'не указано'}`,
  `- Дата экзамена TOLC: ${tolcExamDate ?? 'не указана'}`,
        `- Общий прогресс: ${overall ?? '—'}${typeof overall === 'number' ? '%' : ''}`,
        `- IELTS сдан: ${stats.ielts_completed === true ? 'да' : 'нет'}`,
        `- Университет выбран: ${stats.universities_selected === true ? 'да' : 'нет'}`,
        `- Регистрация Universitaly: ${stats.universitaly_registration === true ? 'есть' : 'нет'}`,
        `- Виза: ${stats.visa_obtained === true ? 'получена' : 'нет'}`,
  `- Целевой университет: ${targetUniv || (selectedNames[0] || 'не выбран')}`,
        `- Факультет/специальность: ${targetMajor || 'не выбран'}`,
  `${selectedNames.length ? `- Выбранные университеты: ${selectedNames.join(', ')}` : ''}`,
        `- Документы загружены: ${docSummary || 'пока нет'}`,
        `- Достижений: ${Array.isArray(achievements) ? achievements.length : 0}`,
        `- Рекомендаций ИИ: ${Array.isArray(aiRecommendations) ? aiRecommendations.length : 0}`,
        `- Ближайшие дедлайны: ${upcoming.length ? upcoming.join('; ') : 'нет'}`,
        `Правила ответа: обращайся к пользователю строго по имени "${firstName}"; учитывай указанные цели/сроки/статусы (экзамены, виза, документы, университет/факультет). Предлагай конкретные следующие шаги. Отвечай кратко.`
      ].join('\n');
    })();

    // Simulate assistant typing and reply
    setIsTyping(true);
    try {
      const payload = {
        messages: [
          { role: 'system', content: 'Ты — дружелюбный помощник по учебе. Отвечай кратко и по делу. Обращайся по имени.' },
          ...(studentContext ? [{ role: 'system', content: studentContext }] : []),
          ...chatHistory.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ],
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1650,
      };
      const res = await api.post('/api/education/ai/chat/', payload);
  const assistant = res.data?.content || 'Не удалось получить ответ.';
  const ts = Date.now();
  setChatHistory((prev) => [...prev, { id: ts, role: 'assistant', content: assistant, timestamp: ts }]);
  } catch {
      const fallback = 'Произошла ошибка сервиса ИИ. Попробуйте позже.';
  const ts = Date.now();
  setChatHistory((prev) => [...prev, { id: ts, role: 'assistant', content: fallback, timestamp: ts }]);
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

  // Deadlines from dashboard store (populated on layout mount)
  const deadlines = useDashboardStore((s) => s.deadlines);

  // Build absolute avatar URL for the current user (used in chat bubble)
  const avatarRaw = user?.avatar || '';
  const userAvatarSrc = avatarRaw
    ? ((avatarRaw.startsWith('http://') || avatarRaw.startsWith('https://'))
        ? avatarRaw
        : `${API_BASE_URL}${avatarRaw.startsWith('/') ? '' : '/'}${avatarRaw}`)
    : undefined;

  return (
    <div className={`${styles.rightPanelWrapper} ${isCollapsed ? styles.collapsed : ''}`}>
      <div
        className={styles.rightPanelHandle}
        role="button"
        aria-label={isCollapsed ? 'Открыть панель' : 'Скрыть панель'}
        onClick={() => setIsCollapsed((v) => !v)}
      >
        {isCollapsed ? <IconChevronLeft size={18} /> : <IconChevronRight size={18} />}
        <span className={styles.handleLabel}>AI</span>
      </div>
      <Box className={styles.rightPanel}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Text size="xl" fw={800} mb="xl" className={styles.gradientText}>
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
          <Card shadow="md" p="lg" radius="lg" withBorder style={{ background: 'var(--app-color-surface)' }}>
            <Group position="apart" mb="md">
              <Text size="lg" fw={600}>AI Помощник</Text>
              <Group gap="xs">
                <Tooltip label="Очистить чат" withArrow>
                  <ActionIcon variant="subtle" onClick={() => setChatHistory([])} aria-label="Очистить чат">
                    <IconX size={18} />
                  </ActionIcon>
                </Tooltip>
                <ThemeIcon size="lg" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
                  <IconBulb size={20} />
                </ThemeIcon>
              </Group>
            </Group>

            {/* Chat container with input inside */}
            <Box className={styles.chatContainer} style={{ display: 'flex', flexDirection: 'column', height: 520 }}>
              <ScrollArea offsetScrollbars className={styles.chatMessages} style={{ flex: 1 }}>
                <Stack spacing="sm">
                  {chatHistory.length === 0 && (
                    <Text size="sm" c="dimmed" ta="center">
                      Начните диалог — задайте вопрос в поле ниже
                    </Text>
                  )}
                  {chatHistory.map((msg) => (
                    <div key={msg.id} className={`${styles.messageRow} ${msg.role === 'user' ? styles.messageRight : styles.messageLeft}`}>
                      {msg.role !== 'user' && (
                        <div className={styles.msgAvatar}>
                          <Avatar radius="xl" size={32} color="green" src={null} style={{ background:'#e0f7fa' }}>
                            <IconRobot size={20} />
                          </Avatar>
                        </div>
                      )}
                      <Box className={`${styles.bubble} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`} p="sm">
                        <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</Text>
                        <Group gap={6} align="center" style={{ marginTop: 4, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                          {msg.role !== 'user' && <IconRobot size={14} color="#16a34a" />}
                          <Text size="xs" c="dimmed">
                            {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                          {msg.role === 'user' && <IconChecks size={14} color="#60a5fa" />}
                        </Group>
                      </Box>
                      {msg.role === 'user' && (
                        <div className={styles.msgAvatar}>
                          <Avatar radius="xl" size={32} color="blue" src={userAvatarSrc} style={{ background:'#e3f2fd' }}>
                            <IconMessageCircle size={20} />
                          </Avatar>
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <Group position="left" spacing={8} align="flex-end">
                      <Avatar radius="xl" size={32} color="green" src={null} style={{ background:'#e0f7fa' }}>
                        <IconRobot size={20} />
                      </Avatar>
                      <Box className={styles.aiMessage} p="sm">
                        <Text size="sm" c="dimmed">Печатает…</Text>
                      </Box>
                    </Group>
                  )}
                  <div ref={messagesEndRef} />
                </Stack>
              </ScrollArea>

              <Group className={styles.chatInputBar} gap="xs" align="flex-end">
                <Textarea
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Напишите сообщение..."
                  autosize
                  minRows={1}
                  maxRows={4}
                  size="sm"
                  classNames={{ input: styles.messageInput }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <ActionIcon
                  size="lg"
                  radius="md"
                  className={styles.sendButton}
                  onClick={handleSendMessage}
                  disabled={!aiMessage.trim() || isTyping}
                  aria-label="Отправить"
                >
                  <IconSend size={16} color="#fff" />
                </ActionIcon>
              </Group>
            </Box>

            {chatError && (
              <Text size="xs" c="red" mt="xs">
                {chatError}
              </Text>
            )}
          </Card>

          {/* AI Recommendations Card */}
          <Card shadow="md" p="lg" radius="lg" withBorder style={{ background: 'var(--app-color-surface)' }}>
            <Group position="apart" mb="md">
              <Text size="lg" fw={600}>AI Рекомендации</Text>
              <Badge radius="sm" variant="light" color="blue">{aiRecommendations.length}</Badge>
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
          <Card shadow="md" p="lg" radius="lg" withBorder style={{ background: 'var(--app-color-surface)' }}>
            <Group position="apart" mb="md">
              <Text size="lg" fw={600}>Уведомления</Text>
              <Group spacing="xs">
                <Badge color="red" radius="sm" variant="light">{unreadCount}</Badge>
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

          {/* Deadlines Card */}
          <Card shadow="md" p="lg" radius="lg" withBorder style={{ background: 'var(--app-color-surface)' }}>
            <Group position="apart" mb="md">
              <Text size="lg" fw={600}>Дедлайны</Text>
              <Badge radius="sm" variant="light" color="violet">{deadlines?.length || 0}</Badge>
            </Group>
            <ScrollArea h={200} offsetScrollbars>
              <Stack spacing="sm">
                {!deadlines || deadlines.length === 0 ? (
                  <Text c="dimmed" ta="center" size="sm">Нет ближайших дедлайнов</Text>
                ) : (
                  deadlines.map((d) => (
                    <Group key={d.id} position="apart" p="sm" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 8 }}>
                      <Box>
                        <Text size="sm" fw={500}>{d.title}</Text>
                        <Text size="xs" c="dimmed">До: {new Date(d.due_date).toLocaleDateString()}</Text>
                      </Box>
                      <Badge color={d.color || 'gray'} variant="light" radius="sm">{d.days} дн.</Badge>
                    </Group>
                  ))
                )}
              </Stack>
            </ScrollArea>
          </Card>
        </Stack>
      </motion.div>
      </Box>
    </div>
  );
};

export default RightPanel;
