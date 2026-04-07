"use client";

import { useState } from "react";
import "./game-hall.css";
import { TrackedGameCard } from "./tracked-game-card";

type Game = {
  id: string;
  title: string;
  provider: string;
  image: string;
};

interface GameHallProps {
  slots: Game[];
  live: Game[];
  bonus: Game[];
}

export function GameHall({ slots, live, bonus }: GameHallProps) {
  const [activeTab, setActiveTab] = useState<string>("slots");

  const categories = [
    { id: "all", label: "Ігровий зал", icon: "🎰", glowColor: "rgba(255, 206, 0, 0.4)" },
    { id: "providers", label: "Провайдери", icon: "🏢" },
    { id: "slots", label: "Слоти", icon: "🍋", glowColor: "rgba(255, 126, 0, 0.4)" },
    { id: "collections", label: "Колекції", icon: "💎" },
    { id: "live", label: "Live", icon: "🎥", glowColor: "rgba(34, 197, 94, 0.4)" },
    { id: "quick", label: "Швидкі ігри", icon: "⚡" },
    { id: "favorites", label: "Улюблені", icon: "⭐" }
  ];

  const providerHighlights = ["Pragmatic Play", "Evolution", "Amusnet", "Playson", "3OAKS"];

  const getGames = () => {
    switch (activeTab) {
      case "slots":
      case "all":
        return slots;
      case "live":
        return live;
      case "bonus":
        return bonus;
      default:
        return slots;
    }
  };

  const currentGames = getGames();

  return (
    <div className="slotcity-game-hall">
      <div className="slotcity-category-nav-wrapper">
        <nav className="slotcity-category-nav" aria-label="Ігровий зал">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`slotcity-game-hall-tab slotcity-category-item ${activeTab === cat.id || (activeTab === 'all' && cat.id === 'all') ? "is-active" : ""}`}
              onClick={() => setActiveTab(cat.id)}
              style={{ "--glow-color": cat.glowColor } as React.CSSProperties}
            >
              <div className="slotcity-game-hall-icon slotcity-category-icon">
                <span>{cat.icon}</span>
              </div>
              <span className="slotcity-category-label">{cat.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "providers" ? (
        <div className="slotcity-provider-grid">
          {providerHighlights.map((provider) => (
             <div key={provider} className="slotcity-provider-card">
               <div className="slotcity-provider-logo">
                 <span>{provider[0]}</span>
               </div>
               <strong>{provider}</strong>
             </div>
          ))}
        </div>
      ) : activeTab === "collections" ? (
        <div className="slotcity-collections-grid">
          {["Книжки", "Фрукти", "Єгипет", "Ковбої", "Азія"].map((coll) => (
            <div key={coll} className="slotcity-collection-card">
              <div className="slotcity-collection-media">
                 <div className="slotcity-collection-placeholder" />
              </div>
              <strong>{coll}</strong>
            </div>
          ))}
        </div>
      ) : (
        <div className="slotcity-game-grid">
          {currentGames.map((game, index) => (
            <TrackedGameCard
              key={game.id}
              title={game.title}
              provider={game.provider}
              image={game.image}
              gameId={game.id}
              shelfId={`game_hall_${activeTab}`}
              position={index + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
