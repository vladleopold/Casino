"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MobileDockInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeModal = searchParams.get("modals");

  const dockItems = [
    { label: "Головна", href: "/", icon: "home", modal: undefined },
    { label: "Каталог", href: "/catalog", icon: "games", modal: undefined },
    { isMenu: true },
    { label: "Бонуси", href: "/bonuses", icon: "bonuses", modal: undefined },
    { label: "Профіль", href: `${pathname}?modals=auth`, icon: "profile", modal: "auth" },
  ];

  return (
    <nav className="slotcity-mobile-dock" aria-label="Основна навігація">
      {dockItems.map((item, index) => {
        if ("isMenu" in item) {
          return (
            <button
              key="menu"
              className="slotcity-mobile-dock-menu-btn"
              onClick={() => window.dispatchEvent(new Event("open-sidebar"))}
              aria-label="Відкрити меню"
            >
              <div className="menu-btn-inner">
                <span />
                <span />
                <span />
              </div>
            </button>
          );
        }

        let isActive: boolean;

        if (item.modal) {
          // Modal items: active when the modals param matches
          isActive = activeModal === item.modal;
        } else if (item.href === "/") {
          // Home: active only on "/" without any modal param
          isActive = pathname === "/" && !activeModal;
        } else {
          // Regular pages: active when pathname matches
          isActive = pathname.startsWith(item.href as string);
        }

        return (
          <Link
            key={item.label}
            href={item.href as any}
            className={`slotcity-mobile-dock-item${isActive ? " is-active" : ""}`}
            scroll={false}
          >
            <span className={`dock-icon dock-icon-${item.icon}`} />
            <span className="dock-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileDock() {
  return (
    <Suspense fallback={<div className="slotcity-mobile-dock" />}>
      <MobileDockInner />
    </Suspense>
  );
}
