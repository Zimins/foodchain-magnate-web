"use client";

import React from "react";
import type { PlayerState, PlayerColor } from "@/game/types";
import { EMPLOYEE_DEFINITIONS, MILESTONE_DEFINITIONS } from "@/game/constants";
import EmployeeCard from "./EmployeeCard";

const PLAYER_COLOR_BORDER: Record<PlayerColor, string> = {
  yellow: "border-yellow-400",
  blue: "border-blue-500",
  red: "border-red-500",
  green: "border-green-500",
  purple: "border-purple-500",
};

const PLAYER_COLOR_BG: Record<PlayerColor, string> = {
  yellow: "bg-yellow-100",
  blue: "bg-blue-100",
  red: "bg-red-100",
  green: "bg-green-100",
  purple: "bg-purple-100",
};

interface PlayerDashboardProps {
  player: PlayerState;
  isCurrentPlayer: boolean;
}

export default function PlayerDashboard({ player, isCurrentPlayer }: PlayerDashboardProps) {
  const handEmployees = player.employees.filter((e) => e.location === "hand");
  const achievedMilestones = MILESTONE_DEFINITIONS.filter((m) =>
    player.milestones.includes(m.id)
  );

  return (
    <div
      className={`bg-white rounded-lg shadow border-l-4 ${PLAYER_COLOR_BORDER[player.color]} p-3`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full ${PLAYER_COLOR_BG[player.color]}`} />
          <h3 className="font-bold text-sm">{player.name}</h3>
          {isCurrentPlayer && (
            <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-bold">YOU</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!player.isConnected && (
            <span className="text-[10px] text-red-500 font-bold">OFFLINE</span>
          )}
          <span className="text-xs text-stone-400">#{player.turnOrder}</span>
        </div>
      </div>

      {/* Cash */}
      <div className="flex items-center gap-4 mb-3 px-2 py-2 bg-stone-50 rounded-lg">
        <div>
          <p className="text-[10px] text-stone-500">Cash</p>
          <p className="text-lg font-bold text-green-700">${player.cash}</p>
        </div>
        <div className="h-8 w-px bg-stone-200" />
        <div>
          <p className="text-[10px] text-stone-500">Price</p>
          <p className="text-sm font-semibold">${player.itemPrice}/item</p>
        </div>
      </div>

      {/* Stock */}
      <div className="mb-3">
        <p className="text-[10px] font-bold text-stone-500 mb-1">STOCK</p>
        <div className="flex gap-2 flex-wrap">
          <StockBadge label="Burger" count={player.stock.burger} color="bg-orange-100 text-orange-700" />
          <StockBadge label="Pizza" count={player.stock.pizza} color="bg-red-100 text-red-700" />
          <StockBadge label="Soda" count={player.stock.soda} color="bg-red-100 text-red-600" />
          <StockBadge label="Lemon" count={player.stock.lemonade} color="bg-yellow-100 text-yellow-700" />
          <StockBadge label="Beer" count={player.stock.beer} color="bg-green-100 text-green-700" />
        </div>
      </div>

      {/* Freezer */}
      {player.hasFreezer && (
        <div className="mb-3">
          <p className="text-[10px] font-bold text-stone-500 mb-1">FREEZER ({player.freezer.length}/10)</p>
          <div className="flex gap-1 flex-wrap">
            {player.freezer.length === 0 ? (
              <span className="text-[10px] text-stone-400">Empty</span>
            ) : (
              player.freezer.map((item, i) => (
                <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded">
                  {item}
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {/* Hand Employees */}
      {isCurrentPlayer && handEmployees.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-bold text-stone-500 mb-1">HAND</p>
          <div className="flex gap-1 flex-wrap">
            {handEmployees.map((es) => (
              <EmployeeCard key={es.card.id} employeeType={es.card.type} employeeId={es.card.id} compact />
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      {achievedMilestones.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-stone-500 mb-1">MILESTONES</p>
          <div className="flex flex-col gap-1">
            {achievedMilestones.map((m) => (
              <div key={m.id} className="text-[10px] flex items-center gap-1">
                <span className="text-green-500">✓</span>
                <span className="text-stone-600">{m.displayName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StockBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${color}`}>
      {label}: {count}
    </span>
  );
}
