import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUniversities } from '../../../../store/educationSlice';
import { useAuth } from '../../../../shared/hooks/useAuth';
import {
  Box,
  Stack,
  Text,
  Paper,
  Group,
  Badge,
  Button,
  Card,
  Grid,
  TextInput,
  Select,
  NumberInput,
  Pagination,
  Skeleton,
  Alert,
  ActionIcon,
  Modal,
} from '@mantine/core';
import {
  IconSearch,
  IconMapPin,
  IconUsers,
  IconCalendar,
  IconEye,
  IconHeart,
  IconShare,
  IconDownload,
  IconExternalLink,
  IconPlus,
  IconAlertCircle,
  IconTrophy,
} from '@tabler/icons-react';

// Статических данных больше нет; компонента полагается только на API

const UniversitiesSection = ({ progress }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  
  // Получаем данные из Redux store
  const universities = useSelector((state) => state.education.universities);
  const loading = useSelector((state) => state.education.loading.universities);
  const error = useSelector((state) => state.education.error);

  // Прогресс поиска убран

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [opened, setOpened] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  // Используем тестовые данные, если нет данных из API
  const displayUniversities = universities || [];

  // Загружаем университеты при монтировании компонента
  useEffect(() => {
    if (isAuthenticated) {
      console.log('UniversitiesSection - Загружаем университеты');
      dispatch(fetchUniversities());
    }
  }, [dispatch, isAuthenticated]);

  // Отладочная информация
  console.log('UniversitiesSection - isAuthenticated:', isAuthenticated);
  console.log('UniversitiesSection - loading:', loading);
  console.log('UniversitiesSection - error:', error);
  console.log('UniversitiesSection - universities:', universities);
  console.log('UniversitiesSection - displayUniversities:', displayUniversities);

  // Фильтрация университетов (учитываем город/описание и отсутствие полей)
  const filteredUniversities = displayUniversities?.filter((university) => {
    const term = (searchTerm || '').toLowerCase().trim();
    const name = (university.name || '').toLowerCase();
    const city = (university.city || '').toLowerCase();
    const description = (university.description || '').toLowerCase();
    const programsList = (university.programs || []).map(p => (p || '').toLowerCase());
  const level = (university.level || '').toLowerCase();

    const matchesSearch = !term ||
      name.includes(term) ||
      city.includes(term) ||
      description.includes(term) ||
      programsList.some(p => p.includes(term));

    const matchesProgram = !selectedProgram || programsList.some(p => p === (selectedProgram || '').toLowerCase());
    const matchesLevel = !selectedLevel || level === (selectedLevel || '').toLowerCase();

    return matchesSearch && matchesProgram && matchesLevel;
  }) || [];

  // Значения для выпадающих списков без пустых элементов
  const programs = [...new Set((displayUniversities?.flatMap(u => u.programs || [])?.filter(Boolean)) || [])];
  const levels = [...new Set((displayUniversities?.map(u => u.level)?.filter(Boolean)) || [])];

  const handleViewDetails = (university) => {
    setSelectedUniversity(university);
    setOpened(true);
  };

  const handleToggleFavorite = (universityId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(universityId)) {
        newFavorites.delete(universityId);
      } else {
        newFavorites.add(universityId);
      }
      return newFavorites;
    });
  };

  const handleDownloadInfo = (university) => {
    console.log('Скачиваем информацию об университете:', university.name);
  };

  const handleShare = (university) => {
    console.log('Делимся университетом:', university.name);
  };

  const handleApply = (university) => {
    console.log('Подаем заявку в университет:', university.name);
  };

  if (loading) {
    return (
      <Box>
        <Text size="xl" fw={600} mb="md">Поиск и выбор университетов</Text>
        <Grid>
          {[1, 2, 3, 4].map((i) => (
            <Grid.Col key={i} span={{ base: 12, md: 6, lg: 4 }}>
              <Skeleton height={200} />
            </Grid.Col>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box style={{ padding: '4px' }}>
      <Text
        size="xl"
        fw={800}
        mb="sm"
        style={{
          background: 'linear-gradient(90deg, #1e3a8a 0%, #0ea5e9 50%, #14b8a6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.2px'
        }}
      >
        Поиск и выбор университетов
      </Text>
      
  {/* Блок прогресса поиска университетов удалён по требованию */}

      {/* Фильтры */}
      <Paper p="md" mb="md" withBorder style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: 12,
        boxShadow: '0 6px 18px rgba(15, 23, 42, 0.06)'
      }}>
        <Group justify="space-between" mb="sm">
          <Text fw={600}>Фильтры поиска</Text>
          <Badge variant="light" color="blue">{(universities || []).length} записей</Badge>
        </Group>
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              placeholder="Поиск по названию, городу или программе..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftSection={<IconSearch size={16} color="#2563eb" />}
              size="md"
              radius="md"
              variant="filled"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Select
              placeholder="Выберите программу"
              value={selectedProgram}
              onChange={setSelectedProgram}
              data={programs.map(program => ({ value: program, label: program }))}
              clearable
              size="md"
              radius="md"
              variant="filled"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Select
              placeholder="Сложность поступления"
              value={selectedLevel}
              onChange={setSelectedLevel}
              data={levels.map(level => ({ value: level, label: level }))}
              clearable
              size="md"
              radius="md"
              variant="filled"
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Результаты поиска */}
      <Box>
        <Group justify="space-between" mb="md">
          <Text fw={500}>
            Найдено университетов: {filteredUniversities.length}
          </Text>
          <Group>
            <Button variant="light" leftSection={<IconDownload size={16} />}>
              Экспорт
            </Button>
            <Button leftSection={<IconPlus size={16} />}>
              Добавить в избранное
            </Button>
          </Group>
        </Group>

        {filteredUniversities.length === 0 ? (
          <Alert icon={<IconAlertCircle size={16} />} title="Университеты не найдены" color="blue" radius="md">
            Попробуйте изменить параметры поиска
          </Alert>
        ) : (
          <Grid gutter="lg">
            {filteredUniversities.map((university) => (
              <Grid.Col key={university.id} span={{ base: 12, md: 6, lg: 4 }}>
                <Card
                  shadow="md"
                  padding="lg"
                  radius="lg"
                  withBorder
                  style={{
                    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                    borderColor: 'var(--mantine-color-gray-3)',
                    transition: 'transform 150ms ease, box-shadow 150ms ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(2,6,23,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                >
                  <Card.Section withBorder inheritPadding py="xs" style={{ backgroundColor: 'rgba(2,132,199,0.04)' }}>
                    <Group justify="space-between">
                      <Text fw={700} size="lg">{university.name}</Text>
                      <ActionIcon
                        variant="subtle"
                        color={favorites.has(university.id) ? "red" : "gray"}
                        onClick={() => handleToggleFavorite(university.id)}
                      >
                        <IconHeart size={16} />
                      </ActionIcon>
                    </Group>
                  </Card.Section>

                  <Stack gap="xs" mt="md">
                    {/* Местоположение (всегда отображается) */}
                    <Group gap="xs">
                      <IconMapPin size={16} />
                      <Text size="sm" c="dimmed">{university.city || '—'}</Text>
                    </Group>

                    {/* Сложность поступления (если указана) */}
                    <Group gap="xs">
                      <IconTrophy size={16} />
                      <Text size="sm" c="dimmed">Сложность: {university.level || '—'}</Text>
                    </Group>

                    {/* Кол-во студентов (всегда отображается) */}
                    {(() => {
                      const val = university.students ?? university.student_count;
                      const shown = (val === null || val === undefined)
                        ? '—'
                        : (() => { const num = Number(val); return isNaN(num) ? String(val) : num.toLocaleString(); })();
                      return (
                        <Group gap="xs">
                          <IconUsers size={16} />
                          <Text size="sm" c="dimmed">{shown} студентов</Text>
                        </Group>
                      );
                    })()}

                    {/* Год основания (всегда отображается) */}
                    <Group gap="xs">
                      <IconCalendar size={16} color="#0ea5e9" />
                      <Text size="sm" c="dimmed">Основан: {university.founded_year ?? '—'}</Text>
                    </Group>
                  </Stack>

                  <Group gap="xs" mt="md">
                    {(university.programs || []).slice(0, 2).map((program, index) => (
                      <Badge key={index} variant="light" size="sm">
                        {program}
                      </Badge>
                    ))}
                    {(university.programs || []).length > 2 && (
                      <Badge variant="light" size="sm">
                        +{(university.programs || []).length - 2}
                      </Badge>
                    )}
                  </Group>

                  <Group justify="space-between" mt="md">
                    <Button
                      variant="light"
                      size="sm"
                      leftSection={<IconEye size={16} />}
                      onClick={() => handleViewDetails(university)}
                      radius="md"
                    >
                      Подробнее
                    </Button>
                    <Group gap="xs">
                      <Button
                        variant="subtle"
                        size="sm"
                        leftSection={<IconExternalLink size={14} />}
                        onClick={() => university.website && window.open(university.website, '_blank')}
                        disabled={!university.website}
                        title={university.website ? 'Открыть сайт' : 'Сайт не указан'}
                        radius="md"
                      >
                        Сайт
                      </Button>
                      <ActionIcon
                        variant="light"
                        size="sm"
                        onClick={() => handleDownloadInfo(university)}
                      >
                        <IconDownload size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        size="sm"
                        onClick={() => handleShare(university)}
                      >
                        <IconShare size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Пагинация */}
        {filteredUniversities.length > 0 && (
          <Group justify="center" mt="xl">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={Math.ceil(filteredUniversities.length / 12)}
              color="blue"
              radius="md"
            />
          </Group>
        )}
      </Box>

      {/* Модальное окно с деталями университета */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={selectedUniversity?.name}
        size="lg"
        centered
        overlayProps={{ backgroundOpacity: 0.45, blur: 3 }}
        transitionProps={{ transition: 'pop', duration: 200 }}
      >
        {selectedUniversity && (
          <Stack gap="md">
            <Group>
              <IconMapPin size={16} />
              <Text>{selectedUniversity.city || '—'}</Text>
            </Group>
            <Group>
              <IconTrophy size={16} />
              <Text>Сложность: {selectedUniversity.level || '—'}</Text>
            </Group>
            
            <Group>
              <IconUsers size={16} />
              <Text>{(selectedUniversity.students ?? selectedUniversity.student_count ?? 0).toLocaleString()} студентов</Text>
            </Group>
            
            <Group>
              <IconCalendar size={16} />
              <Text>Дедлайн: {selectedUniversity.deadline || '—'}</Text>
            </Group>
            
            {(selectedUniversity.programs && selectedUniversity.programs.length > 0) && (
              <>
                <Text fw={500}>Программы:</Text>
                <Group gap="xs">
                  {(selectedUniversity.programs || []).map((program, index) => (
                    <Badge key={index} variant="light">
                      {program}
                    </Badge>
                  ))}
                </Group>
              </>
            )}
            
            <Text fw={500}>Описание:</Text>
            <Text size="sm" c="dimmed">
              {selectedUniversity.description || 'Описание недоступно'}
            </Text>
            
            <Group justify="space-between" mt="md">
              <Button
                leftSection={<IconDownload size={16} />}
                onClick={() => handleDownloadInfo(selectedUniversity)}
              >
                Скачать информацию
              </Button>
              <Button
                leftSection={<IconExternalLink size={16} />}
                onClick={() => handleApply(selectedUniversity)}
              >
                Подать заявку
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default UniversitiesSection;
