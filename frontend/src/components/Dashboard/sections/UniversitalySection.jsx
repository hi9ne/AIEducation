import React, { useState } from 'react';
import { 
  Box, 
  Stack, 
  Text, 
  Paper, 
  Group, 
  Card, 
  Progress, 
  Button,
  Grid,
  Badge,
  List,
  ActionIcon,
  Checkbox,
  Modal,
  TextInput,
  FileInput
} from '@mantine/core';
import { 
  IconFileText, 
  IconPlayerPlay, 
  IconDownload, 
  IconUpload,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconEye,
  IconX
} from '@tabler/icons-react';

const UniversitalySection = ({ progress }) => {
  const [opened, setOpened] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const steps = [
    {
      id: 1,
      title: 'Создание аккаунта на Universitaly',
      description: 'Регистрация на официальном сайте',
      completed: true,
      required: true,
      documents: ['Email', 'Пароль', 'Личные данные']
    },
    {
      id: 2,
      title: 'Заполнение анкеты',
      description: 'Подробная информация о себе',
      completed: true,
      required: true,
      documents: ['Фото', 'Документы об образовании', 'IELTS сертификат']
    },
    {
      id: 3,
      title: 'Выбор университетов',
      description: 'До 20 университетов на выбор',
      completed: false,
      required: true,
      documents: ['Список университетов', 'Приоритеты']
    },
    {
      id: 4,
      title: 'Подача заявки',
      description: 'Окончательная подача документов',
      completed: false,
      required: true,
      documents: ['Все документы', 'Оплата пошлины']
    },
    {
      id: 5,
      title: 'Ожидание результатов',
      description: 'Рассмотрение заявки университетами',
      completed: false,
      required: false,
      documents: []
    }
  ];

  const documents = [
    {
      id: 1,
      name: 'Аттестат о среднем образовании',
      status: 'uploaded',
      required: true,
      size: '2.3 MB',
      uploadedAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'IELTS сертификат',
      status: 'uploaded',
      required: true,
      size: '1.8 MB',
      uploadedAt: '2024-01-20'
    },
    {
      id: 3,
      name: 'Мотивационное письмо',
      status: 'pending',
      required: true,
      size: null,
      uploadedAt: null
    },
    {
      id: 4,
      name: 'Рекомендательные письма',
      status: 'pending',
      required: true,
      size: null,
      uploadedAt: null
    },
    {
      id: 5,
      name: 'Справка о доходах',
      status: 'not_required',
      required: false,
      size: null,
      uploadedAt: null
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'uploaded': return 'green';
      case 'pending': return 'yellow';
      case 'not_required': return 'gray';
      default: return 'red';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'uploaded': return 'Загружено';
      case 'pending': return 'Ожидает загрузки';
      case 'not_required': return 'Не требуется';
      default: return 'Ошибка';
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.filter(step => step.required).length;

  return (
    <Box className="p-6">
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Text size="xl" fw={700} c="dark">
            Universitaly
          </Text>
          <Text size="md" c="dimmed">
            Регистрация и подача документов через Universitaly
          </Text>
        </Box>

        {/* Progress Overview */}
        <Paper className="p-6" shadow="sm">
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Text size="lg" fw={600}>
                    Прогресс регистрации: {completedSteps}/{totalSteps} шагов
                  </Text>
                  <Badge color="blue" variant="light">
                    {Math.round((completedSteps / totalSteps) * 100)}%
                  </Badge>
                </Group>
                <Progress
                  value={(completedSteps / totalSteps) * 100}
                  color="blue"
                  size="xl"
                  className="mb-2"
                />
                <Text size="sm" c="dimmed">
                  Следующий шаг: {steps.find(step => !step.completed && step.required)?.title}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card className="h-full" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                <Stack align="center" gap="sm">
                  <IconFileText size={48} color="var(--mantine-color-blue-6)" />
                  <Text size="lg" fw={700} c="blue">
                    {progress}%
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Общий прогресс
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Steps */}
        <Paper className="p-6" shadow="sm">
          <Text size="lg" fw={600} className="mb-4">
            Пошаговый план
          </Text>
          <Stack gap="md">
            {steps.map((step, index) => (
              <Card key={step.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" align="flex-start">
                  <Group>
                    <ActionIcon
                      color={step.completed ? 'green' : 'blue'}
                      variant={step.completed ? 'filled' : 'light'}
                      size="lg"
                    >
                      {step.completed ? <IconCheck size={20} /> : <IconClock size={20} />}
                    </ActionIcon>
                    <Box>
                      <Text size="md" fw={600} c="dark">
                        {step.title}
                      </Text>
                      <Text size="sm" c="dimmed" className="mb-2">
                        {step.description}
                      </Text>
                      {step.documents.length > 0 && (
                        <Text size="xs" c="dimmed">
                          Требуемые документы: {step.documents.join(', ')}
                        </Text>
                      )}
                    </Box>
                  </Group>
                  <Group>
                    {step.completed ? (
                      <Badge color="green" variant="light">
                        Завершено
                      </Badge>
                    ) : step.required ? (
                      <Badge color="yellow" variant="light">
                        Требуется
                      </Badge>
                    ) : (
                      <Badge color="gray" variant="light">
                        Опционально
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      leftSection={<IconEye size={16} />}
                    >
                      Подробнее
                    </Button>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        </Paper>

        {/* Documents */}
        <Paper className="p-6" shadow="sm">
          <Group justify="space-between" align="center" className="mb-4">
            <Text size="lg" fw={600}>
              Документы
            </Text>
            <Button
              leftSection={<IconUpload size={16} />}
              onClick={() => setOpened(true)}
            >
              Загрузить документ
            </Button>
          </Group>
          
          <Stack gap="sm">
            {documents.map((doc) => (
              <Card key={doc.id} shadow="sm" padding="md" radius="md" withBorder>
                <Group justify="space-between" align="center">
                  <Group>
                    <IconFileText size={20} color="var(--mantine-color-gray-6)" />
                    <Box>
                      <Text size="md" fw={500} c="dark">
                        {doc.name}
                      </Text>
                      {doc.uploadedAt && (
                        <Text size="xs" c="dimmed">
                          Загружено: {new Date(doc.uploadedAt).toLocaleDateString('ru-RU')} • {doc.size}
                        </Text>
                      )}
                    </Box>
                  </Group>
                  <Group>
                    <Badge
                      color={getStatusColor(doc.status)}
                      variant="light"
                    >
                      {getStatusText(doc.status)}
                    </Badge>
                    {doc.status === 'uploaded' && (
                      <Button
                        size="sm"
                        variant="outline"
                        leftSection={<IconDownload size={16} />}
                      >
                        Скачать
                      </Button>
                    )}
                    {doc.status === 'pending' && (
                      <Button
                        size="sm"
                        color="blue"
                        leftSection={<IconUpload size={16} />}
                      >
                        Загрузить
                      </Button>
                    )}
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        </Paper>

        {/* Video Instructions */}
        <Paper className="p-6" shadow="sm">
          <Text size="lg" fw={600} className="mb-4">
            Видео-инструкции
          </Text>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group>
                    <IconPlayerPlay size={24} color="var(--mantine-color-blue-6)" />
                    <Text size="md" fw={600}>
                      Регистрация на Universitaly
                    </Text>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Пошаговая инструкция по созданию аккаунта
                  </Text>
                  <Button color="blue" variant="outline" fullWidth>
                    Смотреть видео
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group>
                    <IconPlayerPlay size={24} color="var(--mantine-color-green-6)" />
                    <Text size="md" fw={600}>
                      Заполнение анкеты
                    </Text>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Как правильно заполнить все поля анкеты
                  </Text>
                  <Button color="green" variant="outline" fullWidth>
                    Смотреть видео
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Paper>
      </Stack>

      {/* Upload Modal */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Загрузить документ"
        size="md"
      >
        <Stack gap="md">
          <FileInput
            label="Выберите файл"
            placeholder="Нажмите для выбора файла"
            value={selectedFile}
            onChange={setSelectedFile}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <Text size="sm" c="dimmed">
            Поддерживаемые форматы: PDF, DOC, DOCX, JPG, PNG
          </Text>
          <Group>
            <Button onClick={() => setOpened(false)}>
              Загрузить
            </Button>
            <Button variant="outline" onClick={() => setOpened(false)}>
              Отмена
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default UniversitalySection;
