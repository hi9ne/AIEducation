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
  Progress,
  Select,
  NumberInput,
  Pagination,
  Skeleton,
  Alert,
  ActionIcon,
  Modal,
  Textarea,
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconMapPin,
  IconStar,
  IconCurrencyEuro,
  IconUsers,
  IconCalendar,
  IconBook,
  IconBuilding,
  IconArrowRight,
  IconEye,
  IconHeart,
  IconShare,
  IconDownload,
  IconExternalLink,
  IconPlus,
  IconX,
  IconCheck,
  IconClock,
  IconAlertCircle,
} from '@tabler/icons-react';

// Тестовые данные для университетов
const mockUniversities = [
  {
    id: 1,
    name: "University of Bologna",
    country: "Italy",
    city: "Bologna",
    description: "Старейший университет в мире, основанный в 1088 году. Один из ведущих университетов Италии.",
    website: "https://www.unibo.it",
    ranking: 167,
    tuition: 2200,
    currency: "EUR",
    students: 87000,
    founded_year: 1088,
    programs: ["Computer Science", "Engineering", "Medicine", "Law", "Economics"],
    deadline: "2024-07-15"
  },
  {
    id: 2,
    name: "Sapienza University of Rome",
    country: "Italy",
    city: "Rome",
    description: "Крупнейший университет Европы по количеству студентов. Ведущий исследовательский университет.",
    website: "https://www.uniroma1.it",
    ranking: 171,
    tuition: 2000,
    currency: "EUR",
    students: 112000,
    founded_year: 1303,
    programs: ["Architecture", "Engineering", "Medicine", "Psychology", "Literature"],
    deadline: "2024-08-01"
  },
  {
    id: 3,
    name: "University of Milan",
    country: "Italy",
    city: "Milan",
    description: "Один из крупнейших университетов Италии с сильными программами в области науки и технологий.",
    website: "https://www.unimi.it",
    ranking: 301,
    tuition: 2500,
    currency: "EUR",
    students: 60000,
    founded_year: 1924,
    programs: ["Business", "Computer Science", "Medicine", "Pharmacy", "Law"],
    deadline: "2024-06-30"
  },
  {
    id: 4,
    name: "Politecnico di Milano",
    country: "Italy",
    city: "Milan",
    description: "Ведущий технический университет Италии, специализирующийся на инженерии, архитектуре и дизайне.",
    website: "https://www.polimi.it",
    ranking: 149,
    tuition: 3800,
    currency: "EUR",
    students: 47000,
    founded_year: 1863,
    programs: ["Engineering", "Architecture", "Design", "Management", "Mathematics"],
    deadline: "2024-07-20"
  },
  {
    id: 5,
    name: "University of Turin",
    country: "Italy",
    city: "Turin",
    description: "Один из старейших университетов Италии с богатой историей и современными исследовательскими программами.",
    website: "https://www.unito.it",
    ranking: 401,
    tuition: 1800,
    currency: "EUR",
    students: 80000,
    founded_year: 1404,
    programs: ["Medicine", "Law", "Economics", "Psychology", "Political Science"],
    deadline: "2024-08-15"
  }
];

const UniversitiesSection = ({ progress }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  
  // Получаем данные из Redux store
  const universities = useSelector((state) => state.education.universities);
  const loading = useSelector((state) => state.education.loading.universities);
  const error = useSelector((state) => state.education.error);

  // Извлекаем значения из объекта progress
  const universitiesProgress = progress?.currentProgress?.universities || 0;
  const overallProgress = progress?.overallProgress || 0;

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

  // Фильтрация университетов
  const filteredUniversities = displayUniversities?.filter((university) => {
    const matchesSearch = university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         university.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (university.programs || []).some(program => 
                           program.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesCountry = !selectedCountry || university.country === selectedCountry;
    const matchesProgram = !selectedProgram || (university.programs || []).includes(selectedProgram);
    const matchesTuition = (!minTuition || (university.tuition || 0) >= minTuition) &&
                          (!maxTuition || (university.tuition || 0) <= maxTuition);
    
    return matchesSearch && matchesCountry && matchesProgram && matchesTuition;
  }) || [];

  const countries = [...new Set(displayUniversities?.map(u => u.country) || [])];
  const programs = [...new Set(displayUniversities?.flatMap(u => u.programs || []) || [])];

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
      
      {/* Прогресс */}
      <Paper p="md" mb="md" withBorder>
        <Group justify="space-between" mb="sm">
          <Text fw={500}>Прогресс поиска университетов</Text>
          <Text size="sm" c="dimmed">{universitiesProgress}%</Text>
        </Group>
        <Progress value={universitiesProgress} size="lg" radius="xl" />
      </Paper>

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
                    <Group gap="xs">
                      <IconMapPin size={16} />
                      <Text size="sm" c="dimmed">{university.country}</Text>
                    </Group>
                    
                    <Group gap="xs">
                      <IconCurrencyEuro size={16} />
                      <Text size="sm" c="dimmed">
                        {(university.tuition || 0).toLocaleString()} €/год
                      </Text>
                    </Group>
                    
                    <Group gap="xs">
                      <IconUsers size={16} />
                      <Text size="sm" c="dimmed">
                        {(university.students || 0).toLocaleString()} студентов
                      </Text>
                    </Group>
                    
                    <Group gap="xs">
                      <IconCalendar size={16} />
                      <Text size="sm" c="dimmed">
                        Дедлайн: {university.deadline}
                      </Text>
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
              <Text>{selectedUniversity.country}</Text>
            </Group>
            
            <Group>
              <IconCurrencyEuro size={16} />
              <Text>{(selectedUniversity.tuition || 0).toLocaleString()} €/год</Text>
            </Group>
            
            <Group>
              <IconUsers size={16} />
              <Text>{(selectedUniversity.students || 0).toLocaleString()} студентов</Text>
            </Group>
            
            <Group>
              <IconCalendar size={16} />
              <Text>Дедлайн: {selectedUniversity.deadline}</Text>
            </Group>
            
            <Text fw={500}>Программы:</Text>
            <Group gap="xs">
              {(selectedUniversity.programs || []).map((program, index) => (
                <Badge key={index} variant="light">
                  {program}
                </Badge>
              ))}
            </Group>
            
            <Text fw={500}>Описание:</Text>
            <Text size="sm" c="dimmed">
              {selectedUniversity.description}
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
