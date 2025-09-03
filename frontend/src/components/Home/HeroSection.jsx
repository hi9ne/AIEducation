import React from "react";
import "./HeroSection.css";

const HeroSection = () => (
  <section className="hero-section">
    <div className="hero-content">
      <div className="hero-left">
        <div className="hero-label">ПОЛУЧИТЕ ВЫСШЕЕ ОБРАЗОВАНИЕ, ВОСТРЕБОВАННОЕ ПО ВСЕМУ МИРУ</div>
        <h1 className="hero-title">ОБУЧЕНИЕ<br/>ЗА РУБЕЖОМ</h1>
        <div className="hero-desc">Мы готовим студентов к успеху в учебе, карьере и жизни. Образование — ваша дорога в будущее! Так пройдите же вместе с нами!</div>
        <a className="hero-phone" href="tel:88007000000">8 800 700-00-00</a>
      </div>
      <div className="hero-right">
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-number">800+</div>
            <div className="hero-stat-label">ПОСТУПИВШИХ<br/>СТУДЕНТОВ</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-number">200+</div>
            <div className="hero-stat-label">УНИВЕРСИТЕТОВ НА ВЫБОР</div>
          </div>
        </div>
        <div className="hero-years">
          <div className="hero-years-number">25</div>
          <div className="hero-years-label">ЛЕТ БЕЗУПРЕЧНОЙ РЕПУТАЦИИ</div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
