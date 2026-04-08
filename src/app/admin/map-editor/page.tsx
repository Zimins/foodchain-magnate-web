"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import type { MapSquare, DrinkType, BridgeDirection, OpenDirection, MapTile } from "@/game/types";

// ---- Types ----

type BrushType = "empty" | "road" | "house" | "apartment" | "park" | "drink_soda" | "drink_lemonade" | "drink_beer" | "bridge_h" | "bridge_v" | "cul_n" | "cul_s" | "cul_e" | "cul_w";

interface TileTemplate {
  id: string;
  name: string;
  grid: MapSquare[][];
}

interface MapLayout {
  id: string;
  name: string;
  rows: number;
  cols: number;
  /** Template ID at each position (null = empty slot) */
  tileSlots: (string | null)[][];
  tileRotations: (0 | 90 | 180 | 270)[][];
}

// ---- Helpers ----

// ---- API helpers ----

async function apiGetTiles(): Promise<TileTemplate[]> {
  const res = await fetch("/api/admin/tiles");
  return res.ok ? res.json() : [];
}

async function apiSaveTile(tile: TileTemplate): Promise<void> {
  await fetch("/api/admin/tiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tile),
  });
}

async function apiDeleteTile(id: string): Promise<void> {
  await fetch(`/api/admin/tiles?id=${id}`, { method: "DELETE" });
}

async function apiGetLayouts(): Promise<MapLayout[]> {
  const res = await fetch("/api/admin/layouts");
  return res.ok ? res.json() : [];
}

async function apiSaveLayout(layout: MapLayout): Promise<void> {
  await fetch("/api/admin/layouts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(layout),
  });
}

async function apiDeleteLayout(id: string): Promise<void> {
  await fetch(`/api/admin/layouts?id=${id}`, { method: "DELETE" });
}

function createEmptyGrid(): MapSquare[][] {
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => ({ type: "empty" as const }))
  );
}

function createDefaultTileGrid(): MapSquare[][] {
  const grid = createEmptyGrid();
  // roads on all edges
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (r === 0 || r === 4 || c === 0 || c === 4) {
        grid[r][c] = { type: "road" };
      }
    }
  }
  return grid;
}

function applyBrush(square: MapSquare, brush: BrushType, houseNumber: number): MapSquare {
  switch (brush) {
    case "empty":
      return { type: "empty" };
    case "road":
      return { type: "road" };
    case "house":
      return { type: "house", houseNumber };
    case "apartment":
      return { type: "apartment", houseNumber };
    case "park":
      return { type: "park" };
    case "drink_soda":
      return { type: "drink_supplier", drinkType: "soda" as DrinkType };
    case "drink_lemonade":
      return { type: "drink_supplier", drinkType: "lemonade" as DrinkType };
    case "drink_beer":
      return { type: "drink_supplier", drinkType: "beer" as DrinkType };
    case "bridge_h":
      return { type: "bridge", bridgeDirection: "horizontal" as BridgeDirection };
    case "bridge_v":
      return { type: "bridge", bridgeDirection: "vertical" as BridgeDirection };
    case "cul_n":
      return { type: "cul_de_sac", openDirection: "north" as OpenDirection };
    case "cul_s":
      return { type: "cul_de_sac", openDirection: "south" as OpenDirection };
    case "cul_e":
      return { type: "cul_de_sac", openDirection: "east" as OpenDirection };
    case "cul_w":
      return { type: "cul_de_sac", openDirection: "west" as OpenDirection };
  }
}

const ROTATE_CW: Record<string, OpenDirection> = { north: "east", east: "south", south: "west", west: "north" };

/** Rotate a single square's directional properties 90° clockwise */
function rotateSquare90(sq: MapSquare): MapSquare {
  if (sq.type === "bridge" && sq.bridgeDirection) {
    return { ...sq, bridgeDirection: sq.bridgeDirection === "horizontal" ? "vertical" : "horizontal" };
  }
  if (sq.type === "cul_de_sac" && sq.openDirection) {
    return { ...sq, openDirection: ROTATE_CW[sq.openDirection] };
  }
  return sq;
}

function rotateGrid(grid: MapSquare[][], rotation: 0 | 90 | 180 | 270): MapSquare[][] {
  if (rotation === 0) return grid;
  let result = grid;
  const times = rotation / 90;
  for (let t = 0; t < times; t++) {
    const rotated: MapSquare[][] = Array.from({ length: 5 }, () => Array(5));
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        rotated[c][4 - r] = rotateSquare90(result[r][c]);
      }
    }
    result = rotated;
  }
  return result;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ---- Square rendering ----

const SQUARE_COLORS: Record<string, string> = {
  empty: "bg-amber-50",
  road: "bg-stone-400",
  house: "bg-amber-700",
  apartment: "bg-amber-800",
  park: "bg-emerald-400",
  bridge: "bg-stone-500",
  cul_de_sac: "bg-stone-300",
  drink_soda: "bg-red-300",
  drink_lemonade: "bg-yellow-300",
  drink_beer: "bg-green-300",
};

function squareColor(sq: MapSquare): string {
  if (sq.type === "drink_supplier" && sq.drinkType) return SQUARE_COLORS[`drink_${sq.drinkType}`] || "bg-stone-200";
  return SQUARE_COLORS[sq.type] || "bg-amber-50";
}

const CUL_ARROWS: Record<string, string> = { north: "\u25B4", south: "\u25BE", east: "\u25B8", west: "\u25C2" };

function isHouselike(sq: MapSquare | undefined | null): boolean {
  return !!sq && (sq.type === "house" || sq.type === "apartment");
}

function squareLabel(sq: MapSquare): string {
  if (sq.type === "house" || sq.type === "apartment") return `${sq.houseNumber ?? ""}`;
  if (sq.type === "bridge") return sq.bridgeDirection === "vertical" ? "|" : "—";
  if (sq.type === "cul_de_sac") return CUL_ARROWS[sq.openDirection || "north"];
  if (sq.type === "drink_supplier") {
    const labels: Record<string, string> = { soda: "S", lemonade: "L", beer: "B" };
    return labels[sq.drinkType || ""] || "?";
  }
  return "";
}

/** Find all cells belonging to the same house/apartment number */
function findHouseCells(grid: MapSquare[][], houseNumber: number): [number, number][] {
  const cells: [number, number][] = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const sq = grid[r][c];
      if ((sq.type === "house" || sq.type === "apartment") && sq.houseNumber === houseNumber) {
        cells.push([r, c]);
      }
    }
  }
  return cells;
}

// ---- Components ----

function TileGridEditor({
  grid,
  cellSize = 48,
  onCellClick,
  onCellDrag,
  highlightEdges = false,
}: {
  grid: MapSquare[][];
  cellSize?: number;
  onCellClick?: (r: number, c: number) => void;
  onCellDrag?: (r: number, c: number) => void;
  highlightEdges?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);

  // Check if neighbor is same block (merged borders)
  const sameBlock = (r: number, c: number, dr: number, dc: number) => {
    const sq = grid[r]?.[c];
    const nb = grid[r + dr]?.[c + dc];
    if (sq?.type === "park" && nb?.type === "park") return true;
    return isHouselike(sq) && isHouselike(nb) && sq.houseNumber === nb.houseNumber;
  };

  // Determine if this cell is the top-left of its block (for showing label)
  const isBlockTopLeft = (r: number, c: number) => {
    const sq = grid[r][c];
    if (!isHouselike(sq)) return false;
    const num = sq.houseNumber;
    const above = grid[r - 1]?.[c];
    const left = grid[r]?.[c - 1];
    return !(isHouselike(above) && above.houseNumber === num) &&
           !(isHouselike(left) && left.houseNumber === num);
  };

  return (
    <div
      className="inline-grid gap-0 border border-stone-300 rounded select-none"
      style={{
        gridTemplateColumns: `repeat(5, ${cellSize}px)`,
        gridTemplateRows: `repeat(5, ${cellSize}px)`,
      }}
      onMouseLeave={() => setIsDragging(false)}
      onMouseUp={() => setIsDragging(false)}
    >
      {grid.map((row, r) =>
        row.map((sq, c) => {
          const isEdge = r === 0 || r === 4 || c === 0 || c === 4;
          const hl = isHouselike(sq);
          // Merged border: hide border between same block neighbors
          const hideRight = sameBlock(r, c, 0, 1);
          const hideBottom = sameBlock(r, c, 1, 0);
          const hideLeft = sameBlock(r, c, 0, -1);
          const hideTop = sameBlock(r, c, -1, 0);

          return (
            <div
              key={`${r}-${c}`}
              className={`flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors
                ${squareColor(sq)}
                ${hl || sq.type === "bridge" ? "text-white" : "text-stone-700"}
                ${highlightEdges && isEdge ? "ring-1 ring-inset ring-stone-400/50" : ""}
                hover:brightness-90`}
              style={{
                borderTop: hideTop ? "none" : "1px solid rgba(168,162,158,0.4)",
                borderRight: hideRight ? "none" : "1px solid rgba(168,162,158,0.4)",
                borderBottom: hideBottom ? "none" : "1px solid rgba(168,162,158,0.4)",
                borderLeft: hideLeft ? "none" : "1px solid rgba(168,162,158,0.4)",
              }}
              onMouseDown={() => {
                setIsDragging(true);
                onCellClick?.(r, c);
              }}
              onMouseEnter={() => {
                if (isDragging) onCellDrag?.(r, c);
              }}
            >
              {sq.type === "park" ? (
                sameBlock(r, c, 0, 0) && !sameBlock(r, c, -1, 0) && !sameBlock(r, c, 0, -1)
                  ? <span className="text-xs font-bold text-white">P</span> : null
              ) : hl && isBlockTopLeft(r, c) ? (
                <span className="text-xs font-bold">{sq.type === "apartment" ? "A" : "H"}{sq.houseNumber}</span>
              ) : (
                !hl && squareLabel(sq)
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function TilePreview({
  grid,
  size = 20,
  rotation = 0,
  onClick,
  selected = false,
}: {
  grid: MapSquare[][];
  size?: number;
  rotation?: 0 | 90 | 180 | 270;
  onClick?: () => void;
  selected?: boolean;
}) {
  const displayed = rotateGrid(grid, rotation);

  const isTopLeft = (r: number, c: number) => {
    const sq = displayed[r][c];
    if (!isHouselike(sq)) return false;
    const num = sq.houseNumber;
    const above = displayed[r - 1]?.[c];
    const left = displayed[r]?.[c - 1];
    return !(isHouselike(above) && above.houseNumber === num) &&
           !(isHouselike(left) && left.houseNumber === num);
  };

  return (
    <div
      className={`inline-grid gap-0 border-2 rounded cursor-pointer transition-all ${
        selected ? "border-teal-500 shadow-md" : "border-stone-300 hover:border-stone-400"
      }`}
      style={{
        gridTemplateColumns: `repeat(5, ${size}px)`,
        gridTemplateRows: `repeat(5, ${size}px)`,
      }}
      onClick={onClick}
    >
      {displayed.map((row, r) =>
        row.map((sq, c) => {
          const hl = isHouselike(sq);
          return (
            <div
              key={`${r}-${c}`}
              className={`${squareColor(sq)} text-[5px] font-bold flex items-center justify-center ${
                hl ? "text-white" : "text-stone-600"
              }`}
            >
              {hl && isTopLeft(r, c)
                ? sq.houseNumber
                : !hl
                ? squareLabel(sq)
                : ""}
            </div>
          );
        })
      )}
    </div>
  );
}

// ---- Main Page ----

export default function MapEditorPage() {
  // Tile editor state
  const [tileGrid, setTileGrid] = useState<MapSquare[][]>(createEmptyGrid);
  const [brush, setBrush] = useState<BrushType>("road");
  const [nextHouseNumber, setNextHouseNumber] = useState(1);
  const [tileName, setTileName] = useState("Tile 1");

  // Tile library
  const [templates, setTemplates] = useState<TileTemplate[]>([]);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Map layout state
  const [layouts, setLayouts] = useState<MapLayout[]>([]);
  const [activeLayoutId, setActiveLayoutId] = useState<string | null>(null);
  const [placingTileId, setPlacingTileId] = useState<string | null>(null);

  const activeLayout = layouts.find((l) => l.id === activeLayoutId) ?? null;

  // Load from server on mount
  useEffect(() => {
    Promise.all([apiGetTiles(), apiGetLayouts()]).then(([tiles, lays]) => {
      setTemplates(tiles);
      setLayouts(lays);
    });
  }, []);

  // ---- Tile editor actions ----

  const paintCell = useCallback(
    (r: number, c: number) => {
      setTileGrid((prev) => {
        const next = prev.map((row) => [...row]);

        // House (2x2), Apartment (3x3), Park (2x2) placement
        if (brush === "house" || brush === "apartment" || brush === "park") {
          const size = brush === "apartment" ? 3 : 2;
          const sqType = brush as "house" | "apartment" | "park";

          // Clicking an existing house/apartment → change its number
          if (sqType !== "park" && isHouselike(next[r][c]) && next[r][c].houseNumber != null) {
            const cells = findHouseCells(next, next[r][c].houseNumber!);
            for (const [hr, hc] of cells) {
              next[hr][hc] = { ...next[hr][hc], houseNumber: nextHouseNumber };
            }
            return next;
          }

          // Bounds check
          if (r + size - 1 >= 5 || c + size - 1 >= 5) return prev;

          // Collect positions & check no overlap
          const positions: [number, number][] = [];
          for (let dr = 0; dr < size; dr++) {
            for (let dc = 0; dc < size; dc++) {
              positions.push([r + dr, c + dc]);
            }
          }
          const occupied = (sq: MapSquare) => isHouselike(sq) || sq.type === "park";
          if (positions.some(([pr, pc]) => occupied(next[pr][pc]))) return prev;

          // Place block
          for (const [pr, pc] of positions) {
            next[pr][pc] = sqType === "park"
              ? { type: "park" }
              : { type: sqType, houseNumber: nextHouseNumber };
          }
          return next;
        }

        // Erase entire house/apartment/park block
        if (brush === "empty" && isHouselike(next[r][c]) && next[r][c].houseNumber != null) {
          const cells = findHouseCells(next, next[r][c].houseNumber!);
          for (const [hr, hc] of cells) {
            next[hr][hc] = { type: "empty" };
          }
          return next;
        }
        if (brush === "empty" && next[r][c].type === "park") {
          // Erase 2x2 park block: find all connected park cells
          const visited = new Set<string>();
          const queue: [number, number][] = [[r, c]];
          while (queue.length) {
            const [qr, qc] = queue.pop()!;
            const key = `${qr},${qc}`;
            if (visited.has(key)) continue;
            if (next[qr]?.[qc]?.type !== "park") continue;
            visited.add(key);
            queue.push([qr - 1, qc], [qr + 1, qc], [qr, qc - 1], [qr, qc + 1]);
          }
          for (const key of visited) {
            const [pr, pc] = key.split(",").map(Number);
            next[pr][pc] = { type: "empty" };
          }
          return next;
        }

        // Default single-cell brush
        next[r][c] = applyBrush(next[r][c], brush, nextHouseNumber);
        return next;
      });
    },
    [brush, nextHouseNumber]
  );

  /** Drag paint — disabled for house/apartment brush to avoid accidental multi-placement */
  const dragPaintCell = useCallback(
    (r: number, c: number) => {
      if (brush === "house" || brush === "apartment" || brush === "park") return;
      paintCell(r, c);
    },
    [brush, paintCell]
  );

  const saveTile = async () => {
    const tile: TileTemplate = editingTemplateId
      ? { id: editingTemplateId, name: tileName, grid: tileGrid.map((r) => [...r]) }
      : { id: uid(), name: tileName, grid: tileGrid.map((r) => [...r]) };

    await apiSaveTile(tile);

    if (editingTemplateId) {
      setTemplates((prev) => prev.map((t) => (t.id === tile.id ? tile : t)));
    } else {
      setTemplates((prev) => [...prev, tile]);
      setEditingTemplateId(tile.id);
    }
  };

  const loadTile = (t: TileTemplate) => {
    setTileGrid(t.grid.map((r) => [...r]));
    setTileName(t.name);
    setEditingTemplateId(t.id);
  };

  const newTile = () => {
    setTileGrid(createEmptyGrid());
    setTileName(`Tile ${templates.length + 1}`);
    setEditingTemplateId(null);
  };

  const deleteTile = async (id: string) => {
    await apiDeleteTile(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (editingTemplateId === id) newTile();
  };

  // ---- Map layout actions ----

  const createLayout = async (rows: number, cols: number) => {
    const layout: MapLayout = {
      id: uid(),
      name: `Map ${rows}x${cols}`,
      rows,
      cols,
      tileSlots: Array.from({ length: rows }, () => Array(cols).fill(null)),
      tileRotations: Array.from({ length: rows }, () => Array(cols).fill(0)),
    };
    await apiSaveLayout(layout);
    setLayouts((prev) => [...prev, layout]);
    setActiveLayoutId(layout.id);
  };

  // Debounced layout save
  const layoutSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateLayout = (updated: MapLayout) => {
    setLayouts((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    if (layoutSaveTimer.current) clearTimeout(layoutSaveTimer.current);
    layoutSaveTimer.current = setTimeout(() => apiSaveLayout(updated), 500);
  };

  const deleteLayout = async (id: string) => {
    await apiDeleteLayout(id);
    setLayouts((prev) => prev.filter((l) => l.id !== id));
    if (activeLayoutId === id) setActiveLayoutId(null);
  };

  const placeTileOnSlot = (r: number, c: number) => {
    if (!activeLayout || !placingTileId) return;
    const updated = {
      ...activeLayout,
      tileSlots: activeLayout.tileSlots.map((row, ri) =>
        row.map((slot, ci) => (ri === r && ci === c ? placingTileId : slot))
      ),
    };
    updateLayout(updated);
    setPlacingTileId(null);
  };

  const removeTileFromSlot = (r: number, c: number) => {
    if (!activeLayout) return;
    const updated = {
      ...activeLayout,
      tileSlots: activeLayout.tileSlots.map((row, ri) =>
        row.map((slot, ci) => (ri === r && ci === c ? null : slot))
      ),
      tileRotations: activeLayout.tileRotations.map((row, ri) =>
        row.map((rot, ci) => (ri === r && ci === c ? 0 as const : rot))
      ),
    };
    updateLayout(updated);
  };

  const rotateTileSlot = (r: number, c: number) => {
    if (!activeLayout) return;
    const updated = {
      ...activeLayout,
      tileRotations: activeLayout.tileRotations.map((row, ri) =>
        row.map((rot, ci) =>
          ri === r && ci === c ? (((rot + 90) % 360) as 0 | 90 | 180 | 270) : rot
        )
      ),
    };
    updateLayout(updated);
  };

  // ---- Export ----

  const exportLayout = () => {
    if (!activeLayout) return;
    // Build MapTile[][] from layout
    const mapTiles: MapTile[][] = [];
    let tileId = 1;
    for (let r = 0; r < activeLayout.rows; r++) {
      const row: MapTile[] = [];
      for (let c = 0; c < activeLayout.cols; c++) {
        const templateId = activeLayout.tileSlots[r][c];
        const rotation = activeLayout.tileRotations[r][c];
        const template = templates.find((t) => t.id === templateId);
        const grid = template
          ? rotateGrid(template.grid, rotation)
          : createEmptyGrid();
        row.push({ id: tileId++, grid, rotation: 0 }); // rotation already applied
      }
      mapTiles.push(row);
    }
    const exported = { layout: activeLayout, templates, mapTiles };
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeLayout.name.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.templates && Array.isArray(data.templates)) {
          const existingIds = new Set(templates.map((t) => t.id));
          const newOnes = (data.templates as TileTemplate[]).filter((t) => !existingIds.has(t.id));
          for (const t of newOnes) await apiSaveTile(t);
          setTemplates((prev) => [...prev, ...newOnes]);
        }
        if (data.layout) {
          if (!layouts.some((l) => l.id === data.layout.id)) {
            await apiSaveLayout(data.layout);
            setLayouts((prev) => [...prev, data.layout]);
          }
          setActiveLayoutId(data.layout.id);
        }
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ---- Brush palette ----

  const brushes: { type: BrushType; label: string; color: string }[] = [
    { type: "empty", label: "Empty", color: "bg-amber-50 border-amber-200" },
    { type: "road", label: "Road", color: "bg-stone-400 text-white" },
    { type: "bridge_h", label: "Bridge —", color: "bg-stone-500 text-white" },
    { type: "bridge_v", label: "Bridge |", color: "bg-stone-500 text-white" },
    { type: "cul_n", label: "Cul \u25B4", color: "bg-stone-300" },
    { type: "cul_s", label: "Cul \u25BE", color: "bg-stone-300" },
    { type: "cul_e", label: "Cul \u25B8", color: "bg-stone-300" },
    { type: "cul_w", label: "Cul \u25C2", color: "bg-stone-300" },
    { type: "house", label: "House 2x2", color: "bg-amber-700 text-white" },
    { type: "apartment", label: "Apt 3x3", color: "bg-amber-800 text-white" },
    { type: "park", label: "Park 2x2", color: "bg-emerald-400 text-white" },
    { type: "drink_soda", label: "Soda", color: "bg-red-300" },
    { type: "drink_lemonade", label: "Lemon", color: "bg-yellow-300" },
    { type: "drink_beer", label: "Beer", color: "bg-green-300" },
  ];

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Map Editor</h1>
            <p className="text-sm text-stone-500">Design map tiles and arrange them into game maps. Saved to <code className="bg-stone-200 px-1 rounded text-xs">data/</code> as JSON files.</p>
          </div>
          <a href="/" className="text-sm text-teal-600 hover:underline">&larr; Home</a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ===== LEFT: Tile Editor ===== */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-stone-700">Tile Editor</h2>
                <button onClick={newTile} className="text-xs px-2 py-1 bg-stone-100 rounded hover:bg-stone-200">
                  + New
                </button>
              </div>

              {/* Brush palette */}
              <div className="flex flex-wrap gap-2 mb-4">
                {brushes.map((b) => (
                  <button
                    key={b.type}
                    onClick={() => setBrush(b.type)}
                    className={`px-3 py-1.5 rounded text-xs font-bold border-2 transition-all ${b.color} ${
                      brush === b.type ? "border-teal-500 shadow-md scale-105" : "border-transparent"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {(brush === "house" || brush === "apartment") && (
                <div className="mb-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-stone-600">
                    <span>{brush === "apartment" ? "Apt" : "House"} #:</span>
                    <input
                      type="number"
                      min={0.1}
                      step="any"
                      value={nextHouseNumber}
                      onChange={(e) => setNextHouseNumber(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                      className="w-20 px-2 py-1 border border-stone-300 rounded text-center font-bold"
                    />
                  </div>
                  <p className="text-[10px] text-stone-400">
                    {brush === "apartment"
                      ? "Click to place 3x3 apartment."
                      : "Click to place 2x2 house."}{" "}
                    Click existing block to change number. Use Empty to remove.
                  </p>
                </div>
              )}

              {/* 5x5 editor grid */}
              <div className="flex justify-center mb-4">
                <TileGridEditor
                  grid={tileGrid}
                  cellSize={56}
                  onCellClick={paintCell}
                  onCellDrag={dragPaintCell}
                  highlightEdges
                />
              </div>

              {/* Save controls */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tileName}
                  onChange={(e) => setTileName(e.target.value)}
                  placeholder="Tile name"
                  className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={saveTile}
                  className="px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 transition-colors"
                >
                  {editingTemplateId ? "Update" : "Save"}
                </button>
              </div>

              {/* Quick fill buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setTileGrid(createDefaultTileGrid())}
                  className="text-xs px-2 py-1 bg-stone-100 rounded hover:bg-stone-200"
                >
                  Fill Edges w/ Road
                </button>
                <button
                  onClick={() => setTileGrid(createEmptyGrid())}
                  className="text-xs px-2 py-1 bg-stone-100 rounded hover:bg-stone-200"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Tile Library */}
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-bold text-stone-700 mb-3">
                Tile Library <span className="text-sm font-normal text-stone-400">({templates.length})</span>
              </h2>
              {templates.length === 0 ? (
                <p className="text-sm text-stone-400">No tiles saved yet. Design a tile above and save it.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {templates.map((t) => (
                    <div
                      key={t.id}
                      className={`relative group rounded-lg p-2 border-2 transition-all cursor-pointer ${
                        editingTemplateId === t.id
                          ? "border-teal-500 bg-teal-50"
                          : placingTileId === t.id
                          ? "border-orange-400 bg-orange-50"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                      onClick={() => loadTile(t)}
                    >
                      <div className="flex justify-center">
                        <TilePreview grid={t.grid} size={18} />
                      </div>
                      <p className="text-[10px] text-stone-600 text-center mt-1 truncate">{t.name}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTile(t.id);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full hidden group-hover:flex items-center justify-center"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ===== RIGHT: Map Layout ===== */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-bold text-stone-700 mb-3">Map Layout</h2>

              {/* Create new layout */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs text-stone-500 self-center">New:</span>
                {[
                  { label: "2P (3x3)", rows: 3, cols: 3 },
                  { label: "3P (3x4)", rows: 3, cols: 4 },
                  { label: "4P (4x4)", rows: 4, cols: 4 },
                  { label: "5P (4x5)", rows: 4, cols: 5 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => createLayout(preset.rows, preset.cols)}
                    className="px-3 py-1.5 bg-teal-100 text-teal-700 text-xs font-bold rounded hover:bg-teal-200 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Layout list */}
              {layouts.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {layouts.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setActiveLayoutId(l.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded border-2 transition-all ${
                        activeLayoutId === l.id
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-stone-200 text-stone-600 hover:border-stone-300"
                      }`}
                    >
                      {l.name} ({l.rows}x{l.cols})
                    </button>
                  ))}
                </div>
              )}

              {activeLayout && (
                <>
                  {/* Layout name edit */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={activeLayout.name}
                      onChange={(e) => updateLayout({ ...activeLayout, name: e.target.value })}
                      className="flex-1 px-3 py-1.5 border border-stone-300 rounded text-sm focus:outline-none focus:border-teal-500"
                    />
                    <button
                      onClick={exportLayout}
                      className="px-3 py-1.5 bg-stone-700 text-white text-xs font-bold rounded hover:bg-stone-800"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={() => deleteLayout(activeLayout.id)}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Tile placement instruction */}
                  {placingTileId && (
                    <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                      Click a slot below to place the selected tile.{" "}
                      <button onClick={() => setPlacingTileId(null)} className="underline">
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Select tile for placement */}
                  {templates.length > 0 && !placingTileId && (
                    <div className="mb-3">
                      <p className="text-xs text-stone-500 mb-2">Select a tile to place on the map:</p>
                      <div className="flex flex-wrap gap-2">
                        {templates.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setPlacingTileId(t.id)}
                            className="flex items-center gap-1.5 px-2 py-1 border border-stone-200 rounded hover:border-teal-400 text-xs transition-colors"
                          >
                            <TilePreview grid={t.grid} size={10} />
                            <span>{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Map grid */}
                  <div className="overflow-auto pb-2">
                    <div
                      className="inline-grid gap-2"
                      style={{
                        gridTemplateColumns: `repeat(${activeLayout.cols}, 1fr)`,
                      }}
                    >
                      {activeLayout.tileSlots.map((row, r) =>
                        row.map((slotId, c) => {
                          const template = slotId ? templates.find((t) => t.id === slotId) : null;
                          const rotation = activeLayout.tileRotations[r][c];
                          return (
                            <div
                              key={`${r}-${c}`}
                              className={`relative border-2 rounded-lg p-1 min-w-[110px] min-h-[110px] flex flex-col items-center justify-center transition-all ${
                                placingTileId
                                  ? "border-orange-300 bg-orange-50/50 cursor-pointer hover:border-orange-500"
                                  : template
                                  ? "border-stone-300 bg-white"
                                  : "border-dashed border-stone-300 bg-stone-50"
                              }`}
                              onClick={() => {
                                if (placingTileId) placeTileOnSlot(r, c);
                              }}
                            >
                              <span className="absolute top-1 left-1.5 text-[9px] text-stone-400">
                                {r},{c}
                              </span>
                              {template ? (
                                <>
                                  <TilePreview
                                    grid={template.grid}
                                    size={18}
                                    rotation={rotation}
                                  />
                                  <p className="text-[9px] text-stone-500 mt-1">{template.name}</p>
                                  <div className="flex gap-1 mt-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        rotateTileSlot(r, c);
                                      }}
                                      className="text-[9px] px-1.5 py-0.5 bg-stone-100 rounded hover:bg-stone-200"
                                      title="Rotate 90°"
                                    >
                                      {rotation}°
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeTileFromSlot(r, c);
                                      }}
                                      className="text-[9px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <span className="text-xs text-stone-400">Empty</span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}

              {!activeLayout && layouts.length === 0 && (
                <p className="text-sm text-stone-400">Create a layout above to start arranging tiles.</p>
              )}
            </div>

            {/* Map Preview */}
            {activeLayout && (
              <div className="bg-white rounded-xl shadow p-5">
                <h2 className="text-lg font-bold text-stone-700 mb-3">Full Map Preview</h2>
                <div className="overflow-auto">
                  <div
                    className="inline-grid gap-0"
                    style={{
                      gridTemplateColumns: `repeat(${activeLayout.cols * 5}, 18px)`,
                      gridTemplateRows: `repeat(${activeLayout.rows * 5}, 18px)`,
                    }}
                  >
                    {(() => {
                      // Build full flat grid for house detection
                      const totalR = activeLayout.rows * 5;
                      const totalC = activeLayout.cols * 5;
                      const fullGrid: MapSquare[][] = [];
                      for (let ar = 0; ar < totalR; ar++) {
                        const row: MapSquare[] = [];
                        for (let ac = 0; ac < totalC; ac++) {
                          const tR = Math.floor(ar / 5);
                          const tC = Math.floor(ac / 5);
                          const iR = ar % 5;
                          const iC = ac % 5;
                          const slotId = activeLayout.tileSlots[tR]?.[tC];
                          const tmpl = slotId ? templates.find((t) => t.id === slotId) : null;
                          const rot = activeLayout.tileRotations[tR]?.[tC] ?? 0;
                          if (tmpl) {
                            const rotated = rotateGrid(tmpl.grid, rot);
                            row.push(rotated[iR]?.[iC] ?? { type: "empty" });
                          } else {
                            row.push({ type: "empty" });
                          }
                        }
                        fullGrid.push(row);
                      }
                      return fullGrid.flatMap((row, absR) =>
                        row.map((sq, absC) => {
                          const isTopEdge = absR % 5 === 0;
                          const isLeftEdge = absC % 5 === 0;
                          const hl = isHouselike(sq);
                          const isTL = hl &&
                            !(isHouselike(fullGrid[absR - 1]?.[absC]) && fullGrid[absR - 1][absC].houseNumber === sq.houseNumber) &&
                            !(isHouselike(fullGrid[absR]?.[absC - 1]) && fullGrid[absR][absC - 1].houseNumber === sq.houseNumber);
                          return (
                            <div
                              key={`${absR}-${absC}`}
                              className={`flex items-center justify-center text-[6px] font-bold
                                ${squareColor(sq)}
                                ${hl ? "text-white" : "text-stone-600"}
                                ${isTopEdge ? "border-t border-stone-400/40" : ""}
                                ${isLeftEdge ? "border-l border-stone-400/40" : ""}
                              `}
                            >
                              {hl
                                ? (isTL ? sq.houseNumber : "")
                                : squareLabel(sq)}
                            </div>
                          );
                        })
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Import/Export */}
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-bold text-stone-700 mb-3">Import / Export</h2>
              <div className="flex gap-3">
                <label className="px-4 py-2 bg-stone-100 text-stone-700 text-sm font-bold rounded-lg hover:bg-stone-200 cursor-pointer transition-colors">
                  Import JSON
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
                <button
                  onClick={exportLayout}
                  disabled={!activeLayout}
                  className="px-4 py-2 bg-stone-700 text-white text-sm font-bold rounded-lg hover:bg-stone-800 disabled:opacity-50 transition-colors"
                >
                  Export Current Layout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
