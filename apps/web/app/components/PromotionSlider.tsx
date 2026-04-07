"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { TrackedLink } from "./tracked-link";
import { Reveal } from "./reveal";

const PROMO_SLIDES = [
  {
    id: "welcome-pack",
    kicker: "ВІТАЛЬНИЙ ПАКЕТ",
    title: "500 000 ₴ + 700 ФС",
    body: "Розпочни гру з максимальним бонусом на перші сім депозитів.",
    image: "/slotcity/assets/promos/welcome_pack.png",
    color: "#FFD15A"
  },
  {
    id: "bonus-machine",
    kicker: "БОНУСНА МАШИНА",
    title: "ГРОШІ ТА ФРІСПІНИ",
    body: "Робіть депозити та забирайте гарантовані призи кожні 7 поповнень.",
    image: "/slotcity/assets/promos/bonus_machine.png",
    color: "#4ADE80"
  },
  {
    id: "wheel-of-fortune",
    kicker: "КОЛЕСО ФОРТУНИ",
    title: "БЕЗДЕП З ДЖЕКПОТОМ",
    body: "Крути колесо та вигравай реальні кошти або джекпот без вейджера.",
    image: "/slotcity/assets/promos/wheel_of_fortune.png",
    color: "#60A5FA"
  },
  {
    id: "city-vip",
    kicker: "CITY VIP",
    title: "ЕКСКЛЮЗИВНИЙ СЕРВІС",
    body: "Отримуй вищі кешбеки, персональні бонуси та пріоритетні виплати.",
    image: "/slotcity/assets/promos/city_vip.png",
    color: "#C084FC"
  }
];

export function PromotionSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % PROMO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  return (
    <div 
      className="slotcity-promo-slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className="slotcity-promo-track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {PROMO_SLIDES.map((slide) => (
          <div key={slide.id} className="slotcity-promo-slide">
            <TrackedLink
              href="/promotions"
              className="slotcity-promo-link"
              event="banner_clicked"
              payload={{
                bannerId: slide.id,
                properties: {
                  route: "home",
                  placement: "promo_slider",
                  title: slide.title
                }
              }}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority
                className="slotcity-promo-image"
              />
              <div className="slotcity-promo-overlay" />
              <div className="slotcity-promo-content">
                <Reveal delay={0.1}>
                  <span className="slotcity-promo-kicker" style={{ color: slide.color }}>
                    {slide.kicker}
                  </span>
                </Reveal>
                <Reveal delay={0.2}>
                  <h3 className="slotcity-promo-title">{slide.title}</h3>
                </Reveal>
                <Reveal delay={0.3}>
                  <p className="slotcity-promo-body">{slide.body}</p>
                </Reveal>
                <Reveal delay={0.4}>
                  <div className="slotcity-promo-cta">
                    ДЕТАЛЬНІШЕ
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Reveal>
              </div>
            </TrackedLink>
          </div>
        ))}
      </div>

      <div className="slotcity-promo-controls">
        {PROMO_SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`slotcity-promo-dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Slide ${index + 1}`}
          >
            {index === currentIndex && (
              <div className="slotcity-promo-progress" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
