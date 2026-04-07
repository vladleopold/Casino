"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import { TrackedLink } from "./tracked-link";

const HERO_SLIDES = [
  {
    id: "welcome-lucky-season",
    eyebrow: "Вітальний бонус",
    title: "500 000 ₴ + 700 ФС",
    body:
      "Бонус на перші депозити та швидкий старт для нових гравців у SlotCity.",
    image: "/slotcity/assets/promos/welcome-lucky-season-slider.webp",
    accent: "gold",
    primaryHref: "/bonuses",
    primaryLabel: "Отримати бонус",
    secondaryHref: "/promotions",
    secondaryLabel: "Деталі акції",
    chips: ["Новим гравцям", "7 депозитів", "700 ФС"],
    stats: [
      { label: "100%", value: "+25 ФС" },
      { label: "150%", value: "+50 ФС" },
      { label: "200%", value: "+300%+" }
    ]
  },
  {
    id: "city-vip-slider",
    eyebrow: "CITY VIP",
    title: "Увійди до кола обраних City VIP",
    body:
      "Персональні подарунки, окремі турніри та пріоритетна підтримка.",
    image: "/slotcity/assets/promos/city-vip-slider.webp",
    accent: "violet",
    primaryHref: "/vip",
    primaryLabel: "Дивитися VIP",
    secondaryHref: "/catalog",
    secondaryLabel: "Відкрити ігри",
    chips: ["VIP club", "Персональні офери", "Преміум турніри"],
    stats: [
      { label: "VIP", value: "Статус" },
      { label: "CRM", value: "Персонально" },
      { label: "Fast lane", value: "Пріоритет" }
    ]
  },
  {
    id: "lucky-season",
    eyebrow: "Сезон удачі",
    title: "Злови удачу у Столиці Розваг",
    body:
      "Щоденні промо, турніри та швидкий перехід до потрібних слотів.",
    image: "/slotcity/assets/tournaments/lucky-season-promo-desktop.webp",
    accent: "green",
    primaryHref: "/tournaments",
    primaryLabel: "Перейти до акцій",
    secondaryHref: "/catalog",
    secondaryLabel: "Дивитися слоти",
    chips: ["Щоденні розіграші", "Турніри", "Lucky journey"],
    stats: [
      { label: "Daily", value: "Промо" },
      { label: "Drops", value: "Подарунки" },
      { label: "CTA", value: "Швидкий вхід" }
    ]
  }
];

const AUTOPLAY_MS = 5600;

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeSlide = HERO_SLIDES[currentIndex];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const previousSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const timer = window.setInterval(nextSlide, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <section
      className={`slotcity-hero-slider slotcity-section accent-${activeSlide.accent}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Головний банер SlotCity"
    >
      <div className="slotcity-hero-slider-stage">
        <div className="slotcity-hero-slider-frame">
          <div className="slotcity-hero-slider-backdrop">
            <Image
              key={`${activeSlide.id}-backdrop`}
              src={activeSlide.image}
              alt={activeSlide.title}
              fill
              priority
              sizes="(max-width: 920px) 100vw, 1232px"
              className="slotcity-hero-slider-image"
            />
            <div className="slotcity-hero-slider-overlay" />
            <div className="slotcity-hero-slider-sheen" />
          </div>

          <div className="slotcity-hero-slider-content">
            <div className="slotcity-hero-slider-copy-panel">
              <div className="slotcity-hero-slider-copy">
                <span className="slotcity-hero-slider-eyebrow">{activeSlide.eyebrow}</span>
                <h2 className="slotcity-hero-slider-title">{activeSlide.title}</h2>
                <p className="slotcity-hero-slider-body">{activeSlide.body}</p>

                <div className="slotcity-hero-slider-actions">
                  <TrackedLink
                    href={activeSlide.primaryHref}
                    className="slotcity-hero-slider-button slotcity-hero-slider-button-primary"
                    event="banner_clicked"
                    payload={{
                      bannerId: activeSlide.id,
                      properties: {
                        route: "home",
                        placement: "hero_slider_primary",
                        title: activeSlide.title
                      }
                    }}
                  >
                    {activeSlide.primaryLabel}
                  </TrackedLink>
                  <TrackedLink
                    href={activeSlide.secondaryHref}
                    className="slotcity-hero-slider-button slotcity-hero-slider-button-secondary"
                    event="banner_clicked"
                    payload={{
                      bannerId: activeSlide.id,
                      properties: {
                        route: "home",
                        placement: "hero_slider_secondary",
                        title: activeSlide.title
                      }
                    }}
                  >
                    {activeSlide.secondaryLabel}
                  </TrackedLink>
                </div>

                <div className="slotcity-hero-slider-chip-row">
                  {activeSlide.chips.map((chip) => (
                    <span key={chip}>{chip}</span>
                  ))}
                </div>
              </div>

              <div className="slotcity-hero-slider-art-card">
                <Image
                  key={activeSlide.id}
                  src={activeSlide.image}
                  alt={activeSlide.title}
                  fill
                  sizes="(max-width: 920px) 100vw, 620px"
                  className="slotcity-hero-slider-art-image"
                />
                <div className="slotcity-hero-slider-art-overlay" />
              </div>

              <div className="slotcity-hero-slider-stats">
                {activeSlide.stats.map((stat) => (
                  <div key={`${activeSlide.id}-${stat.label}`} className="slotcity-hero-slider-stat">
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="slotcity-hero-slider-media-panel">
              <div className="slotcity-hero-slider-panel">
                <span className="slotcity-hero-slider-panel-kicker">SlotCity Promo</span>
                <strong>{activeSlide.title}</strong>
                <p>{activeSlide.body}</p>
              </div>
            </div>
          </div>

          <div className="slotcity-hero-slider-nav">
            <button type="button" onClick={previousSlide} aria-label="Попередній банер">
              ‹
            </button>
            <button type="button" onClick={nextSlide} aria-label="Наступний банер">
              ›
            </button>
          </div>
        </div>

        <div className="slotcity-hero-slider-pagination" aria-label="Навігація банерів">
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`slotcity-hero-slider-dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Перейти до банера ${index + 1}`}
            >
              <span />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
