import React, { useState } from 'react';
import { Box, Grid, Paper, ScrollArea, Container } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import LeftNavigation from './LeftNavigation';
import CentralContent from './CentralContent';
import RightPanel from './RightPanel';
import { useDashboardStore } from '../../store/dashboardStore';

const DashboardLayout = () => {
  const [activeSection, setActiveSection] = useState('main');
  const [opened, { toggle }] = useDisclosure(false);
  const { currentProgress, overallProgress } = useDashboardStore();

  return (
    <Box style={{ height: '100vh', width: '100%' }}>
      <Grid gutter={0} style={{ height: '100%' }}>
        {/* Левая панель навигации */}
        <Grid.Col span={{ base: 12, md: 3, lg: 2.5 }}>
          <Paper 
            style={{ 
              height: '100%', 
              borderRadius: 0,
              borderRight: '1px solid var(--mantine-color-gray-3)',
              backgroundColor: 'var(--mantine-color-gray-0)'
            }}
          >
            <LeftNavigation 
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              isOpened={opened}
              onToggle={toggle}
            />
          </Paper>
        </Grid.Col>

        {/* Центральная зона контента */}
        <Grid.Col span={{ base: 12, md: 6, lg: 7 }}>
          <Paper 
            style={{ 
              height: '100%', 
              borderRadius: 0,
              backgroundColor: 'var(--mantine-color-gray-0)'
            }}
          >
            <ScrollArea style={{ height: '100%' }}>
              <CentralContent 
                activeSection={activeSection}
                overallProgress={overallProgress}
                currentProgress={currentProgress}
              />
            </ScrollArea>
          </Paper>
        </Grid.Col>

        {/* Правая панель AI и дедлайнов */}
        <Grid.Col span={{ base: 12, md: 3, lg: 2.5 }}>
          <Paper 
            style={{ 
              height: '100%', 
              borderRadius: 0,
              borderLeft: '1px solid var(--mantine-color-gray-3)',
              backgroundColor: 'var(--mantine-color-gray-0)'
            }}
          >
            <RightPanel 
              activeSection={activeSection}
              currentProgress={currentProgress}
            />
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default DashboardLayout;
