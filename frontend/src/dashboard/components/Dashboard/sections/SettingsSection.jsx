import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Stack, 
  Text, 
  Paper, 
  Group, 
  Card, 
  Button,
  Grid,
  TextInput,
  Select,
  Switch,
  Divider,
  ActionIcon,
  FileInput,
  NumberInput,
  Textarea
} from '@mantine/core';
import { 
  IconUser, 
  IconMail, 
  IconPhone, 
  IconCalendar,
  IconMapPin,
  IconLanguage,
  IconBell,
  IconCamera,
  IconDeviceFloppy,
  IconEdit,
  IconX
} from '@tabler/icons-react';
import { updateProfileComplete, fetchProfile } from '../../../../store/authSlice';

const SettingsSection = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    city: '',
    country: '',
    language: 'ru',
    notifications: {
      email: true,
      push: true,
      sms: false,
      deadlines: true,
      progress: true,
      ai: true
    }
  });

  const [ieltsGoals, setIeltsGoals] = useState({ current: 0, target: 0, testDate: '' });

  const [tolcGoals, setTolcGoals] = useState({ current: 0, target: 0, testDate: '' });

  // Обновляем данные при изменении пользователя
  useEffect(() => {
    if (user) {
      setUserData(prev => ({
        ...prev,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        birthDate: user.date_of_birth || '',
        city: user.city || '',
        country: user.country || '',
      }));
      // set current avatar preview from profile
      setAvatarPreview(user?.avatar || '');
      // Инициализируем цели из профиля
      setIeltsGoals({
        current: user?.profile?.ielts_current_score || 0,
        target: user?.profile?.ielts_target_score || 0,
        testDate: user?.profile?.ielts_exam_date || ''
      });
      setTolcGoals({
        current: user?.profile?.tolc_current_score || 0,
        target: user?.profile?.tolc_target_score || 0,
        testDate: user?.profile?.tolc_exam_date || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const payload = {
        // Personal
        avatar: avatarFile instanceof File ? avatarFile : undefined,
        // Goals and dates
        ielts_current_score: ieltsGoals.current,
        ielts_target_score: ieltsGoals.target,
        ielts_exam_date: ieltsGoals.testDate || null,
        tolc_current_score: tolcGoals.current,
        tolc_target_score: tolcGoals.target,
        tolc_exam_date: tolcGoals.testDate || null,
      };
      await dispatch(updateProfileComplete(payload));
      await dispatch(fetchProfile());
    } finally {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Здесь можно восстановить исходные данные
  };

  return (
    <Box>
      <Stack gap="xl">
        {/* Header */}
        <Paper className="p-6" shadow="sm">
          <Group position="apart" align="center">
            <Box>
              <Text size="xl" fw={700} c="dark">
                Настройки профиля
              </Text>
              <Text size="sm" c="dimmed" mt={4}>
                Управление личными данными и настройками
              </Text>
            </Box>
            <Button
              leftSection={<IconEdit size={16} />}
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "filled"}
            >
              {isEditing ? 'Отменить' : 'Редактировать'}
            </Button>
          </Group>
        </Paper>

        {/* Personal Information */}
        <Paper className="p-6" shadow="sm">
          <Text size="lg" fw={600} className="mb-4">
            Личная информация
          </Text>
          
          <Group position="apart" align="flex-start">
            <Stack gap="xs" align="center">
              {/* Passport-like big photo preview */}
              <Box
                style={{
                  width: 180,
                  height: 240,
                  border: '1px solid var(--mantine-color-gray-4)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: 'var(--mantine-color-gray-1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Фото профиля"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Text c="dimmed">Нет фото</Text>
                )}
              </Box>
              {isEditing && (
                <FileInput
                  placeholder="Загрузить фото"
                  leftSection={<IconCamera size={16} />}
                  onChange={(file) => {
                    setAvatarFile(file);
                    if (file instanceof File) {
                      const url = URL.createObjectURL(file);
                      setAvatarPreview(url);
                    } else {
                      setAvatarPreview(user?.avatar || '');
                    }
                  }}
                  accept="image/*"
                  size="sm"
                />
              )}
            </Stack>
            
            <Box style={{ flex: 1 }}>
              <Text size="lg" fw={600} mb="md">
                {userData.firstName} {userData.lastName}
              </Text>
              
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Имя"
                    value={userData.firstName}
                    onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                    disabled={!isEditing}
                    leftSection={<IconUser size={16} />}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Фамилия"
                    value={userData.lastName}
                    onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                    disabled={!isEditing}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Email"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    disabled={!isEditing}
                    leftSection={<IconMail size={16} />}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Телефон"
                    value={userData.phone}
                    onChange={(e) => setUserData({...userData, phone: e.target.value})}
                    disabled={!isEditing}
                    leftSection={<IconPhone size={16} />}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Дата рождения"
                    type="date"
                    value={userData.birthDate}
                    onChange={(e) => setUserData({...userData, birthDate: e.target.value})}
                    disabled={!isEditing}
                    leftSection={<IconCalendar size={16} />}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Город"
                    value={userData.city}
                    onChange={(e) => setUserData({...userData, city: e.target.value})}
                    disabled={!isEditing}
                    leftSection={<IconMapPin size={16} />}
                  />
                </Grid.Col>
              </Grid>
            </Box>
          </Group>
        </Paper>

        {/* Academic Goals */}
        <Paper className="p-6" shadow="sm">
          <Text size="lg" fw={600} className="mb-4">
            Академические цели
          </Text>
          
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Text size="md" fw={600} c="dark">
                    IELTS
                  </Text>
                  <NumberInput
                    label="Текущий уровень"
                    value={ieltsGoals.current}
                    onChange={(value) => setIeltsGoals({...ieltsGoals, current: value})}
                    min={4}
                    max={9}
                    step={0.5}
                    precision={1}
                    disabled={!isEditing}
                  />
                  <NumberInput
                    label="Целевой уровень"
                    value={ieltsGoals.target}
                    onChange={(value) => setIeltsGoals({...ieltsGoals, target: value})}
                    min={4}
                    max={9}
                    step={0.5}
                    precision={1}
                    disabled={!isEditing}
                  />
                  <TextInput
                    label="Дата теста"
                    type="date"
                    value={ieltsGoals.testDate}
                    onChange={(e) => setIeltsGoals({...ieltsGoals, testDate: e.target.value})}
                    disabled={!isEditing}
                  />
                </Stack>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Text size="md" fw={600} c="dark">
                    TOLC
                  </Text>
                  <NumberInput
                    label="Текущий балл"
                    value={tolcGoals.current}
                    onChange={(value) => setTolcGoals({...tolcGoals, current: value})}
                    min={0}
                    max={50}
                    disabled={!isEditing}
                  />
                  <NumberInput
                    label="Целевой балл"
                    value={tolcGoals.target}
                    onChange={(value) => setTolcGoals({...tolcGoals, target: value})}
                    min={0}
                    max={50}
                    disabled={!isEditing}
                  />
                  <TextInput
                    label="Дата теста"
                    type="date"
                    value={tolcGoals.testDate}
                    onChange={(e) => setTolcGoals({...tolcGoals, testDate: e.target.value})}
                    disabled={!isEditing}
                    placeholder="дд.мм.гггг"
                  />
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Notifications */}
        <Paper className="p-6" shadow="sm">
          <Text size="lg" fw={600} className="mb-4">
            Уведомления
          </Text>
          
          <Stack gap="md">
            <Group position="apart">
              <Box>
                <Text fw={500}>Email уведомления</Text>
                <Text size="sm" c="dimmed">Получать уведомления на email</Text>
              </Box>
              <Switch
                checked={userData.notifications.email}
                onChange={(e) => setUserData({
                  ...userData,
                  notifications: {...userData.notifications, email: e.currentTarget.checked}
                })}
                disabled={!isEditing}
              />
            </Group>
            
            <Group position="apart">
              <Box>
                <Text fw={500}>Push уведомления</Text>
                <Text size="sm" c="dimmed">Получать push уведомления</Text>
              </Box>
              <Switch
                checked={userData.notifications.push}
                onChange={(e) => setUserData({
                  ...userData,
                  notifications: {...userData.notifications, push: e.currentTarget.checked}
                })}
                disabled={!isEditing}
              />
            </Group>
            
            <Group position="apart">
              <Box>
                <Text fw={500}>SMS уведомления</Text>
                <Text size="sm" c="dimmed">Получать SMS уведомления</Text>
              </Box>
              <Switch
                checked={userData.notifications.sms}
                onChange={(e) => setUserData({
                  ...userData,
                  notifications: {...userData.notifications, sms: e.currentTarget.checked}
                })}
                disabled={!isEditing}
              />
            </Group>
          </Stack>
        </Paper>

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <Group position="right">
            <Button
              variant="outline"
              leftSection={<IconX size={16} />}
              onClick={handleCancel}
            >
              Отменить
            </Button>
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={handleSave}
            >
              Сохранить
            </Button>
          </Group>
        )}
      </Stack>
    </Box>
  );
};

export default SettingsSection;
