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
  IconHeart,
  IconHeartFilled,
  IconExternalLink,
  IconRefresh,
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
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [minIelts, setMinIelts] = useState('');
  const [maxTuition, setMaxTuition] = useState('');
  const [hasScholarships, setHasScholarships] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  const cities = ['Bologna', 'Rome', 'Milan', 'Florence', 'Turin'];
  const regions = ['Emilia-Romagna', 'Lazio', 'Lombardy', 'Tuscany', 'Piedmont'];
  const majors = ['Computer Engineering', 'Medicine and Surgery', 'Business Administration', 'Data Science'];

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  const handleSearch = async () => {
    const searchParams = {
      query: searchQuery,
      city: selectedCity,
      region: selectedRegion,
      major: selectedMajor,
      min_ielts: minIelts,
      max_tuition: maxTuition,
      has_scholarships: hasScholarships,
      page: currentPage
    };

    // Убираем пустые параметры
    Object.keys(searchParams).forEach(key => {
      if (!searchParams[key] || searchParams[key] === '') {
        delete searchParams[key];
      }
    });

    await searchUniversities(searchParams);
  };

  const handleApply = async (universityId, majorId) => {
    try {
      await createApplication({
        university: universityId,
        major: majorId,
        status: 'draft'
      });
      setApplicationModalOpen(false);
      // Показать уведомление об успехе
    } catch (error) {
      console.error('Failed to create application:', error);
    }
  };

  const toggleFavorite = (universityId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(universityId)) {
      newFavorites.delete(universityId);
    } else {
      newFavorites.add(universityId);
    }
    setFavorites(newFavorites);
  };

  const getRankingColor = (ranking) => {
    if (ranking <= 200) return 'green';
    if (ranking <= 400) return 'blue';
    if (ranking <= 600) return 'yellow';
    return 'gray';
  };

  if (loading.universities) {
    return (
      <Box style={{ padding: '24px' }}>
        <Skeleton height={200} radius="md" mb="md" />
        <Skeleton height={100} radius="md" mb="md" />
        <Skeleton height={150} radius="md" />
      </Box>
    );
  }

  if (errors.universities) {
    return (
      <Box style={{ padding: '24px' }}>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Ошибка загрузки"
          color="red"
          mb="md"
        >
          {errors.universities}
        </Alert>
        <Button onClick={() => fetchUniversities()}>
          Попробовать снова
        </Button>
      </Box>
    );
  }

  return (
    <Box style={{ padding: '24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Заголовок */}
        <Group justify="space-between" mb="xl">
          <Box>
            <Text size="xl" fw={700} c="dark">
              Университеты Италии
            </Text>
            <Text size="sm" c="dimmed">
              Найдите подходящий университет для поступления
            </Text>
          </Box>
          <ActionIcon
            variant="light"
            size="lg"
            onClick={() => fetchUniversities()}
            loading={loading.universities}
          >
            <IconRefresh size={20} />
          </ActionIcon>
        </Group>

        {/* Фильтры поиска */}
        <Paper shadow="sm" p="xl" mb="xl" radius="md">
          <Text size="lg" fw={600} mb="md">
            Поиск и фильтры
          </Text>
          
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Поиск по названию"
                placeholder="Введите название университета"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftSection={<IconSearch size={16} />}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="Город"
                placeholder="Выберите город"
                value={selectedCity}
                onChange={setSelectedCity}
                data={cities.map(city => ({ value: city, label: city }))}
                clearable
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="Регион"
                placeholder="Выберите регион"
                value={selectedRegion}
                onChange={setSelectedRegion}
                data={regions.map(region => ({ value: region, label: region }))}
                clearable
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="Направление"
                placeholder="Выберите направление"
                value={selectedMajor}
                onChange={setSelectedMajor}
                data={majors.map(major => ({ value: major, label: major }))}
                clearable
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <NumberInput
                label="Минимальный IELTS"
                placeholder="6.0"
                value={minIelts}
                onChange={setMinIelts}
                min={0}
                max={9}
                step={0.5}
                decimalScale={1}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <NumberInput
                label="Максимальная стоимость (€)"
                placeholder="5000"
                value={maxTuition}
                onChange={setMaxTuition}
                min={0}
                step={100}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Checkbox
                label="Есть стипендии"
                checked={hasScholarships}
                onChange={(e) => setHasScholarships(e.currentTarget.checked)}
                mt="xl"
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Button
                fullWidth
                leftSection={<IconFilter size={16} />}
                onClick={handleSearch}
                loading={loading.universities}
                mt="xl"
              >
                Поиск
              </Button>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Список университетов */}
        <Grid>
          {universities.map((university, index) => (
            <Grid.Col key={university.id} span={{ base: 12, md: 6, lg: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card shadow="sm" padding="lg" radius="md" style={{ height: '100%' }}>
                  <Group justify="space-between" mb="md">
                    <Text size="lg" fw={600} lineClamp={2}>
                      {university.name}
                    </Text>
                    <ActionIcon
                      variant="subtle"
                      color={favorites.has(university.id) ? 'red' : 'gray'}
                      onClick={() => toggleFavorite(university.id)}
                    >
                      {favorites.has(university.id) ? (
                        <IconHeartFilled size={16} />
                      ) : (
                        <IconHeart size={16} />
                      )}
                    </ActionIcon>
                  </Group>
                  
                  <Group mb="md">
                    <IconMapPin size={16} color="var(--mantine-color-gray-6)" />
                    <Text size="sm" c="dimmed">
                      {university.city}, {university.region}
                    </Text>
                  </Group>
                  
                  {university.ranking_world && (
                    <Group mb="md">
                      <IconStar size={16} color="var(--mantine-color-yellow-6)" />
                      <Badge 
                        color={getRankingColor(university.ranking_world)}
                        variant="light"
                      >
                        #{university.ranking_world} в мире
                      </Badge>
                    </Group>
                  )}
                  
                  <Stack gap="sm" mb="md">
                    {university.tuition_fee_non_eu && (
                      <Group>
                        <IconCurrencyEuro size={16} color="var(--mantine-color-green-6)" />
                        <Text size="sm">
                          {university.tuition_fee_non_eu.toLocaleString()} €/год
                        </Text>
                      </Group>
                    )}
                    
                    {university.living_cost_monthly && (
                      <Group>
                        <IconUsers size={16} color="var(--mantine-color-blue-6)" />
                        <Text size="sm">
                          {university.living_cost_monthly} €/месяц проживание
                        </Text>
                      </Group>
                    )}
                    
                    {university.application_deadline && (
                      <Group>
                        <IconCalendar size={16} color="var(--mantine-color-red-6)" />
                        <Text size="sm">
                          Дедлайн: {new Date(university.application_deadline).toLocaleDateString('ru-RU')}
                        </Text>
                      </Group>
                    )}
                  </Stack>
                  
                  {university.has_scholarships && (
                    <Badge color="green" variant="light" mb="md">
                      Есть стипендии
                    </Badge>
                  )}
                  
                  <Group justify="space-between">
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => {
                        setSelectedUniversity(university);
                        setApplicationModalOpen(true);
                      }}
                    >
                      Подать заявку
                    </Button>
                    
                    {university.website && (
                      <Button
                        variant="subtle"
                        size="sm"
                        leftSection={<IconExternalLink size={16} />}
                        component="a"
                        href={university.website}
                        target="_blank"
                      >
                        Сайт
                      </Button>
                    )}
                  </Group>
                </Card>
              </motion.div>
            </Grid.Col>
          ))}
        </Grid>

        {/* Пагинация */}
        {universities.length > 0 && (
          <Group justify="center" mt="xl">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={Math.ceil(universities.length / 12)}
            />
          </Group>
        )}

        {/* Модал подачи заявки */}
        <Modal
          opened={applicationModalOpen}
          onClose={() => setApplicationModalOpen(false)}
          title="Подача заявки"
          size="md"
        >
          {selectedUniversity && (
            <Stack>
              <Text>
                Вы хотите подать заявку в {selectedUniversity.name}?
              </Text>
              
              <Select
                label="Выберите направление"
                placeholder="Выберите направление"
                data={majors.map(major => ({ value: major, label: major }))}
                required
              />
              
              <Textarea
                label="Дополнительная информация"
                placeholder="Расскажите о себе и мотивации"
                rows={4}
              />
              
              <Group justify="flex-end">
                <Button
                  variant="subtle"
                  onClick={() => setApplicationModalOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  onClick={() => handleApply(selectedUniversity.id, 1)}
                  loading={loading.applications}
                >
                  Подать заявку
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>
      </motion.div>
    </Box>
  );
};

export default UniversitiesSection;
