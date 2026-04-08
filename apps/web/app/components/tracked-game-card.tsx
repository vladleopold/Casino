"use client";

import Image from "next/image";

import { TrackedLink } from "./tracked-link";

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
  const href = `/game/${gameId}`;

  return (
    <TrackedLink
      href={href}
      className="slotcity-game-card slotcity-game-card-button"
      event="game_card_opened"
      payload={{
        gameId,
        shelfId,
        position,
        providerId: provider,
        properties: {
          title,
          provider
        }
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
    </TrackedLink>
  );
}
