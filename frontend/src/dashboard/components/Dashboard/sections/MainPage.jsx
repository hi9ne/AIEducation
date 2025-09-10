import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../../../store/educationSlice';
import { useAuth } from '../../../../shared/hooks/useAuth';
import {
  Box,
  Grid,
  Card,
  Text,
  Group,
  Badge,
  Button,
  Stack,
  
  Skeleton,
  Alert,
} from '@mantine/core';
 
import CircularProgress from '../../../../shared/components/Animations/CircularProgress';

const ProgressSection = ({ user }) => {
  const calculateStatusText = (progress) => {
    if (progress === 100) return "Completed";
    if (progress > 0) return "In progress";
    return "Not started";
  };

  // Вычисляем общий прогресс на основе заполненности профиля
  const calculateOverallProgress = () => {
    if (!user || !user.profile) return 0;
    
    const fields = [
      user.phone,
      user.country,
      user.city,
      user.profile.education_background,
      user.profile.interests?.length > 0,
      user.profile.goals?.length > 0,
      Object.keys(user.profile.language_levels || {}).length > 0,
      user.profile.preferred_countries?.length > 0,
      user.profile.budget_range,
      user.profile.study_duration
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const overallProgress = calculateOverallProgress();

  return (
    <Card withBorder p="lg" radius="md">
      <Stack spacing="md">
        <Group position="apart">
          <Text size="xl" weight={500}>Профиль</Text>
          <Badge color="green">
            {calculateStatusText(overallProgress)}
          </Badge>
        </Group>

        <Group position="center" p="md">
          <CircularProgress 
            value={overallProgress} 
            size={140}
            strokeWidth={12}
            color="#37B34A"
          />
        </Group>

        <Box>
          <Text size="md" weight={500} mb="md">Статус заполнения</Text>
          <Stack spacing="xs">
            <Group position="apart">
              <Text size="sm">Личные данные</Text>
              <Badge color={user?.phone && user?.country && user?.city ? "green" : "gray"}>
                {user?.phone && user?.country && user?.city ? "Заполнено" : "Не заполнено"}
              </Badge>
            </Group>
            <Group position="apart">
              <Text size="sm">Образование</Text>
              <Badge color={user?.profile?.education_background ? "green" : "gray"}>
                {user?.profile?.education_background ? "Заполнено" : "Не заполнено"}
              </Badge>
            </Group>
            <Group position="apart">
              <Text size="sm">Интересы и цели</Text>
              <Badge color={user?.profile?.interests?.length > 0 && user?.profile?.goals?.length > 0 ? "green" : "gray"}>
                {user?.profile?.interests?.length > 0 && user?.profile?.goals?.length > 0 ? "Заполнено" : "Не заполнено"}
              </Badge>
            </Group>
            <Group position="apart">
              <Text size="sm">Языковые навыки</Text>
              <Badge color={Object.keys(user?.profile?.language_levels || {}).length > 0 ? "green" : "gray"}>
                {Object.keys(user?.profile?.language_levels || {}).length > 0 ? "Заполнено" : "Не заполнено"}
              </Badge>
            </Group>
            <Group position="apart">
              <Text size="sm">Предпочтения</Text>
              <Badge color={user?.profile?.preferred_countries?.length > 0 && user?.profile?.budget_range && user?.profile?.study_duration ? "green" : "gray"}>
                {user?.profile?.preferred_countries?.length > 0 && user?.profile?.budget_range && user?.profile?.study_duration ? "Заполнено" : "Не заполнено"}
              </Badge>
            </Group>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
};

const MainPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();
  const hasFetchedRef = useRef(false);
  
  const loading = useSelector((state) => state.education.loading);
  const error = useSelector((state) => state.education.error);
  // Debug information
  console.log('MainPage - isAuthenticated:', isAuthenticated);
  console.log('MainPage - user:', user);

  useEffect(() => {
    if (isAuthenticated && !hasFetchedRef.current) {
      console.log('MainPage useEffect - isAuthenticated:', isAuthenticated);
      console.log('Dispatching fetchDashboardStats (once)');
      hasFetchedRef.current = true;
      dispatch(fetchDashboardStats());
    }
  }, [dispatch, isAuthenticated]);


  // Show loading state
  if (loading.dashboardStats && !user) {
    return (
      <Box>
        <Grid>
          {[1, 2, 3, 4].map((i) => (
            <Grid.Col key={i} span={{ base: 12, md: 6, lg: 3 }}>
              <Skeleton height={120} />
            </Grid.Col>
          ))}
        </Grid>
      </Box>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <Alert color="red" title="Error" mb="xl" radius="md">
        {error}
        </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Group mb="xl">
        <Text size="xl" fw={800} style={{
          background: 'linear-gradient(90deg, #1e3a8a 0%, #0ea5e9 50%, #14b8a6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>Добро пожаловать, {user?.first_name || 'Пользователь'}!</Text>
      </Group>

      {/* Only overall progress section */}
      <Grid>
        <Grid.Col span={12}>
          <ProgressSection user={user} />
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default MainPage;
