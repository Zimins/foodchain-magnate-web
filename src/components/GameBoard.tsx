"use client";

import React, { useMemo } from "react";
import type { MapTile, MapSquare, AbsolutePosition, HouseState, Campaign, PlayerState, PlayerColor } from "@/game/types";

const PLAYER_COLOR_CSS: Record<PlayerColor, string> = {
  yellow: "bg-yellow-400",
  blue: "bg-blue-500",
  red: "bg-red-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
};

const ITEM_DOT_COLORS: Record<string, string> = {
  burger: "bg-orange-500",
  pizza: "bg-red-400",
  soda: "bg-red-600",
  lemonade: "bg-yellow-400",
  beer: "bg-green-600",
};

const DRINK_SUPPLIER_COLORS: Record<string, string> = {
  soda: "bg-red-300",
  lemonade: "bg-yellow-300",
  beer: "bg-green-300",
};

interface GameBoardProps {
  mapTiles: MapTile[][];
  mapRows: number;
  mapCols: number;
  houses: HouseState[];
  campaigns: Campaign[];
  players: PlayerState[];
  onSquareClick?: (pos: AbsolutePosition) => void;
  highlightedSquares?: AbsolutePosition[];
}

export default function GameBoard({
  mapTiles,
  mapRows,
  mapCols,
  houses,
  campaigns,
  players,
  onSquareClick,
  highlightedSquares = [],
}: GameBoardProps) {
  // Build flat grid from tiles
  const totalRows = mapRows * 5;
  const totalCols = mapCols * 5;

  const flatGrid = useMemo(() => {
    const grid: MapSquare[][] = [];
    for (let tr = 0; tr < mapRows; tr++) {
      for (let sr = 0; sr < 5; sr++) {
        const row: MapSquare[] = [];
        for (let tc = 0; tc < mapCols; tc++) {
          const tile = mapTiles[tr]?.[tc];
          if (tile) {
            for (let sc = 0; sc < 5; sc++) {
              row.push(tile.grid[sr][sc]);
            }
          }
        }
        grid.push(row);
      }
    }
    return grid;
  }, [mapTiles, mapRows, mapCols]);

  const isHighlighted = (r: number, c: number) =>
    highlightedSquares.some((h) => h.row === r && h.col === c);

  const getHouseAt = (r: number, c: number) =>
    houses.find((h) => h.position.row === r && h.position.col === c);

  const getCampaignAt = (r: number, c: number) =>
    campaigns.find((ca) => ca.position.row === r && ca.position.col === c);

  const getPlayerColor = (playerId: string): PlayerColor | undefined =>
    players.find((p) => p.id === playerId)?.color;

  const getSquareClasses = (square: MapSquare, r: number, c: number): string => {
    const base = "w-full h-full border border-stone-200/50 flex items-center justify-center text-[8px] relative";
    const highlighted = isHighlighted(r, c) ? " ring-2 ring-teal-400 ring-inset z-10" : "";

    switch (square.type) {
      case "road":
        return `${base} bg-stone-300${highlighted}`;
      case "house":
        return `${base} bg-amber-700 text-white font-bold${highlighted}`;
      case "apartment":
        return `${base} bg-amber-800 text-white font-bold${highlighted}`;
      case "park":
        return `${base} bg-emerald-400${highlighted}`;
      case "garden":
        return `${base} bg-green-400${highlighted}`;
      case "drink_supplier": {
        const drinkColor = square.drinkType ? DRINK_SUPPLIER_COLORS[square.drinkType] : "bg-stone-200";
        return `${base} ${drinkColor}${highlighted}`;
      }
      case "restaurant": {
        const pColor = square.ownerPlayerId ? getPlayerColor(square.ownerPlayerId) : undefined;
        const colorCls = pColor ? PLAYER_COLOR_CSS[pColor] : "bg-stone-400";
        return `${base} ${colorCls}${highlighted}`;
      }
      case "campaign":
        return `${base} bg-pink-200${highlighted}`;
      case "bridge":
        return `${base} bg-stone-500${highlighted}`;
      case "cul_de_sac":
        return `${base} bg-stone-300${highlighted}`;
      default:
        return `${base} bg-amber-50${highlighted}`;
    }
  };

  const getSquareContent = (square: MapSquare, r: number, c: number): React.ReactNode => {
    if ((square.type === "house" || square.type === "apartment") && square.houseNumber !== undefined) {
      const house = getHouseAt(r, c);
      return (
        <div className="flex flex-col items-center">
          <span className="font-bold leading-none">{square.houseNumber}</span>
          {house && house.demand.length > 0 && (
            <div className="flex gap-px mt-px">
              {house.demand.map((item, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${ITEM_DOT_COLORS[item]}`}
                />
              ))}
            </div>
          )}
        </div>
      );
    }
    if (square.type === "drink_supplier" && square.drinkType) {
      const labels = { soda: "S", lemonade: "L", beer: "B" };
      return <span className="font-bold">{labels[square.drinkType]}</span>;
    }
    if (square.type === "bridge") {
      return <span className="font-bold text-white">{square.bridgeDirection === "vertical" ? "|" : "—"}</span>;
    }
    if (square.type === "cul_de_sac") {
      const arrows: Record<string, string> = { north: "\u25B4", south: "\u25BE", east: "\u25B8", west: "\u25C2" };
      return <span className="font-bold text-stone-600">{arrows[square.openDirection || "north"]}</span>;
    }
    if (square.type === "restaurant") {
      return <span className="font-bold text-white">{square.restaurantState === "open" ? "R" : "?"}</span>;
    }
    const campaign = getCampaignAt(r, c);
    if (campaign) {
      const icons = { billboard: "B", mailbox: "M", airplane: "A", radio: "R" };
      return <span className="font-bold text-pink-700">{icons[campaign.type]}</span>;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-2 overflow-auto">
      <div
        className="grid gap-0 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${totalCols}, 24px)`,
          gridTemplateRows: `repeat(${totalRows}, 24px)`,
        }}
      >
        {flatGrid.map((row, r) =>
          row.map((square, c) => (
            <div
              key={`${r}-${c}`}
              className={getSquareClasses(square, r, c)}
              onClick={() => onSquareClick?.({ row: r, col: c })}
            >
              {getSquareContent(square, r, c)}
            </div>
          ))
        )}
      </div>
      {/* Tile grid lines overlay hint */}
      <div className="mt-2 flex gap-4 text-[10px] text-stone-400 justify-center">
        <span>🟤 House</span>
        <span>⬜ Empty</span>
        <span>⬛ Road</span>
        <span>🟢 Garden</span>
        <span>🔴 Soda</span>
        <span>🟡 Lemon</span>
        <span>🟢 Beer</span>
      </div>
    </div>
  );
}
