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
  Paper,
  ActionIcon,
  useMantineTheme
} from '@mantine/core';
import { 
  IconHome, 
  IconBook, 
  IconSchool, 
  IconBuilding, 
  IconFileText, 
  IconFile, 
  IconPlane, 
  IconSettings,
  IconBell,
  IconHelp,
  IconX
} from '@tabler/icons-react';
import { useDashboardStore } from '../../../store/dashboardStore';
import { API_BASE_URL } from '../../../shared/services/api.js';

const LeftNavigation = ({ activeSection, onSectionChange, user, isMobile = false, isDrawer = false, onClose }) => {
  const [showStudentCard, setShowStudentCard] = useState(false);
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === 'dark';
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
      description: 'Обзор и статистика',
      icon: IconHome,
      color: 'blue'
    },
    {
      id: 'ielts',
      label: 'IELTS',
      description: 'Подготовка к IELTS',
      icon: IconBook,
      color: 'green'
    },
    {
      id: 'tolc',
      label: 'TOLC',
      description: 'Подготовка к TOLC',
      icon: IconSchool,
      color: 'orange'
    },
    {
      id: 'universities',
      label: 'Университеты',
      description: 'Поиск университетов',
      icon: IconBuilding,
      color: 'purple'
    },
    {
      id: 'universitaly',
      label: 'Universitaly',
      description: 'Платформа Universitaly',
      icon: IconBuilding,
      color: 'purple'
    },
    {
      id: 'codice',
      label: 'Codice Fiscale',
      description: 'Документы и коды',
      icon: IconFileText,
      color: 'teal'
    },
    {
      id: 'dov',
      label: 'DOV',
      description: 'Декларация о стоимости',
      icon: IconFile,
      color: 'indigo'
    },
    {
      id: 'visa',
      label: 'Визовая поддержка',
      description: 'Помощь с визами',
      icon: IconPlane,
      color: 'cyan'
    },
    {
      id: 'aimentor',
      label: 'AI Ментор',
      description: 'Персональный помощник',
      icon: IconHelp,
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
    <Box style={{ height: '100%', backgroundColor: 'var(--app-color-surface)' }}>
      {/* Мобильный заголовок с кнопкой закрытия */}
      {isMobile && isDrawer && (
        <Box style={{ 
          padding: '16px', 
          borderBottom: '1px solid var(--mantine-color-gray-3)',
          backgroundColor: 'var(--app-color-surface)'
        }}>
          <Group justify="space-between" align="center">
            <Text 
              size="lg" 
              weight={600}
              style={{ 
                background: 'linear-gradient(45deg, var(--mantine-color-blue-6), var(--mantine-color-purple-6))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Навигация
            </Text>
            <ActionIcon 
              variant="subtle" 
              color="gray" 
              onClick={onClose}
              size="md"
              className="touch-icon-button"
            >
              <IconX size={18} />
            </ActionIcon>
          </Group>
        </Box>
      )}

      <Stack gap="xs" style={{ padding: '16px' }}>
        {/* Top spacer to avoid clipping under app frame - только для десктопа */}
        {!isMobile && <Box style={{ height: 8 }} />}
        
        {/* User Profile */}
        <Paper
          withBorder
          radius="lg"
          p={isMobile ? "sm" : "md"}
          onClick={() => setShowStudentCard(true)}
          style={{
            backgroundColor: 'var(--app-color-surface)',
            borderColor: 'var(--mantine-color-gray-3)',
            boxShadow: 'var(--app-shadow-sm)',
            cursor: 'pointer',
            transition: 'box-shadow 150ms ease, transform 150ms ease',
            color: isDark ? 'var(--mantine-color-white)' : undefined
          }}
          className={isMobile ? "touch-card" : ""}
        >
          <Group>
            <Avatar
              size={isMobile ? "md" : "lg"}
              color="blue"
              radius="xl"
              src={avatarSrc}
            >
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Avatar>
            <Box style={{ flex: 1 }}>
              <Text size={isMobile ? "sm" : "md"} fw={700} c={isDark ? 'white' : 'dark'}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text size="xs" c={isDark ? 'white' : 'dimmed'}>
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
              ielts: currentProgress?.ielts ?? null,
              tolc: currentProgress?.tolc ?? null,
              universitaly: currentProgress?.universitaly ?? null,
              codice: currentProgress?.codice ?? null,
              dov: currentProgress?.dov ?? null,
              visa: currentProgress?.visa ?? null
            };
            const itemProgress = liveProgressMap[item.id];

            return (
              <Button
                key={item.id}
                variant={isActive ? 'filled' : 'subtle'}
                color={isActive ? item.color : 'gray'}
                onClick={() => {
                  onSectionChange(item.id);
                  if (isMobile && onClose) {
                    onClose();
                  }
                }}
                justify="flex-start"
                size={isMobile ? "sm" : "md"}
                radius="md"
                aria-current={isActive ? 'page' : undefined}
                title={item.description}
                style={{
                  minHeight: isMobile ? '48px' : '44px',
                  padding: isMobile ? '8px 12px' : undefined
                }}
                className={isMobile ? "touch-nav-item" : ""}
                styles={{
                  root: {
                    display: 'flex',
                    alignItems: 'center'
                  },
                  label: {
                    color: isDark && !isActive ? '#ffffff' : undefined,
                    fontSize: isMobile ? '14px' : undefined,
                    fontWeight: isActive ? 600 : 500
                  }
                }}
                leftSection={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon 
                      size={isMobile ? 18 : 20} 
                      color={isActive ? 'white' : getColorValue(item.color)} 
                    />
                  </div>
                }
                rightSection={
                  typeof itemProgress === 'number' ? (
                    <Badge 
                      size={isMobile ? "xs" : "sm"} 
                      color={item.color} 
                      variant="light"
                      radius="sm"
                    >
                      {itemProgress}%
                    </Badge>
                  ) : null
                }
              >
                <Box style={{ 
                  textAlign: 'left', 
                  lineHeight: 1.2, 
                  color: isDark && !isActive ? 'white' : undefined 
                }}>
                  <Text 
                    size={isMobile ? "sm" : "md"} 
                    fw={isActive ? 700 : 500} 
                    c={isActive ? 'white' : (isDark ? 'white' : 'dark')} 
                    style={{ lineHeight: 1.2 }}
                  >
                    {item.label}
                  </Text>
                  {!isMobile && (
                    <Text 
                      size="xs" 
                      c={isActive ? 'white' : (isDark ? 'white' : 'dimmed')} 
                      style={{ lineHeight: 1.2 }}
                    >
                      {item.description}
                    </Text>
                  )}
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
            <Text size="md" fw={activeSection === 'settings' ? 600 : 500} c={isDark ? 'white' : (activeSection === 'settings' ? 'dark' : undefined)}>
              Настройки
            </Text>
            <Text size="sm" c={isDark ? 'white' : 'dimmed'} style={{ lineHeight: 1.2 }}>
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
              <Text size="md" fw={500} c={isDark ? 'white' : undefined}>
                Помощь
              </Text>
              <Text size="sm" c={isDark ? 'white' : 'dimmed'} style={{ lineHeight: 1.2 }}>
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
              <Text size="md" fw={500} c={isDark ? 'white' : undefined}>
                Уведомления
              </Text>
              <Text size="sm" c={isDark ? 'white' : 'dimmed'} style={{ lineHeight: 1.2 }}>
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
              width: 720,
              maxWidth: '100%',
              height: 320,
              background: 'transparent',
              border: 'none',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              borderRadius: 16,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* 3D Card background with gradient */}
            <Box style={{ 
              position: 'absolute', 
              inset: 0, 
              pointerEvents: 'none', 
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
              borderRadius: 16
            }} />

            <Group justify="space-between" align="flex-start" style={{ padding: '32px 32px 24px 32px', position: 'relative', zIndex: 1 }}>
              <Box style={{ flex: 1, marginRight: 24 }}>
                <Group gap={8} mb={16}>
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
                  <Text fw={700} c="white">AIEdu Student Card</Text>
                </Group>
                
                <Box style={{ marginBottom: 20 }}>
                  <Text size="xl" fw={700} style={{ lineHeight: 1.1, marginBottom: 8 }} c="white">
                    {user?.first_name || 'Jane'} {user?.last_name || 'Doe'}
                  </Text>
                  <Text size="md" c="white" style={{ opacity: 0.9 }}>
                    {user?.profile?.interests?.[0] || 'Computer Science'}
                  </Text>
                </Box>
                
                <Badge
                  size="lg"
                  color="blue"
                  variant="light"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    color: 'white', 
                    fontWeight: 700, 
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  STUDENT ID: {user?.student_id || '123456'}
                </Badge>
              </Box>
              
              <Box
                style={{
                  width: '220px',
                  height: '260px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <img
                  src={avatarSrc}
                  alt="student"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '12px'
                  }}
                />
              </Box>
            </Group>

          </Paper>
        </Box>
      </Modal>
    </Box>
  );
};

export default LeftNavigation;
