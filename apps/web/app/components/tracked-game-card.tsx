"use client";

import Image from "next/image";

import { useSlotcityAnalytics } from "./analytics-context";

interface TrackedGameCardProps {
  title: string;
  provider: string;
  image: string;
  rank?: string;
  gameId: string;
  shelfId: string;
  position: number;
}

export function TrackedGameCard({
  title,
  provider,
  image,
  rank,
  gameId,
  shelfId,
  position
}: TrackedGameCardProps) {
  const { capture } = useSlotcityAnalytics();

  return (
    <button
      type="button"
      className="slotcity-game-card slotcity-game-card-button"
      onClick={() => {
        void capture("game_card_opened", {
          gameId,
          shelfId,
          position,
          providerId: provider,
          properties: {
            title,
            provider
          }
        });
      }}
    >
      <div className="slotcity-game-media">
        <Image src={image} alt={title} fill sizes="(max-width: 768px) 40vw, 180px" />
        {rank ? <div className="slotcity-rank-badge">{rank}</div> : null}
      </div>
      <div className="slotcity-game-copy">
        <strong>{title}</strong>
        <span>{provider}</span>
      </div>
    </button>
  );
}
