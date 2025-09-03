import React from "react";
import "./EducationVariants.css";

const variants = [
  {
    title: "ОЧНОЕ ОБУЧЕНИЕ",
    number: "01",
    img: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "ЗАОЧНОЕ ОБУЧЕНИЕ",
    number: "02",
    img: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "ДИСТАНЦИОННОЕ ОБУЧЕНИЕ",
    number: "03",
    img: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
  },
];

const EducationVariants = () => (
  <section className="education-variants-section">
    <h2 className="education-variants-title">ВЫБЕРИТЕ СВОЙ ВАРИАНТ ОБУЧЕНИЯ</h2>
    <div className="education-variants-list">
      {variants.map((v, i) => (
        <div className="education-variant-card" key={i}>
          <div className="education-variant-img-wrap">
            <img src={v.img} alt={v.title} className="education-variant-img" />
          </div>
          <div className="education-variant-info">
            <div className="education-variant-type">{v.title}</div>
            <div className="education-variant-number">{v.number}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default EducationVariants;
