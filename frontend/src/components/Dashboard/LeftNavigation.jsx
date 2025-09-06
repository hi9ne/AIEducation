import React from 'react';
import { 
  Box, 
  Stack, 
  Text, 
  Paper, 
  Group, 
  Button,
  Avatar,
  Badge,
  Divider,
} from '@mantine/core';
import styles from './LeftNavigation.module.css';
import StudentCard from './StudentCard';
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
  IconChevronRight,
  IconUser,
  IconBell,
  IconHelp
} from '@tabler/icons-react';

const LeftNavigation = ({ activeSection, onSectionChange, user }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  
  const studentData = {
    name: user?.first_name + ' ' + user?.last_name || 'Студент',
    id: user?.id ? `AS-${new Date().getFullYear()}-${String(user.id).padStart(6, '0')}` : 'AS-2025-000000',
    department: 'Подготовка к поступлению',
    program: 'Италия - Высшее образование',
    photo: user?.photo || null
  };
  
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
    <Box style={{ height: '100%', backgroundColor: 'var(--mantine-color-gray-0)' }}>
      <Stack gap="xs" style={{ padding: '16px' }}>
        {/* User Profile */}
        <Paper 
          className={styles.profileButton}
          shadow="sm" 
          radius="md"
          onClick={() => setIsProfileModalOpen(true)}
        >
          <Group>
            <Avatar size="md" color="blue" radius="xl">
              АС
            </Avatar>
            <Box style={{ flex: 1 }}>
              <Text size="sm" fw={600} c="dark">
                Аскар Студент
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

        {/* Profile Modal */}
        {isProfileModalOpen && (
          <Box
            className={styles.modalOverlay}
            onClick={() => setIsProfileModalOpen(false)}
          >
            <Box 
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <StudentCard
                student={studentData}
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
              />
            </Box>
          </Box>
        )}

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
                  <Icon 
                    size={20} 
                    color={isActive ? 'white' : getColorValue(item.color)} 
                  />
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
                  height: 'auto',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: isActive ? getColorValue(item.color) : 'transparent',
                  borderLeft: isActive ? `3px solid ${getColorValue(item.color)}` : '3px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <Box style={{ textAlign: 'left' }}>
                  <Text size="sm" fw={isActive ? 600 : 500} c={isActive ? 'white' : 'dark'}>
                    {item.label}
                  </Text>
                  <Text size="xs" c={isActive ? 'white' : 'dimmed'}>
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
    </Box>
  );
};

export default LeftNavigation;
