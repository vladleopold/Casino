import type { Route } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import type { NavigationLink } from "@slotcity/cms-sdk";
import { appConfig } from "@slotcity/config";
import { Kicker } from "@slotcity/ui";

type ShellSection = "vision" | "catalog" | "live";

type SignalTone = "gold" | "green" | "blue";

interface ShellSignal {
  label: string;
  value: string;
  tone?: SignalTone;
}

interface PlatformShellProps {
  children: ReactNode;
  compact?: boolean;
  section: ShellSection;
  signals?: ShellSignal[];
  navigation?: NavigationLink[];
  header?: {
    kicker?: string;
    title?: string;
    subtitle?: string;
  };
}

const sectionMeta: Record<
  ShellSection,
  { id: string; label: string; href: string; subtitle: string; title: string }
> = {
  vision: {
    id: "vision",
    label: "Vision",
    href: "/",
    subtitle: "new storefront platform",
    title: "Platform Vision"
  },
  catalog: {
    id: "catalog",
    label: "Catalog",
    href: "/catalog",
    subtitle: "merchandising shell",
    title: "Catalog Control"
  },
  live: {
    id: "live",
    label: "Live",
    href: "/live",
    subtitle: "return-first lobby shell",
    title: "Live Control"
  }
};

const navItems = Object.entries(sectionMeta).map(([key, meta]) => ({
  key: key as ShellSection,
  ...meta
}));

function toneClassName(tone?: SignalTone) {
  if (!tone) {
    return "";
  }

  return ` status-tone-${tone}`;
}

export function PlatformShell({
  children,
  compact = false,
  section,
  signals = [],
  navigation,
  header
}: PlatformShellProps) {
  const currentSection = sectionMeta[section];
  const navItems = navigation ?? Object.values(sectionMeta);
  const headerKicker = header?.kicker ?? "SlotCity Platform / 4.0";
  const headerTitle = header?.title ?? currentSection.title;
  const headerSubtitle = header?.subtitle ?? `${appConfig.siteName} / ${currentSection.subtitle}`;

  return (
    <main className={`page-shell shell-${section} ${compact ? "compact-shell" : ""}`.trim()}>
      <div className="page-grid" />
      <div className="ambient ambient-gold" />
      <div className="ambient ambient-green" />
      <div className="ambient ambient-blue" />

      <header className="topbar shell-topbar">
        <div className="brand-lockup">
          <Kicker>{headerKicker}</Kicker>
          <div className="brand-copy">
            <strong className="brand-heading">{headerTitle}</strong>
            <span className="brand-subtitle">{headerSubtitle}</span>
          </div>
        </div>

        <nav className="topnav" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href as Route}
              aria-current={item.href === currentSection.href ? "page" : undefined}
              className={`topnav-link ${item.href === currentSection.href ? "is-active" : ""}`.trim()}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="shell-toolbar" aria-label="Runtime status">
          <span className="shell-toolbar-pill shell-toolbar-pill-gold">
            Geo {appConfig.defaultCountry}
          </span>
          <span className="shell-toolbar-pill shell-toolbar-pill-green">Chrome QA loop</span>
        </div>
      </header>

      {signals.length > 0 ? (
        <div className="shell-status-row" aria-label="Route status">
          {signals.map((signal) => (
            <article
              key={`${signal.label}-${signal.value}`}
              className={`shell-status-card${toneClassName(signal.tone)}`}
            >
              <span className="status-label">{signal.label}</span>
              <strong className="status-value">{signal.value}</strong>
            </article>
          ))}
        </div>
      ) : null}

      {children}

      <nav className="app-dock" aria-label="Primary mobile navigation">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href as Route}
            aria-current={item.href === currentSection.href ? "page" : undefined}
            className={`app-dock-item ${item.href === currentSection.href ? "is-active" : ""}`.trim()}
          >
            <span className="app-dock-icon" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
