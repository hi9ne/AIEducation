import React from "react";
import "./ReviewsSection.css";

const reviews = [
  {
    name: "ВАДИМ НЕМКОВ",
    faculty: "Факультет: Журналистика",
    text: "Сайт просто супер. Ребята молодцы, делают свою работу на высоком уровне. Товары всегда новые, цены вполне доступные. Часто провожу акции, акции, что особо радует :) Буду рекомендовать всем друзьям и близким.",
    img: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    name: "ЕВГЕНИЯ ОРЛОВА",
    faculty: "Факультет: Педагогика",
    text: "Сайт просто супер. Ребята молодцы, делают свою работу на высоком уровне. Товары всегда новые, цены вполне доступные. Часто провожу акции, акции, что особо радует :) Буду рекомендовать всем друзьям и близким.",
    img: "https://randomuser.me/api/portraits/women/44.jpg"
  }
];

const ReviewsSection = () => (
  <section className="reviews-section">
    <h2 className="reviews-title">ЧТО О НАС ГОВОРЯТ НАШИ КЛИЕНТЫ</h2>
    <div className="reviews-list">
      {reviews.map((r, i) => (
        <div className="review-card" key={i}>
          <div className="review-card-img-wrap">
            <img src={r.img} alt={r.name} className="review-card-img" />
          </div>
          <div className="review-card-content">
            <div className="review-card-text">{r.text}</div>
            <div className="review-card-name">{r.name}</div>
            <div className="review-card-faculty">{r.faculty}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default ReviewsSection;
