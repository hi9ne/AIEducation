import React from 'react';
import './SectionShared.css';

const data = [
  {
    name: 'Вадим Н.',
    text: 'Сервис снял всю головную боль. Подал документы в два вуза без стресса и выиграл грант.'
  },
  {
    name: 'Евгения О.',
    text: 'Понятные шаги, поддержка и проверка документов — поступила в Милан.'
  },
  {
    name: 'Андрей С.',
    text: 'От выбора программы до визы — всё в одном месте, очень удобно.'
  }
];

const TestimonialsSimple = () => (
  <section id="reviews" className="section section--alt">
    <div className="section__container">
      <header className="section__header">
        <h2 className="section__title">Отзывы студентов</h2>
        <p className="section__subtitle">Реальные истории поступления</p>
      </header>
      <div className="grid grid--3">
        {data.map((r, idx) => (
          <div key={idx} className="card">
            <div className="quote">“</div>
            <div className="card__desc">{r.text}</div>
            <div className="card__title" style={{marginTop:12}}>{r.name}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSimple;
