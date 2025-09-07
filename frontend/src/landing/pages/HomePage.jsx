import React from 'react';
import { Box } from '@mantine/core';
import HeroSection from '../components/Home/HeroSection';
import AboutCompany from '../components/Home/AboutCompany';
import EducationVariants from '../components/Home/EducationVariants';
import FacultyList from '../components/Home/FacultyList';
import ReviewsSection from '../components/Home/ReviewsSection';
import './HomePage.css';

const HomePage = () => {
  return (
    <Box className="home-page">
      <HeroSection />
      <AboutCompany />
      <EducationVariants />
      <FacultyList />
      <ReviewsSection />
    </Box>
  );
};

export default HomePage;
