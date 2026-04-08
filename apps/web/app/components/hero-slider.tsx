"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { HeroSliderSlideContent } from "@slotcity/cms-sdk";

import { TrackedLink } from "./tracked-link";

const AUTOPLAY_MS = 5600;

export function HeroSlider({ slides }: { slides: HeroSliderSlideContent[] }) {
  if (slides.length === 0) {
    return null;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeSlide = slides[currentIndex];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const previousSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

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

          <div className="slotcity-hero-slider-mobile-copy">
            <span className="slotcity-hero-slider-mobile-kicker">{activeSlide.eyebrow}</span>
            <strong className="slotcity-hero-slider-mobile-title">{activeSlide.title}</strong>
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
          {slides.map((slide, index) => (
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
