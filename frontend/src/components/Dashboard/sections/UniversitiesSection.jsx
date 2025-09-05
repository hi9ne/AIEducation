import React, { useEffect, useState } from 'react';
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
  Checkbox,
  Pagination,
  Skeleton,
  Alert,
  ActionIcon,
  Modal,
  Textarea
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
  IconHeart,
  IconHeartFilled,
  IconAlertCircle
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import useEducationStore from '../../../store/educationStore';

const UniversitiesSection = ({ progress }) => {
  const {
    universities,
    loading,
    errors,
    fetchUniversities,
    searchUniversities,
    createApplication
  } = useEducationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [minTuition, setMinTuition] = useState('');
  const [maxTuition, setMaxTuition] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Моковые данные для демонстрации
  const mockUniversities = [
    {
      id: 1,
      name: "University of Bologna",
      country: "Italy",
      city: "Bologna",
      ranking: 160,
      tuition: 2000,
      majors: ["Computer Science", "Engineering", "Medicine"],
      description: "Старейший университет в мире, основан в 1088 году",
      image: "https://via.placeholder.com/300x200",
      rating: 4.5,
      students: 87000
    },
    {
      id: 2,
      name: "Sapienza University of Rome",
      country: "Italy",
      city: "Rome",
      ranking: 171,
      tuition: 1500,
      majors: ["Architecture", "Engineering", "Literature"],
      description: "Крупнейший университет в Европе",
      image: "https://via.placeholder.com/300x200",
      rating: 4.3,
      students: 112000
    },
    {
      id: 3,
      name: "University of Milan",
      country: "Italy",
      city: "Milan",
      ranking: 301,
      tuition: 2500,
      majors: ["Business", "Economics", "Medicine"],
      description: "Ведущий исследовательский университет",
      image: "https://via.placeholder.com/300x200",
      rating: 4.2,
      students: 60000
    },
    {
      id: 4,
      name: "University of Florence",
      country: "Italy",
      city: "Florence",
      ranking: 401,
      tuition: 1800,
      majors: ["Art", "History", "Architecture"],
      description: "Университет в сердце Возрождения",
      image: "https://via.placeholder.com/300x200",
      rating: 4.4,
      students: 51000
    }
  ];

  // Используем моковые данные, если universities не является массивом
  const universitiesList = Array.isArray(universities) ? universities : mockUniversities;

  useEffect(() => {
    // Не загружаем данные, так как API endpoints не существуют
    // fetchUniversities();
  }, [fetchUniversities]);

  const handleSearch = () => {
    // Имитируем поиск
    console.log('Searching for:', searchQuery);
  };

  const handleApply = (university) => {
    setSelectedUniversity(university);
    setShowModal(true);
  };

  const handleCreateApplication = () => {
    if (selectedUniversity) {
      // createApplication(selectedUniversity.id);
      console.log('Creating application for:', selectedUniversity.name);
      setShowModal(false);
    }
  };

  const toggleFavorite = (universityId) => {
    const newFavorites = new Set(favorites);
    if (favorites.has(universityId)) {
      newFavorites.delete(universityId);
    } else {
      newFavorites.add(universityId);
    }
    setFavorites(newFavorites);
  };

  const countries = ['Italy', 'Germany', 'France', 'Spain', 'Netherlands'];
  const majors = ['Computer Science', 'Engineering', 'Medicine', 'Business', 'Art'];

  if (loading.universities) {
    return (
      <Box p="md">
        <Stack gap="md">
          <Skeleton height={200} radius="md" />
          <Skeleton height={100} radius="md" />
          <Skeleton height={150} radius="md" />
        </Stack>
      </Box>
    );
  }

  if (errors.universities) {
    return (
      <Box p="md">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Ошибка загрузки университетов"
          color="red"
        >
          <Text size="sm">
            {errors.universities}
          </Text>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p="md">
      <Stack gap="lg">
        {/* Заголовок */}
        <Box>
          <Text size="xl" fw={700} c="blue" mb="xs">
            Поиск университетов
          </Text>
          <Text size="sm" c="dimmed">
            Найдите подходящий университет для обучения за рубежом
          </Text>
        </Box>

        {/* Поиск и фильтры */}
        <Paper shadow="sm" p="md" radius="md" withBorder>
          <Stack gap="md">
            <Group>
              <TextInput
                placeholder="Поиск по названию университета..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftSection={<IconSearch size={16} />}
                style={{ flex: 1 }}
              />
              <Button
                leftSection={<IconSearch size={16} />}
                onClick={handleSearch}
                loading={loading.universities}
              >
                Найти
              </Button>
              <Button
                variant="light"
                leftSection={<IconFilter size={16} />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Фильтры
              </Button>
            </Group>

            {showFilters && (
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Select
                    placeholder="Страна"
                    data={countries}
                    value={selectedCountry}
                    onChange={setSelectedCountry}
                    leftSection={<IconMapPin size={16} />}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Select
                    placeholder="Специальность"
                    data={majors}
                    value={selectedMajor}
                    onChange={setSelectedMajor}
                    leftSection={<IconBook size={16} />}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <NumberInput
                    placeholder="Мин. стоимость"
                    value={minTuition}
                    onChange={setMinTuition}
                    leftSection={<IconCurrencyEuro size={16} />}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <NumberInput
                    placeholder="Макс. стоимость"
                    value={maxTuition}
                    onChange={setMaxTuition}
                    leftSection={<IconCurrencyEuro size={16} />}
                  />
                </Grid.Col>
              </Grid>
            )}
          </Stack>
        </Paper>

        {/* Результаты поиска */}
        <Paper shadow="sm" p="md" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={600}>
              Найдено университетов: {universitiesList.length}
            </Text>
            <Button
              variant="light"
              leftSection={<IconFilter size={16} />}
              loading={loading.universities}
            >
              Сортировать
            </Button>
          </Group>

          {/* Список университетов */}
          <Grid>
            {universitiesList.map((university, index) => (
              <Grid.Col key={university.id} span={{ base: 12, md: 6, lg: 4 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card shadow="sm" padding="lg" radius="md" style={{ height: '100%' }}>
                    <Group justify="space-between" mb="md">
                      <Text fw={600} size="lg">
                        {university.name}
                      </Text>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => toggleFavorite(university.id)}
                      >
                        {favorites.has(university.id) ? (
                          <IconHeartFilled size={16} />
                        ) : (
                          <IconHeart size={16} />
                        )}
                      </ActionIcon>
                    </Group>

                    <Group mb="sm">
                      <IconMapPin size={16} color="gray" />
                      <Text size="sm" c="dimmed">
                        {university.city}, {university.country}
                      </Text>
                    </Group>

                    <Group mb="sm">
                      <IconStar size={16} color="orange" />
                      <Text size="sm" fw={500}>
                        Рейтинг: {university.ranking}
                      </Text>
                    </Group>

                    <Group mb="sm">
                      <IconCurrencyEuro size={16} color="green" />
                      <Text size="sm">
                        Стоимость: €{university.tuition}/год
                      </Text>
                    </Group>

                    <Group mb="md">
                      <IconUsers size={16} color="blue" />
                      <Text size="sm">
                        Студентов: {university.students.toLocaleString()}
                      </Text>
                    </Group>

                    <Text size="sm" c="dimmed" mb="md" lineClamp={3}>
                      {university.description}
                    </Text>

                    <Stack gap="xs" mb="md">
                      <Text size="sm" fw={500}>
                        Специальности:
                      </Text>
                      <Group gap="xs">
                        {university.majors.slice(0, 2).map((major, idx) => (
                          <Badge key={idx} variant="light" size="sm">
                            {major}
                          </Badge>
                        ))}
                        {university.majors.length > 2 && (
                          <Badge variant="light" size="sm">
                            +{university.majors.length - 2}
                          </Badge>
                        )}
                      </Group>
                    </Stack>

                    <Button
                      fullWidth
                      leftSection={<IconArrowRight size={16} />}
                      onClick={() => handleApply(university)}
                    >
                      Подать заявку
                    </Button>
                  </Card>
                </motion.div>
              </Grid.Col>
            ))}
          </Grid>

          {/* Пагинация */}
          {universitiesList.length > 0 && (
            <Group justify="center" mt="lg">
              <Pagination
                value={currentPage}
                onChange={setCurrentPage}
                total={Math.ceil(universitiesList.length / 12)}
                size="sm"
              />
            </Group>
          )}
        </Paper>

        {/* Модальное окно подачи заявки */}
        <Modal
          opened={showModal}
          onClose={() => setShowModal(false)}
          title="Подача заявки"
          size="md"
        >
          {selectedUniversity && (
            <Stack gap="md">
              <Text fw={600}>
                {selectedUniversity.name}
              </Text>
              <Text size="sm" c="dimmed">
                {selectedUniversity.city}, {selectedUniversity.country}
              </Text>
              
              <Textarea
                label="Мотивационное письмо"
                placeholder="Расскажите, почему вы хотите учиться в этом университете..."
                minRows={4}
              />
              
              <Group justify="flex-end">
                <Button variant="light" onClick={() => setShowModal(false)}>
                  Отмена
                </Button>
                <Button onClick={handleCreateApplication}>
                  Подать заявку
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>
      </Stack>
    </Box>
  );
};

export default UniversitiesSection;
