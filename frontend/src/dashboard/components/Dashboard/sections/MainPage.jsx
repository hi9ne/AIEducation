import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../../../store/educationSlice';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { educationAPI } from '../../../../shared/services/api';
import {
  Box,
  Grid,
  Card,
  Text,
  Group,
  Badge,
  Button,
  Stack,
  Modal,
  TextInput,
  Textarea,
  Skeleton,
  Alert,
} from '@mantine/core';
import { Calendar, DateInput } from '@mantine/dates';
import { IconClock, IconTrash } from '@tabler/icons-react';
 
import CircularProgress from '../../../../shared/components/Animations/CircularProgress';

const ProgressSection = ({ user, deadlines = [], deadlinesLoading = false, deadlinesError = null }) => {
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

  // Пользовательские события (храним на сервере)
  const [userEvents, setUserEvents] = useState([]);
  const [eventsError, setEventsError] = useState(null);
  const [savingEvent, setSavingEvent] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const loadUserEvents = async () => {
      try {
        const res = await educationAPI.listEvents();
        const arr = Array.isArray(res?.data) ? res.data : [];
        const mapped = arr
          .map((e) => ({ id: e.id, title: e.title, date: new Date(e.date), type: 'note' }))
          .filter((e) => e.date && !isNaN(e.date));
        mapped.sort((a, b) => a.date - b.date);
        if (!cancelled) { setUserEvents(mapped); setEventsError(null); }
      } catch (err) {
        console.error('Failed to load user events', err);
        if (!cancelled) setEventsError('Не удалось загрузить события');
      }
    };
    loadUserEvents();
    return () => { cancelled = true; };
  }, []);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [focusedEventId, setFocusedEventId] = useState(null);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');
  const toYMD = useCallback((d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, []);
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Merge deadlines (from backend) + user events (notes)
  const allEvents = useMemo(() => {
    const merged = [
      ...deadlines.map((d) => ({ ...d, type: d.type || 'deadline' })),
      ...userEvents.map((e) => ({ ...e, type: 'note' })),
    ]
      .filter((e) => e?.date instanceof Date && !isNaN(e.date))
      .sort((a, b) => a.date - b.date);
    return merged;
  }, [deadlines, userEvents]);

  const deadlineDatesSet = useMemo(() => new Set(allEvents.map((d) => toYMD(d.date))), [allEvents, toYMD]);

  const safeSelectedDate = useMemo(() => {
    const v = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
    return Number.isNaN(v.getTime()) ? new Date() : v;
  }, [selectedDate]);

  const selectedDayEvents = useMemo(() => {
    const key = toYMD(safeSelectedDate);
    return allEvents.filter((d) => toYMD(d.date) === key);
  }, [allEvents, safeSelectedDate, toYMD]);

  // Список для правой колонки: ближайшие события (макс. 5) от сегодняшнего дня
  const listedEvents = useMemo(() => {
    const today = startOfToday;
    return allEvents.filter((e) => e.date >= today).slice(0, 5);
  }, [allEvents, startOfToday]);

  const nextEvent = useMemo(() => {
    const nowTime = now.getTime();
    return allEvents.find((d) => d.date.getTime() >= nowTime);
  }, [allEvents, now]);

  const focusedEvent = useMemo(() => {
    if (!focusedEventId) return null;
    return allEvents.find((e) => e.id === focusedEventId) || null;
  }, [focusedEventId, allEvents]);

  const chosenEvent = focusedEvent || nextEvent;

  const countdown = useMemo(() => {
    if (!chosenEvent) return null;
    let diff = Math.max(0, chosenEvent.date.getTime() - now.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24)); diff -= days * 24 * 60 * 60 * 1000;
    const hours = Math.floor(diff / (1000 * 60 * 60)); diff -= hours * 60 * 60 * 1000;
    const minutes = Math.floor(diff / (1000 * 60)); diff -= minutes * 60 * 1000;
    const seconds = Math.floor(diff / 1000);
    return { days, hours, minutes, seconds };
  }, [chosenEvent, now]);

  // Add note modal
  const [opened, setOpened] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(() => new Date());
  const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());
  const canSave = newTitle.trim().length > 0 && isValidDate(newDate);
  const onSaveNote = async () => {
    if (!canSave) return;
    const d = new Date(newDate);
    if (d < startOfToday) d.setTime(startOfToday.getTime());
    const payload = { title: newTitle.trim(), date: d.toISOString().slice(0, 10) };
    try {
      setSavingEvent(true);
      const res = await educationAPI.createEvent(payload);
      const created = res?.data || {};
      const item = {
        id: created.id ?? `note-${Date.now()}`,
        title: created.title ?? payload.title,
        date: new Date(created.date || payload.date),
        type: 'note',
      };
      setUserEvents((prev) => [...prev, item].sort((a, b) => a.date - b.date));
      setSelectedDate(item.date);
      setFocusedEventId(item.id);
      setEventsError(null);
    } catch (e) {
      console.error('Failed to create user event', e);
      setEventsError('Не удалось сохранить событие');
      return; // не закрываем модал при ошибке
    } finally {
      setSavingEvent(false);
    }
    setOpened(false);
    setNewTitle('');
  };
  const removeNote = async (id) => {
    try {
      await educationAPI.deleteEvent(id);
    } catch (e) {
      console.error('Failed to delete user event', e);
    }
    setUserEvents((prev) => prev.filter((e) => e.id !== id));
    setFocusedEventId((curr) => (curr === id ? null : curr));
  };

  // Flip-style time block (split card) for countdown
  const TimeCard = ({ value, label }) => {
    const num = typeof value === 'number' ? value : Number(value) || 0;
    const str = num >= 100 ? String(num) : String(num).padStart(2, '0');
    const cardStyle = {
      position: 'relative',
      width: 110,
      height: 128,
      borderRadius: 16,
      background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    };
    const dividerStyle = {
      position: 'absolute',
      top: '50%',
      left: 10,
      right: 10,
      height: 1,
      background: 'rgba(0,0,0,0.08)',
    };
    const topShade = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '50%',
      boxShadow: 'inset 0 -8px 14px rgba(0,0,0,0.05)'
    };
    const bottomShade = {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '50%',
      boxShadow: 'inset 0 8px 14px rgba(0,0,0,0.05)'
    };
    return (
      <Stack spacing={6} align="center" style={{ minWidth: 110 }}>
        <Box style={cardStyle}>
          <div style={topShade} />
          <div style={bottomShade} />
          <div style={dividerStyle} />
          <Text style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, color: '#1f2937', letterSpacing: 1 }}>{str}</Text>
        </Box>
        <Text size="sm" color="dimmed">{label}</Text>
      </Stack>
    );
  };

  // Цифровой циферблат D:HH:MM:SS
  const DigitalDisplay = ({ days, hours, minutes, seconds }) => {
    const commonStyle = {
      color: '#0f172a',
      fontFamily: 'Rubik Mono One, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: 'clamp(36px, 6vw, 72px)',
      fontWeight: 900,
      letterSpacing: 2,
      lineHeight: 1,
    };
    const colonStyle = { ...commonStyle, color: '#94a3b8', padding: '0 8px' };
    return (
      <Group spacing={0} align="center" wrap="nowrap">
        <Text style={commonStyle}>{String(days).padStart(2, '0')}</Text>
        <Text style={colonStyle}>:</Text>
        <Text style={commonStyle}>{pad(hours)}</Text>
        <Text style={colonStyle}>:</Text>
        <Text style={commonStyle}>{pad(minutes)}</Text>
        <Text style={colonStyle}>:</Text>
        <Text style={commonStyle}>{pad(seconds)}</Text>
      </Group>
    );
  };

  return (
    <Stack spacing="md">
      <Card withBorder p="lg" radius="md">
        <Stack spacing={6} align="center">
          <Text size="xl" weight={800} style={{ letterSpacing: 1.2, fontSize: 44, fontFamily: 'Rubik Mono One' }}>До следующего события осталось</Text>
          <DigitalDisplay days={countdown?.days ?? 0} hours={countdown?.hours ?? 0} minutes={countdown?.minutes ?? 0} seconds={countdown?.seconds ?? 0} />
          {chosenEvent && (
            <Group spacing="xs">
              <Badge color={chosenEvent.type === 'note' ? 'grape' : 'red'} variant="filled">{chosenEvent.type === 'note' ? 'Заметка' : 'Дедлайн'}</Badge>
              <Badge color="gray" variant="light">{toYMD(chosenEvent.date)}</Badge>
              <Text size="sm" color="dimmed">{chosenEvent.title}</Text>
            </Group>
          )}
        </Stack>
      </Card>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder p="md" radius="md" style={{ background: '#ffffff', color: '#0f172a' }}>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Group position="apart" mb="sm">
                  <Text size="lg" weight={800} style={{ letterSpacing: 1.1, fontFamily: 'Nunito Sans, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>Календарь</Text>
                </Group>
                <Calendar
                  value={safeSelectedDate}
                  onChange={(v) => setSelectedDate(v ?? new Date())}
                  locale="ru"
                  style={{ width: '100%' }}
                  minDate={startOfToday}
                  getDayProps={(date) => {
                    const value = date instanceof Date ? date : new Date(date);
                    const isPast = value < startOfToday;
                    return {
                      onClick: () => {
                        if (isPast) return;
                        setSelectedDate(value);
                        setNewDate(value);
                        setOpened(true);
                      },
                      style: { cursor: isPast ? 'not-allowed' : 'pointer' },
                    };
                  }}
                  renderDay={(date) => {
                    const value = date instanceof Date ? date : new Date(date);
                    if (Number.isNaN(value.getTime())) {
                      return <div style={{ textAlign: 'center' }}>?</div>;
                    }
                    const day = value.getDate();
                    const ymd = toYMD(value);
                    const has = deadlineDatesSet.has(ymd);
                    const isPast = value < startOfToday;
                    return (
                      <div style={{ position: 'relative', width: '100%', height: '100%', opacity: isPast ? 0.5 : 1 }}>
                        <div style={{ textAlign: 'center', fontWeight: has ? 900 : 700, fontSize: 20, lineHeight: 1.2, color: '#0f172a' }}>{day}</div>
                        {has && (
                          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 8, width: 8, height: 8, backgroundColor: '#e03131', borderRadius: '50%' }} />
                        )}
                      </div>
                    );
                  }}
                  styles={{
                    calendarHeader: { color: '#0f172a' },
                    weekday: { color: '#334155', fontWeight: 800 },
                    day: { color: '#0f172a' },
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 5 }}>
                <Box>
                  <Group position="apart" mb="xs" spacing="sm">
                    <Text size="md" weight={800} style={{ fontFamily: 'Nunito Sans, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>События</Text>
                    {deadlinesLoading && <Badge color="blue" variant="light">Загрузка…</Badge>}
                  </Group>
                  {deadlinesError && (
                    <Alert color="red" mb="md">{deadlinesError}</Alert>
                  )}
                  {listedEvents.length === 0 ? (
                    <Text size="sm" color="#334155">Событий пока нет</Text>
                  ) : (
                    <Stack spacing="xs">
                      {listedEvents.map((d, idx) => (
                        <Card key={d.id} withBorder p="sm" radius="md" style={{ background: '#ffffff' }}>
                          <Group align="flex-start" spacing="sm" onClick={() => setFocusedEventId(d.id)} style={{ cursor: 'pointer' }}>
                            {/* Левая кнопка удаления убрана */}
                            <Badge size="lg" color={d.type === 'note' ? 'grape' : 'red'} variant="filled" style={{ fontSize: 16, paddingInline: 12 }}>{idx + 1}</Badge>
                            <Box style={{ flex: 1 }}>
                              <Text size="lg" weight={700} style={{ color: '#0f172a' }}>{d.title}</Text>
                              <Text size="xs" color="#64748b">{toYMD(d.date)}</Text>
                            </Box>
                            {d.type === 'note' && (
                              <Button
                                size="xs"
                                variant="outline"
                                color="red"
                                styles={(theme) => ({
                                  root: {
                                    marginLeft: 'auto',
                                    marginRight: -6,
                                    backgroundColor: 'transparent',
                                    borderColor: theme.colors.red[6],
                                    color: theme.colors.red[6],
                                    '&:hover': {
                                      backgroundColor: theme.colors.red[6],
                                      color: '#fff',
                                      borderColor: theme.colors.red[6],
                                    },
                                  },
                                })}
                                leftIcon={<IconTrash size={14} />}
                                onClick={(e) => { e.stopPropagation(); removeNote(d.id); }}
                              >
                                Удалить
                              </Button>
                            )}
                          </Group>
                        </Card>
                      ))}
                    </Stack>
                  )}
                  <Group position="right" mt="sm">
                    <Button onClick={() => { const init = safeSelectedDate instanceof Date ? new Date(safeSelectedDate) : new Date(); setNewDate(init); setOpened(true); }}>Добавить событие</Button>
                  </Group>
                </Box>
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder p="md" radius="md">
            <Group position="apart" mb="sm">
              <Text size="lg" weight={700}>Прогресс профиля</Text>
              <Badge color="green">{calculateStatusText(overallProgress)}</Badge>
            </Group>
            <Group align="center" spacing="md" wrap="nowrap">
              <CircularProgress value={overallProgress} size={220} strokeWidth={14} color="#37B34A" />
              <Stack spacing={6} style={{ minWidth: 220 }}>
                <Group position="apart">
                  <Text size="sm">Личные данные</Text>
                  <Badge color={user?.phone && user?.country && user?.city ? 'green' : 'gray'}>
                    {user?.phone && user?.country && user?.city ? 'Заполнено' : 'Не заполнено'}
                  </Badge>
                </Group>
                <Group position="apart">
                  <Text size="sm">Образование</Text>
                  <Badge color={user?.profile?.education_background ? 'green' : 'gray'}>
                    {user?.profile?.education_background ? 'Заполнено' : 'Не заполнено'}
                  </Badge>
                </Group>
                <Group position="apart">
                  <Text size="sm">Интересы и цели</Text>
                  <Badge color={user?.profile?.interests?.length > 0 && user?.profile?.goals?.length > 0 ? 'green' : 'gray'}>
                    {user?.profile?.interests?.length > 0 && user?.profile?.goals?.length > 0 ? 'Заполнено' : 'Не заполнено'}
                  </Badge>
                </Group>
                <Group position="apart">
                  <Text size="sm">Языковые навыки</Text>
                  <Badge color={Object.keys(user?.profile?.language_levels || {}).length > 0 ? 'green' : 'gray'}>
                    {Object.keys(user?.profile?.language_levels || {}).length > 0 ? 'Заполнено' : 'Не заполнено'}
                  </Badge>
                </Group>
                <Group position="apart">
                  <Text size="sm">Предпочтения</Text>
                  <Badge color={user?.profile?.preferred_countries?.length > 0 && user?.profile?.budget_range && user?.profile?.study_duration ? 'green' : 'gray'}>
                    {user?.profile?.preferred_countries?.length > 0 && user?.profile?.budget_range && user?.profile?.study_duration ? 'Заполнено' : 'Не заполнено'}
                  </Badge>
                </Group>
              </Stack>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      <Modal opened={opened} onClose={() => setOpened(false)} title="Новая заметка" centered withinPortal>
        <Stack>
          <TextInput label="Заголовок" placeholder="Например: Подготовить документы" value={newTitle} onChange={(e) => setNewTitle(e.currentTarget.value)} required />
          <DateInput label="Дата" value={newDate} onChange={(v) => setNewDate(v ?? new Date())} minDate={startOfToday} required locale="ru" />
          {/* Описание убрано по требованию. */}
          {eventsError && <Alert color="red">{eventsError}</Alert>}
          <Group position="right" mt="sm">
            <Button variant="default" onClick={() => setOpened(false)}>Отмена</Button>
            <Button onClick={onSaveNote} disabled={!canSave || savingEvent} loading={savingEvent}>Сохранить</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

const MainPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();
  const hasFetchedRef = useRef(false);
  const [deadlines, setDeadlines] = useState([]);
  const [deadlinesLoading, setDeadlinesLoading] = useState(false);
  const [deadlinesError, setDeadlinesError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [now, setNow] = useState(new Date());
  
  const loading = useSelector((state) => state.education.loading);
  const error = useSelector((state) => state.education.error);
  // Debug information
  console.log('MainPage - isAuthenticated:', isAuthenticated);
  console.log('MainPage - user:', user);

  useEffect(() => {
    if (isAuthenticated && !hasFetchedRef.current) {
      console.log('MainPage useEffect - isAuthenticated:', isAuthenticated);
      console.log('Dispatching fetchDashboardStats (once)');
      hasFetchedRef.current = true;
      dispatch(fetchDashboardStats());
    }
  }, [dispatch, isAuthenticated]);

  // Fetch deadlines once authenticated
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!isAuthenticated) return;
      setDeadlinesLoading(true);
      setDeadlinesError(null);
      try {
        const res = await educationAPI.getDeadlines();
        const arr = Array.isArray(res?.data) ? res.data : [];
        // Normalize shape: { id, title/name, date/due_date/deadline_date, description }
        const norm = arr
          .map((d, idx) => {
            const dateStr = d.date || d.due_date || d.deadline_date || d.deadline || d.when;
            const title = d.title || d.name || d.label || 'Дедлайн';
            const description = d.description || d.details || '';
            const type = d.type || 'general';
            const parsed = dateStr ? new Date(dateStr) : null;
            return parsed && !isNaN(parsed) ? {
              id: d.id ?? `${title}-${dateStr}-${idx}`,
              title,
              description,
              type,
              date: parsed,
            } : null;
          })
          .filter(Boolean)
          .sort((a, b) => a.date - b.date);
        if (!cancelled) setDeadlines(norm);
      } catch (e) {
        console.error('Failed to load deadlines', e);
        if (!cancelled) setDeadlinesError('Не удалось загрузить дедлайны');
      } finally {
        if (!cancelled) setDeadlinesLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  // Ticker for countdown
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');
  const toYMD = useCallback((d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, []);

  const deadlineDatesSet = useMemo(() => new Set(deadlines.map((d) => toYMD(d.date))), [deadlines, toYMD]);

  const safeSelectedDate = useMemo(() => {
    const v = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
    return Number.isNaN(v.getTime()) ? new Date() : v;
  }, [selectedDate]);

  const selectedDayDeadlines = useMemo(() => {
    const key = toYMD(safeSelectedDate);
    return deadlines.filter((d) => toYMD(d.date) === key);
  }, [deadlines, safeSelectedDate, toYMD]);

  const nextDeadline = useMemo(() => {
    const nowTime = now.getTime();
    return deadlines.find((d) => d.date.getTime() >= nowTime);
  }, [deadlines, now]);

  const countdown = useMemo(() => {
    if (!nextDeadline) return null;
    let diff = Math.max(0, nextDeadline.date.getTime() - now.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24)); diff -= days * 24 * 60 * 60 * 1000;
    const hours = Math.floor(diff / (1000 * 60 * 60)); diff -= hours * 60 * 60 * 1000;
    const minutes = Math.floor(diff / (1000 * 60)); diff -= minutes * 60 * 1000;
    const seconds = Math.floor(diff / 1000);
    return { days, hours, minutes, seconds };
  }, [nextDeadline, now]);


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
      <Alert color="red" title="Error" mb="xl" radius="md">
        {error}
        </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Group mb="xl">
        <Text size="xl" fw={800} style={{
          background: 'linear-gradient(90deg, #1e3a8a 0%, #0ea5e9 50%, #14b8a6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>Добро пожаловать, {user?.first_name || 'Пользователь'}!</Text>
      </Group>

      {/* Общий прогресс + встроенный календарь/обратный отсчет */}
      <Grid>
        <Grid.Col span={12}>
          <ProgressSection user={user} deadlines={deadlines} deadlinesLoading={deadlinesLoading} deadlinesError={deadlinesError} />
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default MainPage;
