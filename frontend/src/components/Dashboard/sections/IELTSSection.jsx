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
  Tabs,
  List,
  ActionIcon,
  Modal,
  TextInput,
  NumberInput
} from '@mantine/core';
import { 
  IconPlayerPlay, 
  IconEye, 
  IconBook, 
  IconTarget, 
  IconClock,
  IconTrophy,
  IconArrowRight,
  IconCheck,
  IconX
} from '@tabler/icons-react';

const IELTSSection = ({ progress }) => {
  const [opened, setOpened] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(5.5);
  const [targetLevel, setTargetLevel] = useState(7.0);

  // Извлекаем значения из объекта progress
  const ieltsProgress = progress?.currentProgress?.ielts || 75;
  const overallProgress = progress?.overallProgress || 0;

  const mockTests = [
    {
      id: 1,
      title: 'IELTS Academic Test 1',
      duration: '2 часа 45 минут',
      difficulty: 'Средний',
      score: null,
      status: 'available'
    },
    {
      id: 2,
      title: 'IELTS Academic Test 2',
      duration: '2 часа 45 минут',
      difficulty: 'Сложный',
      score: 6.5,
      status: 'completed'
    },
    {
      id: 3,
      title: 'IELTS Academic Test 3',
      duration: '2 часа 45 минут',
      difficulty: 'Сложный',
      score: null,
      status: 'locked'
    }
  ];

  const completedTests = mockTests.filter(test => test.status === 'completed').length;
  const totalTests = mockTests.length;
  const testProgress = Math.round((completedTests / totalTests) * 100);

  return (
    <Box p="md">
      <Stack gap="lg">
        {/* Заголовок секции */}
        <Group justify="space-between">
          <Box>
            <Text size="xl" fw={700} c="blue">
              IELTS Подготовка
            </Text>
            <Text size="sm" c="dimmed">
              Подготовка к международному экзамену
            </Text>
          </Box>
          <Badge color="blue" variant="light" size="lg">
            {ieltsProgress}% завершено
          </Badge>
        </Group>

        {/* Текущий и целевой уровень */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder>
              <Stack gap="md">
                <Text size="lg" fw={600}>
                  Текущий уровень
                </Text>
                <Group justify="space-between">
                  <Text size="2xl" fw={700} c="blue">
                    {currentLevel}
                  </Text>
                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => setOpened(true)}
                  >
                    Изменить
                  </Button>
                </Group>
                <Progress
                  value={(currentLevel / 9) * 100}
                  size="lg"
                  radius="md"
                  color="blue"
                />
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder>
              <Stack gap="md">
                <Text size="lg" fw={600}>
                  Целевой уровень
                </Text>
                <Group justify="space-between">
                  <Text size="2xl" fw={700} c="green">
                    {targetLevel}
                  </Text>
                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => setOpened(true)}
                  >
                    Изменить
                  </Button>
                </Group>
                <Progress
                  value={(targetLevel / 9) * 100}
                  size="lg"
                  radius="md"
                  color="green"
                />
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Общий прогресс */}
        <Card withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="lg" fw={600}>
                Общий прогресс подготовки
              </Text>
              <Text size="sm" c="dimmed">
                {ieltsProgress}% завершено
              </Text>
            </Group>
            <Progress
              value={ieltsProgress}
              size="lg"
              radius="md"
              color="blue"
              animated
            />
          </Stack>
        </Card>

        {/* Статистика */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card className="h-full" style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
              <Stack align="center" gap="sm">
                <IconCheck size={48} color="var(--mantine-color-green-6)" />
                <Text size="lg" fw={700} c="green">
                  {completedTests}
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Пройдено тестов
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card className="h-full" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
              <Stack align="center" gap="sm">
                <IconBook size={48} color="var(--mantine-color-blue-6)" />
                <Text size="lg" fw={700} c="blue">
                  {totalTests - completedTests}
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Осталось тестов
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card className="h-full" style={{ backgroundColor: 'var(--mantine-color-orange-0)' }}>
              <Stack align="center" gap="sm">
                <IconClock size={48} color="var(--mantine-color-orange-6)" />
                <Text size="lg" fw={700} c="orange">
                  45
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Дней до экзамена
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card className="h-full" style={{ backgroundColor: 'var(--mantine-color-purple-0)' }}>
              <Stack align="center" gap="sm">
                <IconTrophy size={48} color="var(--mantine-color-purple-6)" />
                <Text size="lg" fw={700} c="purple">
                  {testProgress}%
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Прогресс тестов
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Список тестов */}
        <Card withBorder>
          <Stack gap="md">
            <Text size="lg" fw={600}>
              Доступные тесты
            </Text>
            <Stack gap="sm">
              {mockTests.map((test) => (
                <Paper
                  key={test.id}
                  p="md"
                  withBorder
                  style={{
                    backgroundColor: test.status === 'completed' 
                      ? 'var(--mantine-color-green-0)' 
                      : test.status === 'locked'
                      ? 'var(--mantine-color-gray-1)'
                      : 'var(--mantine-color-gray-0)'
                  }}
                >
                  <Group justify="space-between">
                    <Box style={{ flex: 1 }}>
                      <Text fw={600} mb="xs">
                        {test.title}
                      </Text>
                      <Group gap="md" mb="sm">
                        <Badge color="blue" variant="light">
                          {test.duration}
                        </Badge>
                        <Badge 
                          color={test.difficulty === 'Сложный' ? 'red' : 'yellow'} 
                          variant="light"
                        >
                          {test.difficulty}
                        </Badge>
                        {test.score && (
                          <Badge color="green" variant="light">
                            {test.score} баллов
                          </Badge>
                        )}
                      </Group>
                    </Box>
                    <Group gap="sm">
                      {test.status === 'completed' ? (
                        <Badge color="green" variant="light">
                          Завершено
                        </Badge>
                      ) : test.status === 'locked' ? (
                        <Badge color="gray" variant="light">
                          Заблокировано
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          leftSection={<IconPlayerPlay size={16} />}
                        >
                          Начать
                        </Button>
                      )}
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Card>

        {/* Модальное окно изменения уровня */}
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title="Изменение уровня"
          size="md"
        >
          <Stack gap="md">
            <NumberInput
              label="Текущий уровень"
              value={currentLevel}
              onChange={setCurrentLevel}
              min={0}
              max={9}
              step={0.5}
              precision={1}
            />
            <NumberInput
              label="Целевой уровень"
              value={targetLevel}
              onChange={setTargetLevel}
              min={0}
              max={9}
              step={0.5}
              precision={1}
            />
            <Group justify="flex-end" gap="sm">
              <Button
                variant="light"
                onClick={() => setOpened(false)}
              >
                Отмена
              </Button>
              <Button
                onClick={() => {
                  // Логика сохранения уровней
                  console.log('Сохраняем уровни:', { currentLevel, targetLevel });
                  setOpened(false);
                }}
              >
                Сохранить
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Box>
  );
};

export default IELTSSection;
