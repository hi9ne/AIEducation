import React, { useState } from 'react';
import { Box, ScrollArea, Text, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import LeftNavigation from './LeftNavigation';
import CentralContent from './CentralContent';
import RightPanel from './RightPanel';
import { useDashboardStore } from '../../store/dashboardStore';
import './Dashboard.css';
import './RightPanelFix.css';
import './ForcedPanel.css';

const DashboardLayout = () => {
  const [activeSection, setActiveSection] = useState('main');
  const [opened, { toggle }] = useDisclosure(false);
  const { currentProgress, overallProgress } = useDashboardStore();
  const [showMobileRightPanel, setShowMobileRightPanel] = useState(false);

  return (
    <Box style={{ minHeight: '100vh', width: '100%', overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', width: '100%' }}>
        {/* Левая панель навигации */}
        <div style={{ flex: '0 0 20%', maxWidth: '250px', borderRight: '1px solid var(--mantine-color-gray-3)', backgroundColor: 'var(--mantine-color-gray-0)', minHeight: '100vh' }}>
          <LeftNavigation 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            isOpened={opened}
            onToggle={toggle}
          />
          {/* Mobile toggle for right panel */}
          <div style={{ 
            display: 'block', 
            margin: '10px', 
            padding: '10px', 
            backgroundColor: 'blue', 
            color: 'white',
            textAlign: 'center',
            borderRadius: '5px',
            cursor: 'pointer'
          }} onClick={() => setShowMobileRightPanel(!showMobileRightPanel)}>
            {showMobileRightPanel ? 'Скрыть панель ИИ' : 'Показать панель ИИ'}
          </div>
        </div>

        {/* Центральная зона контента */}
        <div style={{ flex: '1 1 auto', borderRight: '1px solid var(--mantine-color-gray-3)', backgroundColor: 'var(--mantine-color-gray-0)', minHeight: '100vh', overflow: 'auto' }}>
          <ScrollArea style={{ height: '100%' }}>
            <CentralContent 
              activeSection={activeSection}
              overallProgress={overallProgress}
              currentProgress={currentProgress}
            />
          </ScrollArea>
        </div>

        {/* Правая панель AI и дедлайнов - Desktop */}
        <div className="right-panel-container desktop-panel" style={{ 
          flex: '0 0 25%', 
          maxWidth: '300px', 
          backgroundColor: 'white', 
          minHeight: '100vh', 
          overflow: 'auto', 
          border: '1px solid var(--mantine-color-gray-3)',
          position: 'relative',
          zIndex: 1000,
          display: 'block'
        }}>
          <RightPanel 
            activeSection={activeSection}
            currentProgress={currentProgress}
          />
        </div>
        
        {/* Mobile right panel that appears when toggled */}
        {showMobileRightPanel && (
          <div style={{
            position: 'fixed',
            top: '0',
            right: '0',
            width: '300px',
            height: '100vh',
            backgroundColor: 'white',
            zIndex: 2000,
            boxShadow: '-5px 0 15px rgba(0,0,0,0.2)',
            border: '1px solid var(--mantine-color-gray-3)',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '10px'
            }}>
              <div 
                style={{
                  cursor: 'pointer',
                  padding: '5px 10px',
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '5px'
                }}
                onClick={() => setShowMobileRightPanel(false)}
              >
                Закрыть
              </div>
            </div>
            <RightPanel 
              activeSection={activeSection}
              currentProgress={currentProgress}
            />
          </div>
        )}
        
        {/* Floating action button for mobile */}
        <div 
          id="right-panel-mobile-button"
          onClick={() => setShowMobileRightPanel(!showMobileRightPanel)}
        >
          AI
        </div>
      </div>
    </Box>
  );
};

export default DashboardLayout;
