"use client";

import React, { useEffect, useRef } from "react";
import type { GameLogEntry, PlayerColor } from "@/game/types";

const PLAYER_COLOR_MAP: Record<PlayerColor, string> = {
  yellow: "text-yellow-600",
  blue: "text-blue-600",
  red: "text-red-600",
  green: "text-green-600",
  purple: "text-purple-600",
};

interface GameLogProps {
  entries: GameLogEntry[];
  players: { id: string; name: string; color: PlayerColor }[];
}

export default function GameLog({ entries, players }: GameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  const getPlayerInfo = (playerId?: string) => {
    if (!playerId) return null;
    return players.find((p) => p.id === playerId) ?? null;
  };

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-full">
      <h3 className="text-sm font-bold text-teal-700 p-3 pb-2 border-b border-stone-100">
        Game Log
      </h3>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 game-log-scroll min-h-0">
        {entries.length === 0 && (
          <p className="text-xs text-stone-400 text-center py-4">No events yet</p>
        )}
        {entries.map((entry, i) => {
          const player = getPlayerInfo(entry.playerId);
          const colorClass = player ? PLAYER_COLOR_MAP[player.color] : "text-stone-600";
          return (
            <div key={i} className="text-xs py-1 border-b border-stone-50 last:border-0">
              {player && (
                <span className={`font-bold ${colorClass}`}>{player.name}: </span>
              )}
              <span className="text-stone-700">{entry.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
