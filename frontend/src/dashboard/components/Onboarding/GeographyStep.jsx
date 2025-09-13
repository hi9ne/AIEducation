import React, { useEffect, useState, useRef } from 'react';
import { Card, Group, ThemeIcon, Text, Title, Select, Stack } from '@mantine/core';
import { IconMap } from '@tabler/icons-react';
import ItalyMap from './ItalyMap';
import { API_BASE_URL } from '../../../shared/services/api';

const GeographyStep = ({ value, onChange, error }) => {
  const [selectedCity, setSelectedCity] = useState(value?.city || '');
  const [selectedUniversity, setSelectedUniversity] = useState(value?.university || '');
  // Синхронизация локального состояния с value из props
  useEffect(() => {
    if (value?.city !== selectedCity) setSelectedCity(value?.city || '');
    if (value?.university !== selectedUniversity) setSelectedUniversity(value?.university || '');
    // eslint-disable-next-line
  }, [value?.city, value?.university]);
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    const fetchUnis = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/education/universities/?is_active=true`);
        const data = await res.json();
        const italianUnis = (Array.isArray(data) ? data : data.results || []).filter(u => u.country === 'Italy' || u.country === 'Италия');
        setUniversities(italianUnis);
      } catch {
        setUniversities([]);
      }
    };
    fetchUnis();
  }, []);

  // Вызываем onChange только если значения реально изменились
  const prev = useRef({ city: selectedCity, university: selectedUniversity });
  useEffect(() => {
    if (
      prev.current.city !== selectedCity ||
      prev.current.university !== selectedUniversity
    ) {
      prev.current = { city: selectedCity, university: selectedUniversity };
      onChange({ city: selectedCity, university: selectedUniversity });
    }
    // eslint-disable-next-line
  }, [selectedCity, selectedUniversity]);

  const cityUnis = universities.filter(u => u.city === selectedCity);

  return (
    <Stack spacing="md">
      <Title order={3}>Выберите город и университет в Италии</Title>
      <ItalyMap selectedCity={selectedCity} onSelectCity={setSelectedCity} />
      {selectedCity && (
        <Select
          label="Университет"
          placeholder="Выберите университет"
          data={cityUnis.map(u => ({ value: u.name, label: u.name }))}
          value={selectedUniversity}
          onChange={setSelectedUniversity}
          searchable
          clearable
          error={error}
          description={cityUnis.length === 0 ? 'В выбранном городе пока нет университетов' : undefined}
        />
      )}
      <Card withBorder p="md">
        <Group>
          <ThemeIcon variant="light"><IconMap size={16}/></ThemeIcon>
          <Text size="sm" c="dimmed">Выберите город на карте, затем университет из списка. Доступны только города Италии с вузами из базы.</Text>
        </Group>
      </Card>
    </Stack>
  );
};

export default GeographyStep;
