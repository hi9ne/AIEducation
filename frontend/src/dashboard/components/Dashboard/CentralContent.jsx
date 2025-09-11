import React from 'react';
import { Box } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../../shared/components/Animations/PageTransition.jsx';
const MainPage = React.lazy(() => import('./sections/MainPage.jsx'));
const IELTSSection = React.lazy(() => import('./sections/IELTSSection.jsx'));
const TOLCSection = React.lazy(() => import('./sections/TOLCSection.jsx'));
const UniversitiesSection = React.lazy(() => import('./sections/UniversitiesSection.jsx'));
const UniversitalySection = React.lazy(() => import('./sections/UniversitalySection.jsx'));
const CodiceSection = React.lazy(() => import('./sections/CodiceSection.jsx'));
const DOVSection = React.lazy(() => import('./sections/DOVSection.jsx'));
const VisaSection = React.lazy(() => import('./sections/VisaSection.jsx'));
const AIMentorSection = React.lazy(() => import('./sections/AIMentorSection.jsx'));
const SettingsSection = React.lazy(() => import('./sections/SettingsSection.jsx'));
const HelpSection = React.lazy(() => import('./sections/HelpSection.jsx'));
const NotificationsSection = React.lazy(() => import('./sections/NotificationsSection.jsx'));

const CentralContent = ({ activeSection, overallProgress, currentProgress }) => {
  const getSectionComponent = () => {
    const progress = { overallProgress, currentProgress };
    
    switch (activeSection) {
      case 'main':
        return <MainPage />;
      case 'ielts':
        return <IELTSSection progress={progress} />;
      case 'tolc':
        return <TOLCSection progress={progress} />;
      case 'universities':
        return <UniversitiesSection progress={progress} />;
      case 'universitaly':
        return <UniversitalySection progress={progress} />;
      case 'codice':
        return <CodiceSection progress={progress} />;
      case 'dov':
        return <DOVSection progress={progress} />;
      case 'visa':
        return <VisaSection progress={progress} />;
      case 'aimentor':
        return <AIMentorSection />;
      case 'settings':
        return <SettingsSection progress={progress} />;
      case 'help':
        return <HelpSection />;
      case 'notifications':
        return <NotificationsSection />;
      default:
        return <MainPage />;
    }
  };

  return (
    <Box style={{ 
      height: '100%', 
      background: 'transparent',
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: 'var(--app-spacing-md)'
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.3,
            ease: "easeInOut"
          }}
          style={{ height: '100%' }}
        >
          <React.Suspense fallback={<div />}> 
            <PageTransition direction="right">
              {getSectionComponent()}
            </PageTransition>
          </React.Suspense>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default CentralContent;
