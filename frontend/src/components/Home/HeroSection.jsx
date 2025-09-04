import React from "react";
import "./HeroSection.css";
import italy_flag from '../../../public/images/italy-flag.png';


const HeroSection = () => (
  <div className="parallax">
    <div className="mask"></div>
    <div className="hero-container">
      <div className="hero-label">
        <h2>
          <span className="highlight_one">GET</span> HIGHER EDUCATION <br /> IN<span className="highlight"> ITALY</span>
          <img src={italy_flag} alt="Italy Flag" className="italy_flag" />
        </h2>
      </div>
    </div>
  </div>
);

export default HeroSection;
