import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  Avatar,
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

const SettingsSection = () => {
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(null);
  
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

  const [ieltsGoals, setIeltsGoals] = useState({
    current: 5.5,
    target: 7.0,
    testDate: '2024-06-15'
  });

  const [tolcGoals, setTolcGoals] = useState({
    current: 0,
    target: 0,
    testDate: ''
  });

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
    }
  }, [user]);

  const handleSave = () => {
    // Здесь будет логика сохранения данных
    setIsEditing(false);
    console.log('Данные сохранены:', userData);
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
            <Group>
              <Avatar
                size={120}
                radius="xl"
                color="blue"
                src={avatar}
              >
                {user?.first_name?.[0] || ''}{user?.last_name?.[0] || ''}
              </Avatar>
              {isEditing && (
                <FileInput
                  placeholder="Изменить фото"
                  leftSection={<IconCamera size={16} />}
                  value={avatar}
                  onChange={setAvatar}
                  accept="image/*"
                  size="sm"
                />
              )}
            </Group>
            
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
