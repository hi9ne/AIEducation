import React, { useState } from 'react';
import { 
  Box, 
  Stack, 
  Text, 
  Group, 
  Button,
  Avatar,
  Badge,
  Divider,
  Modal,
  Paper
} from '@mantine/core';
import { 
  IconHome, 
  IconBook, 
  IconSchool, 
  IconBuilding, 
  IconFileText, 
  IconCreditCard, 
  IconFile, 
  IconPlane, 
  IconSettings,
  IconBell,
  IconHelp
} from '@tabler/icons-react';
import { useDashboardStore } from '../../../store/dashboardStore';
import { API_BASE_URL } from '../../../shared/services/api.js';

const LeftNavigation = ({ activeSection, onSectionChange, user }) => {
  const [showStudentCard, setShowStudentCard] = useState(false);
  const { currentProgress } = useDashboardStore();

  const avatarRaw = user?.avatar || '';
  const avatarSrc = avatarRaw
    ? (avatarRaw.startsWith('http://') || avatarRaw.startsWith('https://')
        ? avatarRaw
        : `${API_BASE_URL}${avatarRaw.startsWith('/') ? '' : '/'}${avatarRaw}`)
    : undefined;

  const navigationItems = [
    {
      id: 'main',
      label: 'Главная',
      description: 'Обзор прогресса',
      icon: IconHome,
      color: 'blue'
    },
    {
      id: 'ielts',
      label: 'IELTS',
      description: 'Подготовка к тесту',
      icon: IconBook,
      color: 'green'
    },
    {
      id: 'tolc',
      label: 'TOLC',
      description: 'Итальянский тест',
      icon: IconSchool,
      color: 'purple'
    },
    {
      id: 'universities',
      label: 'Университеты',
      description: 'Поиск и выбор',
      icon: IconBuilding,
      color: 'orange'
    },
    {
      id: 'universitaly',
      label: 'Universitaly',
      description: 'Регистрация',
      icon: IconFileText,
      color: 'cyan'
    },
    {
      id: 'codice',
      label: 'Codice Fiscale',
      description: 'Налоговый код',
      icon: IconCreditCard,
      color: 'teal'
    },
    {
      id: 'dov',
      label: 'DOV',
      description: 'Легализация',
      icon: IconFile,
      color: 'indigo'
    },
    {
      id: 'visa',
      label: 'Виза',
      description: 'Визовая поддержка',
      icon: IconPlane,
      color: 'pink'
    }
  ];

  const getColorValue = (colorName) => {
    const colorMap = {
      blue: '#228be6',
      green: '#51cf66',
      purple: '#9775fa',
      orange: '#ff922b',
      cyan: '#22d3ee',
      teal: '#20c997',
      indigo: '#5c7cfa',
      pink: '#f783ac'
    };
    return colorMap[colorName] || '#868e96';
  };

  const getLightColor = (colorName) => {
    const lightColorMap = {
      blue: '#e7f5ff',
      green: '#f3fff3',
      purple: '#f8f0ff',
      orange: '#fff4e6',
      cyan: '#f0fdff',
      teal: '#f0fdfa',
      indigo: '#f0f2ff',
      pink: '#fff0f6'
    };
    return lightColorMap[colorName] || '#f8f9fa';
  };

  return (
    <Box style={{ height: '100%', backgroundColor: 'var(--app-color-surface)', paddingTop: 24 }}>
      <Stack gap="xs" style={{ padding: '16px' }}>
        {/* Top spacer to avoid clipping under app frame */}
        <Box style={{ height: 8 }} />
        {/* User Profile */}
        <Paper
          withBorder
          radius="lg"
          p="md"
          onClick={() => setShowStudentCard(true)}
          style={{
            marginTop: 10,
            backgroundColor: 'var(--app-color-surface)',
            borderColor: 'var(--mantine-color-gray-3)',
            boxShadow: 'var(--app-shadow-sm)',
            cursor: 'pointer',
            transition: 'box-shadow 150ms ease, transform 150ms ease'
          }}
        >
          <Group>
            <Avatar
              size="md"
              color="blue"
              radius="xl"
              src={avatarSrc}
            >
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Avatar>
            <Box style={{ flex: 1 }}>
              <Text size="sm" fw={700} c="dark">
                {user?.first_name} {user?.last_name}
              </Text>
              <Text size="xs" c="dimmed">
                Студент
              </Text>
            </Box>
            <Badge color="green" variant="light" size="sm" radius="sm">
              Активен
            </Badge>
          </Group>
        </Paper>

        {/* Navigation Items */}
        <Stack gap="xs">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            // Определяем живой прогресс по id секции
            const liveProgressMap = {
              ielts: currentProgress?.ielts ?? 0,
              tolc: currentProgress?.tolc ?? 0,
              universitaly: currentProgress?.universitaly ?? 0,
              codice: currentProgress?.codice ?? 0,
              dov: currentProgress?.dov ?? 0,
              visa: currentProgress?.visa ?? 0,
            };
            const itemProgress = liveProgressMap[item.id];

            return (
              <Button
                key={item.id}
                variant={isActive ? 'filled' : 'subtle'}
                color={isActive ? item.color : 'gray'}
                onClick={() => onSectionChange(item.id)}
                justify="flex-start"
                size="md"
                radius="md"
                aria-current={isActive ? 'page' : undefined}
                title={item.description}
                leftSection={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon 
                      size={20} 
                      color={isActive ? 'white' : getColorValue(item.color)} 
                    />
                  </div>
                }
                rightSection={
                  typeof itemProgress === 'number' ? (
                    <Badge 
                      size="xs" 
                      color={item.color} 
                      variant="light"
                      radius="sm"
                    >
                      {itemProgress}%
                    </Badge>
                  ) : null
                }
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  height: 'auto',
                  minHeight: 52,
                  padding: '10px 12px',
                  borderRadius: 'var(--app-radius-md)',
                  backgroundColor: isActive ? getColorValue(item.color) : 'transparent',
                  borderLeft: isActive ? `3px solid ${getColorValue(item.color)}` : '3px solid transparent',
                  transition: 'background-color 0.2s ease, transform 0.2s ease',
                  boxShadow: isActive ? 'var(--app-shadow-sm)' : 'none'
                }}
              >
                <Box style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <Text size="sm" fw={isActive ? 700 : 500} c={isActive ? 'white' : 'dark'} style={{ lineHeight: 1.2 }}>
                    {item.label}
                  </Text>
                  <Text size="xs" c={isActive ? 'white' : 'dimmed'} style={{ lineHeight: 1.2 }}>
                    {item.description}
                  </Text>
                </Box>
              </Button>
            );
          })}
        </Stack>

        <Divider style={{ margin: '16px 0' }} />

        {/* Settings */}
        <Button
          variant={activeSection === 'settings' ? 'filled' : 'subtle'}
          color={activeSection === 'settings' ? 'gray' : 'gray'}
          onClick={() => onSectionChange('settings')}
          justify="flex-start"
          leftSection={<IconSettings size={20} />}
          size="md"
          radius="md"
          aria-current={activeSection === 'settings' ? 'page' : undefined}
          style={{
            alignItems: 'flex-start',
            height: 'auto',
            minHeight: 52,
            padding: '12px',
            borderRadius: 'var(--app-radius-md)',
            transition: 'background-color 0.2s ease'
          }}
        >
          <Box style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <Text size="sm" fw={activeSection === 'settings' ? 600 : 500}>
              Настройки
            </Text>
            <Text size="xs" c="dimmed" style={{ lineHeight: 1.2 }}>
              Профиль и предпочтения
            </Text>
          </Box>
        </Button>

        {/* Help & Support */}
        <Stack gap="xs" style={{ marginTop: '16px' }}>
          <Button
            variant="subtle"
            color="gray"
            justify="flex-start"
            leftSection={<IconHelp size={20} />}
            size="md"
            radius="md"
            style={{
              alignItems: 'flex-start',
              height: 'auto',
              minHeight: 52,
              padding: '12px',
              borderRadius: 'var(--app-radius-md)',
              transition: 'background-color 0.2s ease'
            }}
            onClick={() => onSectionChange('help')}
          >
            <Box style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <Text size="sm" fw={500}>
                Помощь
              </Text>
              <Text size="xs" c="dimmed" style={{ lineHeight: 1.2 }}>
                FAQ и поддержка
              </Text>
            </Box>
          </Button>

          <Button
            variant="subtle"
            color="gray"
            justify="flex-start"
            leftSection={<IconBell size={20} />}
            size="md"
            radius="md"
            style={{
              alignItems: 'flex-start',
              height: 'auto',
              minHeight: 52,
              padding: '12px',
              borderRadius: 'var(--app-radius-md)',
              transition: 'background-color 0.2s ease'
            }}
            onClick={() => onSectionChange('notifications')}
          >
            <Box style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <Text size="sm" fw={500}>
                Уведомления
              </Text>
              <Text size="xs" c="dimmed" style={{ lineHeight: 1.2 }}>
                Настройки уведомлений
              </Text>
            </Box>
          </Button>
        </Stack>
      </Stack>

      {/* Centered Student Card Modal */}
      <Modal
        opened={showStudentCard}
        onClose={() => setShowStudentCard(false)}
        withCloseButton={false}
        centered
        size="lg"
        overlayProps={{ backgroundOpacity: 0.45, blur: 3 }}
        transitionProps={{ transition: 'slide-right', duration: 300, timingFunction: 'ease' }}
      >
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Paper
            radius="lg"
            shadow="xl"
            style={{
              width: 580,
              maxWidth: '100%',
              height: 260,
              background: 'var(--app-color-surface)',
              border: '1px solid var(--app-color-border)',
              boxShadow: 'var(--app-shadow-lg)',
              borderRadius: 16,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative overlay with subtle gradient depending on theme */}
            <Box style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(135deg, color-mix(in srgb, var(--mantine-color-blue-6) 10%, transparent), transparent 60%)' }} />

            <Group justify="space-between" style={{ padding: 24, position: 'relative', zIndex: 1 }}>
              <Box>
                <Group gap={8}>
                  <Box style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: 'var(--app-color-surface)',
                    border: '1px solid var(--app-color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Text fw={800} c="var(--mantine-color-blue-6)">U</Text>
                  </Box>
                  <Text fw={700}>University Card</Text>
                </Group>
              </Box>
              <Avatar src={avatarSrc} radius="md" size={84} alt="student" />
            </Group>

            <Group style={{ padding: '0 24px', position: 'relative', zIndex: 1 }}>
              <Box style={{ flex: 1 }}>
                <Text size="lg" fw={700} style={{ lineHeight: 1.1 }}>
                  {user?.first_name || 'Jane'} {user?.last_name || 'Doe'}
                </Text>
                <Text size="sm" c="dimmed" style={{ marginTop: 4 }}>
                  Computer Science
                </Text>
              </Box>
            </Group>

            <Group style={{ padding: 24, marginTop: 16, position: 'relative', zIndex: 1 }}>
              <Badge
                size="lg"
                color="blue"
                variant="light"
                style={{ background: 'color-mix(in srgb, var(--mantine-color-blue-6) 15%, var(--app-color-surface))', color: 'var(--mantine-color-blue-6)', fontWeight: 700, border: '1px solid color-mix(in srgb, var(--mantine-color-blue-6) 30%, var(--app-color-border))' }}
              >
                STUDENT ID: {user?.student_id || '123456'}
              </Badge>
            </Group>
          </Paper>
        </Box>
      </Modal>
    </Box>
  );
};

export default LeftNavigation;
