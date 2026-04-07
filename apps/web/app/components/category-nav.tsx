"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Route } from "next";

export interface Category {
  id: string;
  label: string;
  icon: string;
  glowColor?: string;
}

const mainCategories: Category[] = [
  { id: "all", label: "Ігровий зал", icon: "🎰", glowColor: "rgba(255, 206, 0, 0.4)" },
  { id: "providers", label: "Провайдери", icon: "🏢" },
  { id: "slots", label: "Слоти", icon: "🍋", glowColor: "rgba(255, 126, 0, 0.4)" },
  { id: "collections", label: "Колекції", icon: "💎" },
  { id: "live", label: "Live", icon: "🎥", glowColor: "rgba(34, 197, 94, 0.4)" },
  { id: "quick", label: "Швидкі ігри", icon: "⚡" },
  { id: "favorites", label: "Улюблені", icon: "⭐" }
];

export function CategoryNav() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const currentCategory = searchParams.get("category") || "all";

  function setCategory(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", id);
    router.replace(`${pathname}?${params.toString()}` as Route, { scroll: false });
  }

  return (
    <nav className="slotcity-category-nav-wrapper">
      <div className="slotcity-category-nav">
        {mainCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`slotcity-category-item ${currentCategory === cat.id ? "is-active" : ""}`}
            onClick={() => setCategory(cat.id)}
            style={{ "--glow-color": cat.glowColor } as React.CSSProperties}
          >
            <div className="slotcity-category-icon">
              <span>{cat.icon}</span>
            </div>
            <span className="slotcity-category-label">{cat.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
