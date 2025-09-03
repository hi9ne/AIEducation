import React from "react";
import "./AboutCompany.css";

const AboutCompany = () => (
  <section className="about-company-section">
    <div className="about-company-content">
      <div className="about-company-left">
        <img src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80" alt="graduates" className="about-company-img" />
        <div className="about-company-years">
          <span className="about-company-years-number">25</span>
          <span className="about-company-years-label">ЛЕТ БЕЗУПРЕЧНОЙ РЕПУТАЦИИ</span>
        </div>
      </div>
      <div className="about-company-right">
        <h2 className="about-company-title">ПАРУ СЛОВ О НАС</h2>
        <div className="about-company-text">
          В этом блоке мы рекомендуем разместить информацию о Вашей организации, подчеркнуть её значимость и надёжность на рынке оказываемых услуг или предлагаемых товаров.
        </div>
        <div className="about-company-note">
          Примечание: Обратите внимание, что текстовая информация на сайте должна быть индивидуальной и не размещённой в других источниках в сети интернет, за исключением рекомендаций.
        </div>
      </div>
    </div>
    <div className="about-company-features">
      <div className="about-company-feature">
        <div className="about-company-feature-icon">🏆</div>
        <div className="about-company-feature-title">ОГРОМНЫЙ ВЫБОР</div>
        <div className="about-company-feature-desc">Примерное описание. Текст редактируется через систему управления сайтом.</div>
      </div>
      <div className="about-company-feature">
        <div className="about-company-feature-icon">🎓</div>
        <div className="about-company-feature-title">НАЛИЧИЕ ПРАКТИКИ</div>
        <div className="about-company-feature-desc">Примерное описание. Текст редактируется через систему управления сайтом.</div>
      </div>
    </div>
  </section>
);

export default AboutCompany;
