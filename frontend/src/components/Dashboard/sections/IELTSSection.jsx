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
      difficulty: 'Легкий',
      score: null,
      status: 'locked'
    }
  ];

  const videoLessons = [
    {
      id: 1,
      title: 'Reading: Skimming and Scanning',
      duration: '15 минут',
      category: 'Reading',
      completed: true
    },
    {
      id: 2,
      title: 'Writing Task 1: Academic Graphs',
      duration: '22 минуты',
      category: 'Writing',
      completed: true
    },
    {
      id: 3,
      title: 'Listening: Note-taking Techniques',
      duration: '18 минут',
      category: 'Listening',
      completed: false
    },
    {
      id: 4,
      title: 'Speaking: Part 2 Long Turn',
      duration: '25 минут',
      category: 'Speaking',
      completed: false
    }
  ];

  const skills = [
    { name: 'Reading', current: 6.0, target: 7.0, color: 'blue' },
    { name: 'Writing', current: 5.5, target: 7.0, color: 'green' },
    { name: 'Listening', current: 6.5, target: 7.0, color: 'purple' },
    { name: 'Speaking', current: 5.0, target: 7.0, color: 'orange' }
  ];

  return (
    <Box className="p-6">
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Text size="xl" fw={700} c="dark">
            Подготовка к IELTS
          </Text>
          <Text size="md" c="dimmed">
            Достигните целевого балла 7.0
          </Text>
        </Box>

        {/* Progress Overview */}
        <Paper className="p-6" shadow="sm">
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Text size="lg" fw={600}>
                    Текущий уровень: {currentLevel} → Цель: {targetLevel}
                  </Text>
                  <Button
                    variant="light"
                    color="blue"
                    onClick={() => setOpened(true)}
                    leftSection={<IconTarget size={16} />}
                  >
                    Изменить цели
                  </Button>
                </Group>
                <Progress
                  value={((currentLevel - 4) / (targetLevel - 4)) * 100}
                  color="blue"
                  size="xl"
                  className="mb-2"
                />
                <Text size="sm" c="dimmed">
                  Осталось набрать {targetLevel - currentLevel} баллов до цели
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card className="h-full" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                <Stack align="center" gap="sm">
                  <IconTrophy size={48} color="var(--mantine-color-blue-6)" />
                  <Text size="lg" fw={700} c="blue">
                    {progress}%
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Общий прогресс подготовки
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Skills Breakdown */}
        <Paper className="p-6" shadow="sm">
          <Text size="lg" fw={600} className="mb-4">
            Прогресс по навыкам
          </Text>
          <Grid>
            {skills.map((skill, index) => (
              <Grid.Col key={index} span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="md">
                    <Text size="md" fw={600} c="dark">
                      {skill.name}
                    </Text>
                    <Box>
                      <Group justify="space-between" className="mb-2">
                        <Text size="sm" c="dimmed">
                          Текущий: {skill.current}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Цель: {skill.target}
                        </Text>
                      </Group>
                      <Progress
                        value={((skill.current - 4) / (skill.target - 4)) * 100}
                        color={skill.color}
                        size="md"
                      />
                    </Box>
                    <Badge
                      color={skill.current >= skill.target ? 'green' : 'yellow'}
                      variant="light"
                    >
                      {skill.current >= skill.target ? 'Достигнуто' : 'В процессе'}
                    </Badge>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Paper>

        {/* Tabs for different content */}
        <Tabs defaultValue="tests">
          <Tabs.List>
            <Tabs.Tab value="tests" leftSection={<IconBook size={16} />}>
              Mock-тесты
            </Tabs.Tab>
            <Tabs.Tab value="videos" leftSection={<IconPlayerPlay size={16} />}>
              Видео-уроки
            </Tabs.Tab>
            <Tabs.Tab value="practice" leftSection={<IconTarget size={16} />}>
              Практика
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="tests" className="mt-6">
            <Stack gap="md">
              <Text size="lg" fw={600}>
                Доступные тесты
              </Text>
              <Grid>
                {mockTests.map((test) => (
                  <Grid.Col key={test.id} span={{ base: 12, md: 6 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                      <Stack gap="md">
                        <Group justify="space-between" align="flex-start">
                          <Box>
                            <Text size="md" fw={600} c="dark">
                              {test.title}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {test.duration} • {test.difficulty}
                            </Text>
                          </Box>
                          {test.score && (
                            <Badge color="green" variant="light">
                              {test.score} баллов
                            </Badge>
                          )}
                        </Group>
                        
                        {test.status === 'completed' && (
                          <Group>
                            <IconCheck size={16} color="green" />
                            <Text size="sm" c="green">
                              Тест завершен
                            </Text>
                          </Group>
                        )}
                        
                        <Button
                          leftSection={test.status === 'completed' ? <IconEye size={16} /> : <IconPlayerPlay size={16} />}
                          color={test.status === 'completed' ? 'blue' : 'green'}
                          variant={test.status === 'completed' ? 'outline' : 'filled'}
                          disabled={test.status === 'locked'}
                          fullWidth
                        >
                          {test.status === 'completed' ? 'Просмотреть результаты' :
                           test.status === 'locked' ? 'Заблокировано' : 'Начать тест'}
                        </Button>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="videos" className="mt-6">
            <Stack gap="md">
              <Text size="lg" fw={600}>
                Видео-уроки
              </Text>
              <Stack gap="sm">
                {videoLessons.map((lesson) => (
                  <Card key={lesson.id} shadow="sm" padding="md" radius="md" withBorder>
                    <Group justify="space-between" align="center">
                      <Group>
                        <ActionIcon
                          color={lesson.completed ? 'green' : 'blue'}
                          variant={lesson.completed ? 'filled' : 'light'}
                          size="lg"
                        >
                          {lesson.completed ? <IconCheck size={20} /> : <IconPlayerPlay size={20} />}
                        </ActionIcon>
                        <Box>
                          <Text size="md" fw={500} c="dark">
                            {lesson.title}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {lesson.category} • {lesson.duration}
                          </Text>
                        </Box>
                      </Group>
                      <Button
                        leftSection={<IconEye size={16} />}
                        color="blue"
                        variant="outline"
                        size="sm"
                      >
                        Просмотреть
                      </Button>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="practice" className="mt-6">
            <Stack gap="md">
              <Text size="lg" fw={600}>
                Дополнительная практика
              </Text>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="md">
                      <Group>
                        <IconBook size={24} color="var(--mantine-color-blue-6)" />
                        <Text size="md" fw={600}>
                          Словарь IELTS
                        </Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        Изучайте новые слова и фразы для экзамена
                      </Text>
                      <Button color="blue" variant="outline" fullWidth>
                        Открыть словарь
                      </Button>
                    </Stack>
                  </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="md">
                      <Group>
                        <IconTarget size={24} color="var(--mantine-color-green-6)" />
                        <Text size="md" fw={600}>
                          Упражнения
                        </Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        Практические задания по всем разделам
                      </Text>
                      <Button color="green" variant="outline" fullWidth>
                        Начать упражнения
                      </Button>
                    </Stack>
                  </Card>
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Modal for setting goals */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Установить цели IELTS"
        size="md"
      >
        <Stack gap="md">
          <NumberInput
            label="Текущий уровень"
            value={currentLevel}
            onChange={setCurrentLevel}
            min={4}
            max={9}
            step={0.5}
            precision={1}
          />
          <NumberInput
            label="Целевой уровень"
            value={targetLevel}
            onChange={setTargetLevel}
            min={4}
            max={9}
            step={0.5}
            precision={1}
          />
          <Button onClick={() => setOpened(false)}>
            Сохранить цели
          </Button>
        </Stack>
      </Modal>
    </Box>
  );
};

export default IELTSSection;
