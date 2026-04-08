"use client";

import React from "react";
import type { EmployeeType } from "@/game/types";
import { EMPLOYEE_DEFINITIONS } from "@/game/constants";

const CATEGORY_COLORS: Record<string, string> = {
  ceo: "bg-yellow-100 border-yellow-400",
  management: "bg-purple-100 border-purple-400",
  recruiter: "bg-blue-100 border-blue-400",
  trainer: "bg-green-100 border-green-400",
  planning: "bg-orange-100 border-orange-400",
  marketing: "bg-pink-100 border-pink-400",
  pricing: "bg-cyan-100 border-cyan-400",
  kitchen: "bg-red-100 border-red-400",
  drink: "bg-amber-100 border-amber-400",
  special: "bg-indigo-100 border-indigo-400",
};

const CATEGORY_ICONS: Record<string, string> = {
  ceo: "👔",
  management: "📋",
  recruiter: "🤝",
  trainer: "🎓",
  planning: "🗺️",
  marketing: "📢",
  pricing: "💲",
  kitchen: "🍳",
  drink: "🥤",
  special: "⭐",
};

interface EmployeeCardProps {
  employeeType: EmployeeType;
  employeeId?: string;
  compact?: boolean;
  draggable?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  selected?: boolean;
  disabled?: boolean;
}

export default function EmployeeCard({
  employeeType,
  employeeId,
  compact = false,
  draggable = false,
  onClick,
  onDragStart,
  selected = false,
  disabled = false,
}: EmployeeCardProps) {
  const def = EMPLOYEE_DEFINITIONS[employeeType];
  const colorClass = CATEGORY_COLORS[def.category] ?? "bg-gray-100 border-gray-400";
  const icon = CATEGORY_ICONS[def.category] ?? "📦";

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${colorClass} ${
          selected ? "ring-2 ring-teal-500" : ""
        } ${disabled ? "opacity-50" : "cursor-pointer"}`}
        onClick={disabled ? undefined : onClick}
        draggable={draggable}
        onDragStart={onDragStart}
        data-employee-id={employeeId}
      >
        <span>{icon}</span>
        <span className="font-medium truncate">{def.displayName}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col p-2 rounded-lg border-2 ${colorClass} min-w-[120px] ${
        selected ? "ring-2 ring-teal-500" : ""
      } ${disabled ? "opacity-50" : "cursor-pointer hover:shadow-md"} transition-shadow`}
      onClick={disabled ? undefined : onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      data-employee-id={employeeId}
    >
      <div className="flex items-center gap-1 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-bold leading-tight">{def.displayName}</span>
      </div>
      <div className="flex gap-2 text-[10px] text-stone-600">
        {def.hasSalary && <span>💰 $5</span>}
        {def.workSlots > 0 && <span>📦 {def.workSlots} slots</span>}
        {def.roadRange > 0 && <span>🛣️ {def.roadRange === -1 ? "∞" : def.roadRange}</span>}
        {def.airRange > 0 && <span>✈️ {def.airRange === -1 ? "∞" : def.airRange}</span>}
      </div>
    </div>
  );
}
