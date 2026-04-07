"use client";

import { motion, useReducedMotion } from "motion/react";

const topSlots = [
  { title: "Gates", provider: "Pragmatic", accent: "gold" },
  { title: "Clover", provider: "SlotCity", accent: "green" },
  { title: "Ruby", provider: "Evolution", accent: "blue" }
] as const;

const liveCards = [
  { title: "Mega Wheel", meta: "LIVE" },
  { title: "VIP Black", meta: "TABLE" }
] as const;

const navItems = ["Головна", "Ігри", "Live", "Бонуси", "Профіль"] as const;

export function DevicePreview() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="device-stage">
      <motion.div
        className="device-floating-card floating-card-left"
        initial={prefersReducedMotion ? undefined : { opacity: 0, x: -28, y: 16 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.45 },
          x: { duration: 0.45 },
          y: { duration: 5.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
        }}
      >
        <span className="floating-label">A/B</span>
        <strong>Hero Variant B</strong>
        <span>CTR +14.8%</span>
      </motion.div>

      <motion.div
        className="device-floating-card floating-card-right"
        initial={prefersReducedMotion ? undefined : { opacity: 0, x: 30, y: 18 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: [0, 10, 0] }}
        transition={{
          opacity: { duration: 0.45, delay: 0.08 },
          x: { duration: 0.45, delay: 0.08 },
          y: { duration: 5.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
        }}
      >
        <span className="floating-label">Geo</span>
        <strong>UA / VIP shelf</strong>
        <span>5 pinned titles</span>
      </motion.div>

      <motion.div
        className="device-frame"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 32, rotateX: 9 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        <div className="device-notch" />
        <div className="device-screen">
          <div className="device-statusbar">
            <span>23:47</span>
            <span>5G</span>
          </div>

          <div className="device-toolbar">
            <div>
              <p className="device-toolbar-label">SlotCity</p>
              <strong>Премiум витрина</strong>
            </div>
            <div className="device-pill">12 480 ₴</div>
          </div>

          <motion.section
            className="device-hero-card"
            animate={prefersReducedMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 5.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <div className="device-hero-copy">
              <span className="device-chip">CITY VIP</span>
              <h3>Luxury slots, fast cashbox, live journeys.</h3>
              <p>Швидкий шлях до гри, бонусiв та персональних кампанiй.</p>
            </div>
            <div className="device-hero-orb" />
          </motion.section>

          <section className="device-section">
            <div className="device-section-head">
              <span>ТОП слоти</span>
              <span>Усi</span>
            </div>

            <div className="device-slot-row">
              {topSlots.map((slot) => (
                <article
                  key={slot.title}
                  className={`device-slot-card accent-${slot.accent}`}
                >
                  <div className="device-slot-art" />
                  <strong>{slot.title}</strong>
                  <span>{slot.provider}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="device-bonus-card">
            <div>
              <span className="device-chip chip-green">CRM Flow</span>
              <strong>500 000 ₴ + 700 ФС</strong>
              <p>Пiсля першого депозиту запускається Braze journey.</p>
            </div>
            <button type="button">Активувати</button>
          </section>

          <section className="device-section">
            <div className="device-section-head">
              <span>LIVE</span>
              <span>2 сценарiї</span>
            </div>

            <div className="device-live-grid">
              {liveCards.map((card) => (
                <article key={card.title} className="device-live-card">
                  <span>{card.meta}</span>
                  <strong>{card.title}</strong>
                </article>
              ))}
            </div>
          </section>

          <nav className="device-bottom-nav" aria-label="Mobile navigation preview">
            {navItems.map((item, index) => (
              <div
                key={item}
                className={index === 0 ? "device-nav-item is-active" : "device-nav-item"}
              >
                <span className="device-nav-dot" />
                <span>{item}</span>
              </div>
            ))}
          </nav>
        </div>
      </motion.div>
    </div>
  );
}
