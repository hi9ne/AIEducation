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
  IconCurrencyEuro,
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
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [minTuition, setMinTuition] = useState('');
  const [maxTuition, setMaxTuition] = useState('');
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
    const country = (university.country || '').toLowerCase();
    const city = (university.city || '').toLowerCase();
    const description = (university.description || '').toLowerCase();
    const programsList = (university.programs || []).map(p => (p || '').toLowerCase());
    const tuitionVal = university.tuition ?? university.tuition_fee ?? 0;

    const matchesSearch = !term ||
      name.includes(term) ||
      country.includes(term) ||
      city.includes(term) ||
      description.includes(term) ||
      programsList.some(p => p.includes(term));

    const matchesCountry = !selectedCountry || country === (selectedCountry || '').toLowerCase();
    const matchesProgram = !selectedProgram || programsList.some(p => p === (selectedProgram || '').toLowerCase());
    const matchesTuition = (minTuition === '' || (tuitionVal || 0) >= Number(minTuition)) &&
                           (maxTuition === '' || (tuitionVal || 0) <= Number(maxTuition));

    return matchesSearch && matchesCountry && matchesProgram && matchesTuition;
  }) || [];

  // Значения для выпадающих списков без пустых элементов
  const countries = [...new Set((displayUniversities?.map(u => u.country)?.filter(Boolean)) || [])];
  const programs = [...new Set((displayUniversities?.flatMap(u => u.programs || [])?.filter(Boolean)) || [])];

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
    <Box>
      <Text size="xl" fw={600} mb="md">Поиск и выбор университетов</Text>
      
  {/* Блок прогресса поиска университетов удалён по требованию */}

      {/* Фильтры */}
      <Paper p="md" mb="md" withBorder>
        <Text fw={500} mb="sm">Фильтры поиска</Text>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              placeholder="Поиск по названию, стране или программе..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftSection={<IconSearch size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Select
              placeholder="Выберите страну"
              value={selectedCountry}
              onChange={setSelectedCountry}
              data={countries.map(country => ({ value: country, label: country }))}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Select
              placeholder="Выберите программу"
              value={selectedProgram}
              onChange={setSelectedProgram}
              data={programs.map(program => ({ value: program, label: program }))}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <NumberInput
              placeholder="Мин. стоимость"
              value={minTuition}
              onChange={setMinTuition}
              leftSection={<IconCurrencyEuro size={16} />}
              min={0}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <NumberInput
              placeholder="Макс. стоимость"
              value={maxTuition}
              onChange={setMaxTuition}
              leftSection={<IconCurrencyEuro size={16} />}
              min={0}
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
          <Alert icon={<IconAlertCircle size={16} />} title="Университеты не найдены">
            Попробуйте изменить параметры поиска
          </Alert>
        ) : (
          <Grid>
            {filteredUniversities.map((university) => (
              <Grid.Col key={university.id} span={{ base: 12, md: 6, lg: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section withBorder inheritPadding py="xs">
                    <Group justify="space-between">
                      <Text fw={500} size="lg">{university.name}</Text>
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
                      <Text size="sm" c="dimmed">{university.city || university.country || '—'}</Text>
                    </Group>

                    {/* Стоимость (всегда отображается) */}
                    {(() => {
                      const val = university.tuition ?? university.tuition_fee;
                      const shown = (val === null || val === undefined || val === '')
                        ? '—'
                        : (() => { const num = Number(val); return isNaN(num) ? String(val) : num.toLocaleString(); })();
                      const curr = university.currency ? ` (${university.currency})` : '';
                      return (
                        <Group gap="xs">
                          <IconCurrencyEuro size={16} />
                          <Text size="sm" c="dimmed">{shown}{shown !== '—' ? ' / год' : ''}{curr}</Text>
                        </Group>
                      );
                    })()}

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

                    {/* Рейтинг (всегда отображается) */}
                    <Group gap="xs">
                      <IconTrophy size={16} />
                      <Text size="sm" c="dimmed">Рейтинг: {university.ranking ?? '—'}</Text>
                    </Group>

                    {/* Год основания (всегда отображается) */}
                    <Group gap="xs">
                      <IconCalendar size={16} />
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
      >
        {selectedUniversity && (
          <Stack gap="md">
            <Group>
              <IconMapPin size={16} />
              <Text>{selectedUniversity.city || selectedUniversity.country || '—'}</Text>
            </Group>
            
            <Group>
              <IconCurrencyEuro size={16} />
              <Text>{(selectedUniversity.tuition ?? selectedUniversity.tuition_fee ?? 0).toLocaleString()} €/год</Text>
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
