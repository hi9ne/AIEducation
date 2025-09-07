import React from 'react';
import { Box } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../../shared/components/Animations/PageTransition.jsx';
import MainPage from './sections/MainPage.jsx';
import IELTSSection from './sections/IELTSSection.jsx';
import TOLCSection from './sections/TOLCSection.jsx';
import UniversitiesSection from './sections/UniversitiesSection';
import UniversitalySection from './sections/UniversitalySection.jsx';
import CodiceSection from './sections/CodiceSection.jsx';
import DOVSection from './sections/DOVSection.jsx';
import VisaSection from './sections/VisaSection.jsx';
import SettingsSection from './sections/SettingsSection.jsx';

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
      case 'settings':
        return <SettingsSection progress={progress} />;
      default:
        return <MainPage />;
    }
  };

  return (
    <Box style={{ 
      height: '100%', 
      backgroundColor: 'var(--mantine-color-gray-0)',
      overflow: 'hidden'
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
          <PageTransition direction="right">
            {getSectionComponent()}
          </PageTransition>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default CentralContent;
