import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const LAYOUTS_DIR = path.join(process.cwd(), "data/layouts");

async function ensureDir() {
  await fs.mkdir(LAYOUTS_DIR, { recursive: true });
}

// GET /api/admin/layouts — list all map layouts
export async function GET() {
  await ensureDir();
  const files = await fs.readdir(LAYOUTS_DIR);
  const layouts = await Promise.all(
    files
      .filter((f) => f.endsWith(".json"))
      .map(async (f) => {
        const raw = await fs.readFile(path.join(LAYOUTS_DIR, f), "utf-8");
        return JSON.parse(raw);
      })
  );
  return NextResponse.json(layouts);
}

// POST /api/admin/layouts — save (create or update) a layout
export async function POST(req: NextRequest) {
  await ensureDir();
  const layout = await req.json();
  if (!layout.id || !layout.name) {
    return NextResponse.json({ error: "id and name required" }, { status: 400 });
  }
  const filePath = path.join(LAYOUTS_DIR, `${layout.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(layout, null, 2), "utf-8");
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/layouts?id=xxx — delete a layout
export async function DELETE(req: NextRequest) {
  await ensureDir();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const filePath = path.join(LAYOUTS_DIR, `${id}.json`);
  try {
    await fs.unlink(filePath);
  } catch {
    // already gone
  }
  return NextResponse.json({ ok: true });
}
