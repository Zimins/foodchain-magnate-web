"use client";

import React from "react";
import type { GamePhase, WorkingSubPhase } from "@/game/types";

const PHASES: { key: GamePhase; label: string }[] = [
  { key: "restructuring", label: "Restructuring" },
  { key: "order_of_business", label: "Order of Business" },
  { key: "working_9_to_5", label: "Working 9-5" },
  { key: "dinnertime", label: "Dinnertime" },
  { key: "payday", label: "Payday" },
  { key: "marketing", label: "Marketing" },
  { key: "cleanup", label: "Cleanup" },
];

const SUB_PHASES: { key: WorkingSubPhase; label: string }[] = [
  { key: "hire", label: "Hire" },
  { key: "train", label: "Train" },
  { key: "open_drive_ins", label: "Drive-Ins" },
  { key: "launch_campaigns", label: "Campaigns" },
  { key: "prep_food_drinks", label: "Prep Food" },
  { key: "place_houses_gardens", label: "Houses" },
  { key: "place_move_restaurants", label: "Restaurants" },
];

interface PhaseIndicatorProps {
  currentPhase: GamePhase;
  currentSubPhase?: WorkingSubPhase;
  round: number;
}

export default function PhaseIndicator({ currentPhase, currentSubPhase, round }: PhaseIndicatorProps) {
  return (
    <div className="bg-white rounded-lg shadow p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-teal-700">Round {round}</h3>
        {currentPhase === "game_over" && (
          <span className="text-xs font-bold text-red-500 uppercase">Game Over</span>
        )}
      </div>
      <div className="flex gap-1 flex-wrap">
        {PHASES.map((p) => (
          <div
            key={p.key}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              currentPhase === p.key
                ? "bg-teal-600 text-white"
                : "bg-stone-100 text-stone-500"
            }`}
          >
            {p.label}
          </div>
        ))}
      </div>
      {currentPhase === "working_9_to_5" && currentSubPhase && (
        <div className="mt-2 pt-2 border-t border-stone-200">
          <div className="flex gap-1 flex-wrap">
            {SUB_PHASES.map((sp) => (
              <div
                key={sp.key}
                className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  currentSubPhase === sp.key
                    ? "bg-red-500 text-white"
                    : "bg-stone-50 text-stone-400"
                }`}
              >
                {sp.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
