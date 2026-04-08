"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import type { MobileDockItemContent } from "@slotcity/cms-sdk";

function buildDockHref(pathname: string, item: MobileDockItemContent) {
  const resolvedPathname = pathname || "/";
  const resolvedHref = item.href || "/";

  if (item.modal) {
    return `${resolvedPathname}?modals=${item.modal}`;
  }

  return resolvedHref;
}

export function MobileDockClient({ items }: { items: MobileDockItemContent[] }) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const activeModal = searchParams.get("modals");
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);

    syncHash();
    window.addEventListener("hashchange", syncHash);

    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const renderDockItem = (item: MobileDockItemContent) => {
    let isActive: boolean;
    const href = item.href || "/";
    const [baseHref, anchor] = href.split("#");

    if (item.modal) {
      isActive = activeModal === item.modal;
    } else if (anchor) {
      isActive = pathname === (baseHref || "/") && hash === `#${anchor}`;
    } else if (href === "/") {
      isActive = pathname === "/" && !activeModal;
    } else {
      isActive = pathname.startsWith(baseHref || href);
    }

    return (
      <Link
        key={item.id}
        href={buildDockHref(pathname, item) as any}
        className={`slotcity-mobile-dock-item${isActive ? " is-active" : ""}`}
        scroll={false}
      >
        <span className={`dock-icon dock-icon-${item.icon}`} />
        <span className="dock-label">{item.label}</span>
      </Link>
    );
  };

  const insertIndex = Math.min(2, items.length);
  const leadingItems = items.slice(0, insertIndex);
  const trailingItems = items.slice(insertIndex);

  return (
    <nav className="slotcity-mobile-dock" aria-label="Основна навігація">
      {leadingItems.map(renderDockItem)}
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
      {trailingItems.map(renderDockItem)}
    </nav>
  );
}
