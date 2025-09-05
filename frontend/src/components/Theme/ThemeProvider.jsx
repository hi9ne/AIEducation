import React, { createContext, useContext, useState, useEffect } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';

// Создаем кастомную тему
const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontFamilyMonospace: 'Monaco, Courier, monospace',
  headings: { fontFamily: 'Inter, system-ui, sans-serif' },
  defaultRadius: 'md',
  colors: {
    brand: [
      '#e7f5ff',
      '#d0ebff',
      '#a5d8ff',
      '#74c0fc',
      '#4dabf7',
      '#339af0',
      '#228be6',
      '#1c7ed6',
      '#1971c2',
      '#1864ab'
    ]
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'md',
      },
    },
    Progress: {
      defaultProps: {
        radius: 'md',
      },
    },
    Notification: {
      defaultProps: {
        radius: 'md',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});

// Контекст для темы
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const ThemeProvider = ({ children }) => {
  const [colorScheme, setColorScheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('blue');
  const [fontSize, setFontSize] = useState('md');
  const [animations, setAnimations] = useState(true);

  // Загружаем настройки из localStorage
  useEffect(() => {
    const savedColorScheme = localStorage.getItem('colorScheme') || 'light';
    const savedPrimaryColor = localStorage.getItem('primaryColor') || 'blue';
    const savedFontSize = localStorage.getItem('fontSize') || 'md';
    const savedAnimations = localStorage.getItem('animations') !== 'false';

    setColorScheme(savedColorScheme);
    setPrimaryColor(savedPrimaryColor);
    setFontSize(savedFontSize);
    setAnimations(savedAnimations);
  }, []);

  // Сохраняем настройки в localStorage
  const updateColorScheme = (scheme) => {
    setColorScheme(scheme);
    localStorage.setItem('colorScheme', scheme);
  };

  const updatePrimaryColor = (color) => {
    setPrimaryColor(color);
    localStorage.setItem('primaryColor', color);
  };

  const updateFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
  };

  const updateAnimations = (enabled) => {
    setAnimations(enabled);
    localStorage.setItem('animations', enabled);
  };

  const toggleColorScheme = () => {
    updateColorScheme(colorScheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    colorScheme,
    primaryColor,
    fontSize,
    animations,
    updateColorScheme,
    updatePrimaryColor,
    updateFontSize,
    updateAnimations,
    toggleColorScheme
  };

  return (
    <ThemeContext.Provider value={value}>
      <MantineProvider
        theme={{
          ...theme,
          primaryColor,
          fontSizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem'
          }
        }}
        forceColorScheme={colorScheme}
      >
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
