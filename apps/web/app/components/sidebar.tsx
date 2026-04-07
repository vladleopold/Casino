"use client";

import type { Route } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TrackedButton } from "./tracked-button";

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const searchParams = useSearchParams();
  const isLoggedIn = searchParams.get("auth") !== "guest";

  return (
    <>
      <div 
        className={`slotcity-sidebar-overlay ${isOpen ? "is-visible" : ""}`} 
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`slotcity-sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="slotcity-sidebar-header">
           <button 
            type="button" 
            className="slotcity-icon-button slotcity-sidebar-close" 
            aria-label="Close menu"
            onClick={onClose}
          >
            <span>✕</span>
          </button>
          {isLoggedIn ? (
            <>
              <div className="slotcity-sidebar-user-id">
                <span>ID: 5876258</span>
                <button type="button" className="slotcity-copy-button">📄</button>
              </div>
              <button type="button" className="slotcity-settings-button">⚙️</button>
            </>
          ) : (
            <div className="slotcity-sidebar-guest-header-actions">
              <button type="button" className="slotcity-sidebar-search-btn" aria-label="Search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
              </button>
              <button type="button" className="slotcity-sidebar-random-btn">
                <span>Випадкова</span>
              </button>
            </div>
          )}
        </div>

        {isLoggedIn ? (
          <>
            <div className="slotcity-sidebar-user-info">
              <div className="slotcity-sidebar-user-name">vladyslavchaplygin</div>
              <div className="slotcity-sidebar-user-status">Не верифіковано</div>
            </div>

            <div className="slotcity-sidebar-progress-bar">
               <div className="slotcity-sidebar-progress-label">
                <span>До 1-го рівня</span>
                <span>2 / 6</span>
               </div>
               <div className="slotcity-sidebar-progress-track">
                 <div className="slotcity-sidebar-progress-fill" style={{ width: "33%" }} />
               </div>
            </div>

            <button type="button" className="slotcity-sidebar-verify-banner">
                <span>Пройди верифікацію – отримай 50 ФС бездеп</span>
                <span>→</span>
            </button>

            <div className="slotcity-sidebar-quick-actions">
               <div className="slotcity-sidebar-action-item">
                 <div className="slotcity-sidebar-action-icon gold">B</div>
                 <span>Бонуси</span>
                 <span className="slotcity-sidebar-action-badge">2</span>
               </div>
               <div className="slotcity-sidebar-action-item">
                 <div className="slotcity-sidebar-action-icon yellow">M</div>
                 <span>Місії</span>
                 <span className="slotcity-sidebar-action-badge">6</span>
               </div>
               <div className="slotcity-sidebar-action-item">
                 <div className="slotcity-sidebar-action-icon purple">B</div>
                 <span>Бейджи</span>
               </div>
               <div className="slotcity-sidebar-action-item">
                 <div className="slotcity-sidebar-action-icon green">S</div>
                 <span>Магазин</span>
               </div>
            </div>
          </>
        ) : (
          <div className="slotcity-sidebar-guest-hero">
            <div className="slotcity-sidebar-welcome-card">
              <div className="welcome-card-content">
                <div className="welcome-card-kicker">Вітальний бонус</div>
                <div className="welcome-card-title">
                  <strong>500 000 ₴</strong>
                  <span>+ 700 ФС</span>
                </div>
                
                <div className="welcome-card-gifts">
                  <div className="welcome-gift">
                    <div className="gift-icon">🎁</div>
                    <span>150 000 ₴</span>
                  </div>
                  <div className="welcome-gift">
                    <div className="gift-icon">🎁</div>
                    <span>200 000 ₴</span>
                  </div>
                  <div className="welcome-gift">
                    <div className="gift-icon">🎁</div>
                    <span>150 000 ₴</span>
                  </div>
                </div>

                <TrackedButton
                  className="welcome-card-button"
                  event="cta_clicked"
                  payload={{ properties: { placement: "sidebar_welcome_bonus" } }}
                >
                  Отримати
                </TrackedButton>
              </div>
            </div>
          </div>
        )}

        <nav className="slotcity-sidebar-nav-grid">
           <Link href={"/catalog" as Route} className="slotcity-sidebar-nav-item">
             <div className="slotcity-sidebar-nav-icon">🎮</div>
             <span>Ігри</span>
           </Link>
           <button className="slotcity-sidebar-nav-item">
             <div className="slotcity-sidebar-nav-icon">❤️</div>
             <span>Улюблені</span>
           </button>
           <button className="slotcity-sidebar-nav-item">
             <div className="slotcity-sidebar-nav-icon">💼</div>
             <span>Провайдери</span>
           </button>
           <Link href={"/tournaments" as Route} className="slotcity-sidebar-nav-item">
             <div className="slotcity-sidebar-nav-icon">🏆</div>
             <span>Турніри</span>
           </Link>
           <button className="slotcity-sidebar-nav-item">
             <div className="slotcity-sidebar-nav-icon">🎁</div>
             <span>Розіграші</span>
           </button>
           <Link href={"/promotions" as Route} className="slotcity-sidebar-nav-item">
             <div className="slotcity-sidebar-nav-icon">🔥</div>
             <span>Акції</span>
           </Link>
           <button className="slotcity-sidebar-nav-item">
             <div className="slotcity-sidebar-nav-icon">📊</div>
             <span>Рівні</span>
           </button>
           <Link href={"/vip" as Route} className="slotcity-sidebar-nav-item">
             <div className="slotcity-sidebar-nav-icon">👑</div>
             <span>CITY VIP</span>
           </Link>
           <Link href={"/tournaments" as Route} className="slotcity-sidebar-nav-item">
             <div className="slotcity-sidebar-nav-icon">🍀</div>
             <span>Сезон удачі</span>
           </Link>
        </nav>

        <div className="slotcity-sidebar-footer-links">
          <button className="slotcity-sidebar-footer-link">Промокод</button>
          <button className="slotcity-sidebar-footer-link">Моє Сіті</button>
          <button className="slotcity-sidebar-footer-link">Деталі</button>
          <button className="slotcity-sidebar-footer-link">Підтримка MyCity</button>
        </div>

        <div className="slotcity-sidebar-apps">
           <button className="slotcity-sidebar-app-button">Download on App Store</button>
           <button className="slotcity-sidebar-app-button">Get it on Google Play</button>
        </div>
      </aside>
    </>
  );
}
