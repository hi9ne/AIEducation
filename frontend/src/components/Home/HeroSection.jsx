import React from "react";
import "./HeroSection.css";
import italy_flag from '../../../public/images/italy-flag.png';


const HeroSection = () => (
  <div className="parallax">
    <div className="hero-container">
              <div className="hero-label">
                <h2>
                  <span className="highlight_one">Get</span> Higher Education <br /> in<span className="highlight"> Italy</span> <img className="italy_flag" src={italy_flag} alt="" />
                </h2>
              </div>
              {/* <h4 className="hero-title">ОБУЧЕНИЕ<br/>ЗА РУБЕЖОМ</h4>
              <div className="hero-desc">Мы готовим студентов к успеху в учебе, карьере и жизни. Образование — ваша дорога в будущее! AIEducation</div>
              <a className="hero-phone" href="tel:88007000000">0 770 172 008</a> */}
    </div>
      <div className="mask"></div>
  </div>
);

export default HeroSection;
