import React, { useState, useEffect } from 'react';
import { Box, ScrollArea, Text, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile } from '../../../store/authSlice';
import LeftNavigation from './LeftNavigation';
import CentralContent from './CentralContent';
import RightPanel from './RightPanel';
import { useDashboardStore } from '../../../store/dashboardStore';
import './Dashboard.css';

const DashboardLayout = () => {
  const [activeSection, setActiveSection] = useState('main');
  const [opened, { toggle }] = useDisclosure(false);
  const { currentProgress, overallProgress, initFromBackend } = useDashboardStore();
  const [showMobileRightPanel, setShowMobileRightPanel] = useState(false);
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProfile());
  // Инициализация стора реальными данными
  initFromBackend?.();
  }, [dispatch]);

  return (
    <Box className="dashboard-layout" style={{
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
      background: 'linear-gradient(180deg, var(--app-color-bg) 0%, var(--app-color-surface) 40%, var(--app-color-bg) 100%)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', width: '100%' }}>
        {/* Левая панель навигации */}
        <div className="left-navigation" style={{
          flex: '0 0 20%',
          maxWidth: '250px',
          borderRight: '1px solid var(--mantine-color-gray-3)',
          backgroundColor: 'var(--app-color-surface)',
          minHeight: '100vh',
          boxShadow: 'var(--app-shadow-md)'
        }}>
          <LeftNavigation 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            isOpened={opened}
            onToggle={toggle}
            user={user}
          />
          {/* Кнопка показа панели ИИ удалена по требованию */}
        </div>

        {/* Центральная зона контента */}
        <div className="central-content" style={{
          flex: '1 1 auto',
          borderRight: '1px solid var(--mantine-color-gray-3)',
          backgroundColor: 'transparent',
          minHeight: '100vh',
          overflow: 'auto'
        }}>
          <ScrollArea style={{ height: '100%' }}>
            <CentralContent 
              activeSection={activeSection}
              overallProgress={overallProgress}
              currentProgress={currentProgress}
            />
          </ScrollArea>
        </div>

        {/* Правая панель AI и дедлайнов - Desktop */}
        <div className="right-panel right-panel-container desktop-panel" style={{ 
          flex: '0 0 25%', 
          maxWidth: '300px', 
          backgroundColor: 'var(--app-color-surface)', 
          minHeight: '100vh', 
          overflow: 'auto', 
          border: '1px solid var(--mantine-color-gray-3)',
          boxShadow: 'var(--app-shadow-md)',
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
  {/* Мобильная правая панель отключена */}
  {false && showMobileRightPanel && (
          <div style={{
            position: 'fixed',
            top: '0',
            right: '0',
            width: '300px',
            height: '100vh',
            backgroundColor: 'var(--app-color-surface)',
            zIndex: 2000,
            boxShadow: 'var(--app-shadow-lg)',
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
        
  {/* Floating mobile button removed per request */}
      </div>
    </Box>
  );
};

export default DashboardLayout;
