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
  FileInput,
  Alert
} from '@mantine/core';
import { 
  IconCreditCard, 
  IconPlayerPlay, 
  IconDownload, 
  IconUpload,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconEye,
  IconExternalLink
} from '@tabler/icons-react';

const CodiceSection = ({ progress }) => {
  // Извлекаем значения из объекта progress
  const codiceProgress = progress?.currentProgress?.codice || 10;
  const overallProgress = progress?.overallProgress || 0;
  const [opened, setOpened] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const steps = [
    {
      id: 1,
      title: 'Получение справки о доходах',
      description: 'Справка с работы или из налоговой',
      completed: true,
      required: true,
      documents: ['Справка о доходах', 'Справка с работы']
    },
    {
      id: 2,
      title: 'Заполнение заявления',
      description: 'Заполнение формы на получение Codice Fiscale',
      completed: true,
      required: true,
      documents: ['Заявление', 'Копия паспорта', 'Справка о доходах']
    },
    {
      id: 3,
      title: 'Подача документов',
      description: 'Подача в итальянское консульство',
      completed: false,
      required: true,
      documents: ['Все документы', 'Оплата пошлины']
    },
    {
      id: 4,
      title: 'Получение Codice Fiscale',
      description: 'Получение готового документа',
      completed: false,
      required: true,
      documents: ['Codice Fiscale']
    }
  ];

  const documents = [
    {
      id: 1,
      name: 'Справка о доходах',
      status: 'uploaded',
      required: true,
      size: '1.2 MB',
      uploadedAt: '2024-01-10'
    },
    {
      id: 2,
      name: 'Копия паспорта',
      status: 'uploaded',
      required: true,
      size: '2.1 MB',
      uploadedAt: '2024-01-12'
    },
    {
      id: 3,
      name: 'Заявление на Codice Fiscale',
      status: 'pending',
      required: true,
      size: null,
      uploadedAt: null
    },
    {
      id: 4,
      name: 'Квитанция об оплате',
      status: 'pending',
      required: true,
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
            Codice Fiscale
          </Text>
          <Text size="md" c="dimmed">
            Получение итальянского налогового кода
          </Text>
        </Box>

        {/* Important Notice */}
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Важная информация"
          color="blue"
        >
          Codice Fiscale необходим для поступления в итальянские университеты. 
          Процесс получения может занять 2-4 недели.
        </Alert>

        {/* Progress Overview */}
        <Paper className="p-6" shadow="sm">
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Text size="lg" fw={600}>
                    Прогресс получения: {completedSteps}/{totalSteps} шагов
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
                  <IconCreditCard size={48} color="var(--mantine-color-blue-6)" />
                  <Text size="lg" fw={700} c="blue">
                    {codiceProgress}%
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
                    <IconCreditCard size={20} color="var(--mantine-color-gray-6)" />
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
                      Как получить справку о доходах
                    </Text>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Инструкция по получению справки в налоговой
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
                      Заполнение заявления
                    </Text>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Пошаговая инструкция по заполнению формы
                  </Text>
                  <Button color="green" variant="outline" fullWidth>
                    Смотреть видео
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* External Links */}
        <Paper className="p-6" shadow="sm">
          <Text size="lg" fw={600} className="mb-4">
            Полезные ссылки
          </Text>
          <Stack gap="sm">
            <Button
              variant="outline"
              leftSection={<IconExternalLink size={16} />}
              fullWidth
              justify="flex-start"
            >
              Официальный сайт для получения Codice Fiscale
            </Button>
            <Button
              variant="outline"
              leftSection={<IconExternalLink size={16} />}
              fullWidth
              justify="flex-start"
            >
              Итальянское консульство в Казахстане
            </Button>
            <Button
              variant="outline"
              leftSection={<IconExternalLink size={16} />}
              fullWidth
              justify="flex-start"
            >
              Список необходимых документов
            </Button>
          </Stack>
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

export default CodiceSection;
