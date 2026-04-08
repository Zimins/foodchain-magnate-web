"use client";

import React, { useState } from "react";
import type { RoomInfo } from "@/game/types";

const PLAYER_COLOR_BG: Record<string, string> = {
  yellow: "bg-yellow-200",
  blue: "bg-blue-200",
  red: "bg-red-200",
  green: "bg-green-200",
  purple: "bg-purple-200",
};

interface WaitingRoomProps {
  roomInfo: RoomInfo;
  myPlayerId: string | null;
  onStartGame: () => void;
  onLeave: () => void;
}

export default function WaitingRoom({ roomInfo, myPlayerId, onStartGame, onLeave }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);
  const isHost = myPlayerId === roomInfo.hostId;

  const copyCode = async () => {
    await navigator.clipboard.writeText(roomInfo.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-teal-700 text-center mb-6">Waiting for Players</h1>

        {/* Room Code */}
        <div className="bg-stone-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-xs text-stone-500 mb-1">Room Code</p>
          <button
            onClick={copyCode}
            className="text-2xl font-mono font-bold text-teal-700 tracking-widest hover:text-teal-500 transition-colors"
          >
            {roomInfo.id}
          </button>
          <p className="text-xs text-stone-400 mt-1">{copied ? "Copied!" : "Click to copy"}</p>
        </div>

        {/* Config Summary */}
        <div className="text-xs text-stone-500 mb-4 flex gap-3 justify-center">
          <span>{roomInfo.config.playerCount} players</span>
          <span>{roomInfo.config.introductoryGame ? "Introductory" : "Full Game"}</span>
        </div>

        {/* Player List */}
        <div className="space-y-2 mb-6">
          {roomInfo.players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                player.id === myPlayerId ? "border-teal-300 bg-teal-50" : "border-stone-200"
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${PLAYER_COLOR_BG[player.color]}`} />
              <span className="font-medium text-sm flex-1">{player.name}</span>
              {player.id === roomInfo.hostId && (
                <span className="text-[10px] font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded">HOST</span>
              )}
              {player.id === myPlayerId && (
                <span className="text-[10px] text-stone-400">You</span>
              )}
            </div>
          ))}
          {Array.from({ length: roomInfo.config.playerCount - roomInfo.players.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-stone-300">
              <div className="w-8 h-8 rounded-full bg-stone-100" />
              <span className="text-sm text-stone-400">Waiting...</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onLeave}
            className="flex-1 py-2 px-4 rounded-lg border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            Leave
          </button>
          {isHost && (
            <button
              onClick={onStartGame}
              disabled={roomInfo.players.length < 2}
              className="flex-1 py-2 px-4 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Start Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
