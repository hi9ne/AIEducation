import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import LazyImage from '../components/Performance/LazyImage';
import { useLazyLoad, useDebounce } from '../hooks/usePerformance';
import {
  Box,
  Container,
  Text,
  Button,
  Group,
  Stack,
  Card,
  Badge,
  Avatar,
  Grid,
  ThemeIcon,
  ActionIcon,
  Paper,
  Divider,
  Center,
  Overlay,
  BackgroundImage,
  Title,
  Anchor
} from '@mantine/core';
import {
  IconArrowRight,
  IconStar,
  IconUsers,
  IconTrophy,
  IconBook,
  IconSchool,
  IconMapPin,
  IconClock,
  IconCheck,
  IconPlayerPlay,
  IconQuote,
  IconMail,
  IconPhone,
  IconChevronDown,
  IconRocket,
  IconTarget,
  IconHeart,
  IconShield,
  IconAward
} from '@tabler/icons-react';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(false);

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { icon: IconUsers, value: '1000+', label: 'Студентов' },
    { icon: IconTrophy, value: '95%', label: 'Успешных поступлений' },
    { icon: IconBook, value: '50+', label: 'Университетов' },
    { icon: IconAward, value: '15+', label: 'Лет опыта' }
  ];

  const features = [
    {
      icon: IconRocket,
      title: 'Быстрое поступление',
      description: 'Помогаем поступить в итальянские университеты за 2-4 месяца',
      color: 'blue'
    },
    {
      icon: IconTarget,
      title: 'Персональный подход',
      description: 'Индивидуальная стратегия для каждого студента',
      color: 'green'
    },
    {
      icon: IconShield,
      title: 'Гарантия качества',
      description: '95% наших студентов успешно поступают в выбранные вузы',
      color: 'purple'
    },
    {
      icon: IconHeart,
      title: 'Поддержка 24/7',
      description: 'Круглосуточная помощь на всех этапах поступления',
      color: 'red'
    }
  ];

  const universities = [
    {
      name: 'Università di Bologna',
      location: 'Болонья',
      rating: 4.8,
      students: '85,000+',
      founded: '1088',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop'
    },
    {
      name: 'Università di Milano',
      location: 'Милан',
      rating: 4.7,
      students: '60,000+',
      founded: '1924',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=300&fit=crop'
    },
    {
      name: 'Università di Roma',
      location: 'Рим',
      rating: 4.6,
      students: '110,000+',
      founded: '1303',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'
    },
    {
      name: 'Università di Firenze',
      location: 'Флоренция',
      rating: 4.5,
      students: '50,000+',
      founded: '1321',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400&h=300&fit=crop'
    }
  ];

  const testimonials = [
    {
      name: 'Анна Петрова',
      university: 'Università di Bologna',
      faculty: 'Экономика',
      text: 'Благодаря AI Education я поступила в один из лучших университетов Италии. Процесс был простым и понятным!',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      rating: 5
    },
    {
      name: 'Михаил Козлов',
      university: 'Università di Milano',
      faculty: 'IT-технологии',
      text: 'Отличная поддержка на всех этапах. Помогли с документами, подготовкой к экзаменам и визой.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      rating: 5
    },
    {
      name: 'Елена Смирнова',
      university: 'Università di Roma',
      faculty: 'Психология',
      text: 'Профессиональный подход и индивидуальное внимание. Рекомендую всем, кто мечтает учиться в Италии!',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      rating: 5
    }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box className="home-page">
      {/* Hero Section */}
      <Box className="hero-section">
        <BackgroundImage
          src="/images/bg-hero.jpg"
          className="hero-background"
        >
          <Overlay gradient="linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)" />
          <Container size="xl" className="hero-container">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ y: y1, opacity }}
            >
              <Stack align="center" spacing="xl" className="hero-content">
                <Badge size="lg" variant="gradient" gradient={{ from: 'blue', to: 'purple' }}>
                  🎓 Образование в Италии
                </Badge>
                
                <Title
                  order={1}
                  size="4rem"
                  weight={800}
                  align="center"
                  className="hero-title"
                >
                  Получите высшее образование в{' '}
                  <Text
                    component="span"
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'purple' }}
                    inherit
                  >
                    Италии
                  </Text>
                </Title>

                <Text size="xl" align="center" className="hero-subtitle">
                  Помогаем поступить в престижные итальянские университеты с гарантией успеха
                </Text>

                <Group spacing="md" className="hero-buttons">
                  <Button
                    size="xl"
                    rightIcon={<IconArrowRight size={20} />}
                    onClick={() => navigate('/register')}
                    className="cta-button"
                  >
                    Начать поступление
                  </Button>
                  <Button
                    size="xl"
                    variant="outline"
                    leftIcon={<IconPlayerPlay size={20} />}
                    className="secondary-button"
                  >
                    Смотреть видео
                  </Button>
                </Group>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="scroll-indicator"
                >
                  <ActionIcon
                    size="lg"
                    variant="light"
                    onClick={() => scrollToSection('stats')}
                  >
                    <IconChevronDown size={24} />
                  </ActionIcon>
                </motion.div>
              </Stack>
            </motion.div>
          </Container>
        </BackgroundImage>
      </Box>

      {/* Stats Section */}
      <Box id="stats" className="stats-section">
        <Container size="xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Grid gutter="xl">
              {stats.map((stat, index) => (
                <Grid.Col span={6} md={3} key={index}>
                  <Card className="stat-card" padding="xl">
                    <Stack align="center" spacing="md">
                      <ThemeIcon size={60} variant="gradient" gradient={{ from: 'blue', to: 'purple' }}>
                        <stat.icon size={30} />
                      </ThemeIcon>
                      <Text size="2.5rem" weight={800} className="stat-value">
                        {stat.value}
                      </Text>
                      <Text size="lg" weight={500} className="stat-label">
                        {stat.label}
                      </Text>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Box className="features-section">
        <Container size="xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Stack align="center" spacing="xl">
              <Box className="section-header">
                <Text size="sm" weight={600} color="dimmed" className="section-badge">
                  Почему выбирают нас
                </Text>
                <Title order={2} size="3rem" align="center" className="section-title">
                  Мы делаем поступление{' '}
                  <Text
                    component="span"
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'purple' }}
                    inherit
                  >
                    простым
                  </Text>
                </Title>
                <Text size="lg" align="center" color="dimmed" className="section-subtitle">
                  Полный спектр услуг для успешного поступления в итальянские университеты
                </Text>
              </Box>

              <Grid gutter="xl">
                {features.map((feature, index) => (
                  <Grid.Col span={12} md={6} lg={3} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Card className="feature-card" padding="xl" h="100%">
                        <Stack align="center" spacing="md">
                          <ThemeIcon size={60} color={feature.color} variant="light">
                            <feature.icon size={30} />
                          </ThemeIcon>
                          <Text size="xl" weight={600} align="center">
                            {feature.title}
                          </Text>
                          <Text size="md" align="center" color="dimmed">
                            {feature.description}
                          </Text>
                        </Stack>
                      </Card>
                    </motion.div>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* Universities Section */}
      <Box className="universities-section">
        <Container size="xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Stack align="center" spacing="xl">
              <Box className="section-header">
                <Text size="sm" weight={600} color="dimmed" className="section-badge">
                  Наши партнеры
                </Text>
                <Title order={2} size="3rem" align="center" className="section-title">
                  Лучшие университеты{' '}
                  <Text
                    component="span"
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'purple' }}
                    inherit
                  >
                    Италии
                  </Text>
                </Title>
              </Box>

              <Grid gutter="xl">
                {universities.map((university, index) => (
                  <Grid.Col span={12} md={6} lg={3} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Card className="university-card" padding={0} h="100%">
                        <Box className="university-image">
                          <LazyImage
                            src={university.image}
                            alt={university.name}
                            width="100%"
                            height={200}
                            placeholder="/images/placeholder-university.jpg"
                          />
                          <Overlay gradient="linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)" />
                          <Group position="apart" className="university-overlay">
                            <Badge color="blue" variant="filled">
                              <Group spacing="xs">
                                <IconStar size={12} />
                                {university.rating}
                              </Group>
                            </Badge>
                            <Badge color="green" variant="filled">
                              {university.students}
                            </Badge>
                          </Group>
                        </Box>
                        <Box p="xl">
                          <Stack spacing="sm">
                            <Text size="lg" weight={600}>
                              {university.name}
                            </Text>
                            <Group spacing="xs">
                              <IconMapPin size={16} color="dimmed" />
                              <Text size="sm" color="dimmed">
                                {university.location}
                              </Text>
                            </Group>
                            <Group spacing="xs">
                              <IconClock size={16} color="dimmed" />
                              <Text size="sm" color="dimmed">
                                Основан в {university.founded}
                              </Text>
                            </Group>
                          </Stack>
                        </Box>
                      </Card>
                    </motion.div>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box className="testimonials-section">
        <Container size="xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Stack align="center" spacing="xl">
              <Box className="section-header">
                <Text size="sm" weight={600} color="dimmed" className="section-badge">
                  Отзывы студентов
                </Text>
                <Title order={2} size="3rem" align="center" className="section-title">
                  Что говорят наши{' '}
                  <Text
                    component="span"
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'purple' }}
                    inherit
                  >
                    студенты
                  </Text>
                </Title>
              </Box>

              <Grid gutter="xl">
                {testimonials.map((testimonial, index) => (
                  <Grid.Col span={12} md={4} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Card className="testimonial-card" padding="xl" h="100%">
                        <Stack spacing="md">
                          <Group spacing="xs">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <IconStar key={i} size={16} fill="currentColor" color="yellow" />
                            ))}
                          </Group>
                          <Text size="lg" className="testimonial-text">
                            <IconQuote size={20} className="quote-icon" />
                            {testimonial.text}
                          </Text>
                          <Divider />
                          <Group spacing="md">
                            <LazyImage
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              width={40}
                              height={40}
                              className="testimonial-avatar"
                              placeholder="/images/placeholder-avatar.jpg"
                            />
                            <Box>
                              <Text weight={600}>{testimonial.name}</Text>
                              <Text size="sm" color="dimmed">{testimonial.university}</Text>
                              <Text size="sm" color="dimmed">{testimonial.faculty}</Text>
                            </Box>
                          </Group>
                        </Stack>
                      </Card>
                    </motion.div>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box className="cta-section">
        <Container size="xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="cta-card" padding="xl">
              <Stack align="center" spacing="xl">
                <Title order={2} size="2.5rem" align="center">
                  Готовы начать путь к образованию в Италии?
                </Title>
                <Text size="lg" align="center" color="dimmed">
                  Присоединяйтесь к тысячам студентов, которые уже получили образование в лучших университетах Италии
                </Text>
                <Group spacing="md">
                  <Button
                    size="xl"
                    rightIcon={<IconArrowRight size={20} />}
                    onClick={() => navigate('/register')}
                    className="cta-button"
                  >
                    Подать заявку
                  </Button>
                  <Button
                    size="xl"
                    variant="outline"
                    leftIcon={<IconPhone size={20} />}
                    className="secondary-button"
                  >
                    Консультация
                  </Button>
                </Group>
              </Stack>
            </Card>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box className="footer">
        <Container size="xl">
          <Grid gutter="xl">
            <Grid.Col span={12} md={4}>
              <Stack spacing="md">
                <Group spacing="md">
                  <img src="/images/iedulogo.png" alt="AI Education" width={40} height={40} />
                  <Text size="xl" weight={700}>
                    AI Education
                  </Text>
                </Group>
                <Text color="dimmed">
                  Помогаем получить высшее образование в лучших университетах Италии
                </Text>
                <Group spacing="md">
                  <ActionIcon size="lg" variant="light">
                    <IconMail size={20} />
                  </ActionIcon>
                  <ActionIcon size="lg" variant="light">
                    <IconPhone size={20} />
                  </ActionIcon>
                  <ActionIcon size="lg" variant="light">
                    <IconMail size={20} />
                  </ActionIcon>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={12} md={2}>
              <Stack spacing="md">
                <Text weight={600}>Услуги</Text>
                <Anchor href="#" color="dimmed">Поступление</Anchor>
                <Anchor href="#" color="dimmed">Консультации</Anchor>
                <Anchor href="#" color="dimmed">Подготовка</Anchor>
                <Anchor href="#" color="dimmed">Визы</Anchor>
              </Stack>
            </Grid.Col>
            <Grid.Col span={12} md={2}>
              <Stack spacing="md">
                <Text weight={600}>Университеты</Text>
                <Anchor href="#" color="dimmed">Болонья</Anchor>
                <Anchor href="#" color="dimmed">Милан</Anchor>
                <Anchor href="#" color="dimmed">Рим</Anchor>
                <Anchor href="#" color="dimmed">Флоренция</Anchor>
              </Stack>
            </Grid.Col>
            <Grid.Col span={12} md={2}>
              <Stack spacing="md">
                <Text weight={600}>Поддержка</Text>
                <Anchor href="#" color="dimmed">Помощь</Anchor>
                <Anchor href="#" color="dimmed">FAQ</Anchor>
                <Anchor href="#" color="dimmed">Контакты</Anchor>
                <Anchor href="#" color="dimmed">О нас</Anchor>
              </Stack>
            </Grid.Col>
            <Grid.Col span={12} md={2}>
              <Stack spacing="md">
                <Text weight={600}>Контакты</Text>
                <Group spacing="xs">
                  <IconPhone size={16} />
                  <Text size="sm" color="dimmed">+7 (999) 123-45-67</Text>
                </Group>
                <Group spacing="xs">
                  <IconMail size={16} />
                  <Text size="sm" color="dimmed">info@aieducation.ru</Text>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
          <Divider my="xl" />
          <Group position="apart">
            <Text color="dimmed">© 2024 AI Education. Все права защищены.</Text>
            <Group spacing="md">
              <Anchor href="#" color="dimmed" size="sm">Политика конфиденциальности</Anchor>
              <Anchor href="#" color="dimmed" size="sm">Условия использования</Anchor>
            </Group>
          </Group>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
