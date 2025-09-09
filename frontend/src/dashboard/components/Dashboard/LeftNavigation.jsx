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

const LeftNavigation = ({ activeSection, onSectionChange, user }) => {
  const [showStudentCard, setShowStudentCard] = useState(false);
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
      color: 'green',
      progress: 75
    },
    {
      id: 'tolc',
      label: 'TOLC',
      description: 'Итальянский тест',
      icon: IconSchool,
      color: 'purple',
      progress: 30
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
      color: 'cyan',
      progress: 60
    },
    {
      id: 'codice',
      label: 'Codice Fiscale',
      description: 'Налоговый код',
      icon: IconCreditCard,
      color: 'teal',
      progress: 40
    },
    {
      id: 'dov',
      label: 'DOV',
      description: 'Легализация',
      icon: IconFile,
      color: 'indigo',
      progress: 20
    },
    {
      id: 'visa',
      label: 'Виза',
      description: 'Визовая поддержка',
      icon: IconPlane,
      color: 'pink',
      progress: 10
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
    <Box style={{ height: '100%', backgroundColor: 'var(--mantine-color-gray-0)', paddingTop: 24 }}>
      <Stack gap="xs" style={{ padding: '16px' }}>
        {/* Top spacer to avoid clipping under app frame */}
        <Box style={{ height: 8 }} />
        {/* User Profile */}
        <Paper
          withBorder
          radius="md"
          p="md"
          onClick={() => setShowStudentCard(true)}
          style={{
            marginTop: 10,
            backgroundColor: 'white',
            borderColor: 'var(--mantine-color-gray-3)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'transform 150ms ease, box-shadow 150ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Group>
            <Avatar
              size="md"
              color="blue"
              radius="xl"
              src={user?.photo}
            >
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Avatar>
            <Box style={{ flex: 1 }}>
              <Text size="sm" fw={600} c="dark">
                {user?.first_name} {user?.last_name}
              </Text>
              <Text size="xs" c="dimmed">
                Студент
              </Text>
            </Box>
            <Badge color="green" variant="light" size="sm">
              Активен
            </Badge>
          </Group>
        </Paper>

        {/* Navigation Items */}
        <Stack gap="xs">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'filled' : 'subtle'}
                color={isActive ? item.color : 'gray'}
                onClick={() => onSectionChange(item.id)}
                justify="flex-start"
                leftSection={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon 
                      size={20} 
                      color={isActive ? 'white' : getColorValue(item.color)} 
                    />
                  </div>
                }
                rightSection={
                  item.progress && (
                    <Badge 
                      size="xs" 
                      color={item.color} 
                      variant="light"
                    >
                      {item.progress}%
                    </Badge>
                  )
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 'auto',
                  minHeight: 48,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: isActive ? getColorValue(item.color) : 'transparent',
                  borderLeft: isActive ? `3px solid ${getColorValue(item.color)}` : '3px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <Box style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <Text size="sm" fw={isActive ? 600 : 500} c={isActive ? 'white' : 'dark'} style={{ lineHeight: 1.2 }}>
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
          style={{
            height: 'auto',
            padding: '12px',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Box style={{ textAlign: 'left' }}>
            <Text size="sm" fw={activeSection === 'settings' ? 600 : 500}>
              Настройки
            </Text>
            <Text size="xs" c="dimmed">
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
            style={{
              height: 'auto',
              padding: '12px',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Box style={{ textAlign: 'left' }}>
              <Text size="sm" fw={500}>
                Помощь
              </Text>
              <Text size="xs" c="dimmed">
                FAQ и поддержка
              </Text>
            </Box>
          </Button>

          <Button
            variant="subtle"
            color="gray"
            justify="flex-start"
            leftSection={<IconBell size={20} />}
            style={{
              height: 'auto',
              padding: '12px',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Box style={{ textAlign: 'left' }}>
              <Text size="sm" fw={500}>
                Уведомления
              </Text>
              <Text size="xs" c="dimmed">
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
              background: 'linear-gradient(135deg, #a5d8ff 0%, #74c0fc 100%)',
              borderRadius: 16,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative circles */}
            <Box style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <Box style={{
                position: 'absolute', width: 220, height: 220, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', right: -40, top: -40
              }} />
              <Box style={{
                position: 'absolute', width: 140, height: 140, borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)', left: 60, bottom: -30
              }} />
            </Box>

            <Group justify="space-between" style={{ padding: 24, position: 'relative', zIndex: 1 }}>
              <Box>
                <Group gap={8}>
                  <Box style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Text fw={800} c="#1971c2">U</Text>
                  </Box>
                  <Text fw={700} c="white">University Card</Text>
                </Group>
              </Box>
              <Avatar src={user?.photo} radius="md" size={84} alt="student" />
            </Group>

            <Group style={{ padding: '0 24px' }}>
              <Box style={{ flex: 1 }}>
                <Text size="lg" fw={700} c="white" style={{ lineHeight: 1.1 }}>
                  {user?.first_name || 'Jane'} {user?.last_name || 'Doe'}
                </Text>
                <Text size="sm" c="rgba(255,255,255,0.9)" style={{ marginTop: 4 }}>
                  Computer Science
                </Text>
              </Box>
              <Button size="md" radius="xl" color="green" variant="filled">
                LEARN MORE
              </Button>
            </Group>

            <Group style={{ padding: 24, marginTop: 16 }}>
              <Badge
                size="lg"
                color="blue"
                variant="light"
                style={{ background: 'rgba(255,255,255,0.85)', color: '#1c7ed6', fontWeight: 700, border: 'none' }}
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
