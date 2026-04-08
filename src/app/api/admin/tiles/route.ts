import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const TILES_DIR = path.join(process.cwd(), "data/tiles");

async function ensureDir() {
  await fs.mkdir(TILES_DIR, { recursive: true });
}

// GET /api/admin/tiles — list all tile templates
export async function GET() {
  await ensureDir();
  const files = await fs.readdir(TILES_DIR);
  const tiles = await Promise.all(
    files
      .filter((f) => f.endsWith(".json"))
      .map(async (f) => {
        const raw = await fs.readFile(path.join(TILES_DIR, f), "utf-8");
        return JSON.parse(raw);
      })
  );
  return NextResponse.json(tiles);
}

// POST /api/admin/tiles — save (create or update) a tile template
export async function POST(req: NextRequest) {
  await ensureDir();
  const tile = await req.json();
  if (!tile.id || !tile.name) {
    return NextResponse.json({ error: "id and name required" }, { status: 400 });
  }
  const filePath = path.join(TILES_DIR, `${tile.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(tile, null, 2), "utf-8");
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/tiles?id=xxx — delete a tile template
export async function DELETE(req: NextRequest) {
  await ensureDir();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const filePath = path.join(TILES_DIR, `${id}.json`);
  try {
    await fs.unlink(filePath);
  } catch {
    // already gone
  }
  return NextResponse.json({ ok: true });
}
