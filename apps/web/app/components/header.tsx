"use client";

import type { Route } from "next";
import Link from "next/link";
import { TrackedButton } from "./tracked-button";
import { TrackedLink } from "./tracked-link";
import { useSlotcityAccount } from "./account-context";

interface HeaderProps {
  onMenuClick?: () => void;
  route?: string;
}

export function Header({ onMenuClick, route = "home" }: HeaderProps) {
  const { account, isAuthenticated, requestDeposit } = useSlotcityAccount();
  const navItems: Array<{ label: string; href: string; match: string[] }> = [
    { label: "Головна", href: "/", match: ["home", "casino"] },
    { label: "Каталог", href: "/catalog", match: ["catalog", "slots"] },
    { label: "Live", href: "/live", match: ["live"] },
    { label: "Бонуси", href: "/bonuses", match: ["promotions", "bonuses", "registration"] },
    { label: "VIP", href: "/vip", match: ["vip", "tournaments"] }
  ];

  return (
    <header className="slotcity-header">
      <div className="slotcity-header-left">
        <button
          type="button"
          className="slotcity-mobile-dock-menu-btn slotcity-desktop-menu"
          aria-label="Menu"
          onClick={onMenuClick}
          style={{ marginTop: 0, flex: "none" }}
        >
          <div className="menu-btn-inner" style={{ width: 44, height: 44 }}>
            <span />
            <span />
            <span />
          </div>
        </button>
        <button type="button" className="slotcity-header-random" aria-label="Випадкова гра">
          <span className="slotcity-header-random-icon">?</span>
          <span className="slotcity-header-random-label">Випадкова</span>
        </button>
      </div>

      <Link href="/" className="slotcity-logo-link" aria-label="SlotCity home">
        <img src="/slotcity/brand/logo.png" alt="SlotCity" className="slotcity-logo" />
      </Link>

      <nav className="slotcity-header-nav" aria-label="Основні розділи">
        {navItems.map((item) => (
          <TrackedLink
            key={item.href}
            href={item.href as Route}
            className={`slotcity-header-nav-link${item.match.includes(route) ? " is-active" : ""}`}
            event="cta_clicked"
            payload={{
              properties: {
                route,
                placement: "header_nav",
                label: item.label
              }
            }}
          >
            {item.label}
          </TrackedLink>
        ))}
      </nav>

      <div className="slotcity-header-right">
        {isAuthenticated ? (
          <>
            <button type="button" className="slotcity-header-notification" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            
            <div className="slotcity-header-balance">
              <span className="balance-amount">{account?.balance ?? 0}</span>
              <span className="balance-currency">₴</span>
            </div>

            <TrackedButton
              className="slotcity-deposit-button"
              onClick={() => {
                void requestDeposit("header_deposit");
              }}
              event="cta_clicked"
              payload={{
                properties: {
                  route,
                  placement: "header_deposit"
                }
              }}
            >
              <span className="slotcity-deposit-button-label">Поповнити</span>
              <span className="slotcity-deposit-button-short" aria-hidden="true">+</span>
            </TrackedButton>
          </>
        ) : (
          <div className="slotcity-auth-guest-group">
            <TrackedLink
              href={"/registration?mode=login" as Route}
              className="slotcity-guest-login"
              event="cta_clicked"
              payload={{
                properties: { route, placement: "header_guest_login" }
              }}
            >
              <span className="slotcity-guest-login-label">Увійти</span>
            </TrackedLink>
            <TrackedLink
              href={"/registration" as Route}
              className="slotcity-guest-register"
              event="cta_clicked"
              payload={{
                properties: { route, placement: "header_guest_register" }
              }}
            >
              <span className="slotcity-guest-register-label">Реєстрація</span>
              <span className="slotcity-guest-register-short" aria-hidden="true">+</span>
            </TrackedLink>
          </div>
        )}
      </div>
    </header>
  );
}
