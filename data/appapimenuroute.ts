import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type MenuItem = { name: string; price: number };
type MenuRecord = {
  id: string;
  restaurant: string;
  items: MenuItem[];
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "menus.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "{}", "utf-8");
}

function readAll(): Record<string, MenuRecord> {
  ensureStore();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, MenuRecord>) {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2), "utf-8");
}

function genId() {
  // 簡單夠用：6~8 碼
  return Math.random().toString(36).slice(2, 8);
}

function parseMenu(menuText: string): MenuItem[] {
  return menuText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      // 允許「菜名 空格 價格」，菜名可含空格，取最後一段當價格
      const parts = line.split(/\s+/);
      const priceStr = parts.pop() ?? "";
      const name = parts.join(" ").trim();
      const price = Number(priceStr);

      if (!name || Number.isNaN(price)) {
        throw new Error(`菜單格式錯誤：${line}（請用：菜名 空格 價格）`);
      }
      return { name, price };
    });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const restaurant = String(body.restaurant ?? "").trim();
    const menuText = String(body.menuText ?? "").trim();

    if (!restaurant) {
      return NextResponse.json({ error: "請輸入餐廳名稱" }, { status: 400 });
    }
    if (!menuText) {
      return NextResponse.json({ error: "請輸入菜單內容" }, { status: 400 });
    }

    const items = parseMenu(menuText);

    const all = readAll();
    let id = genId();
    while (all[id]) id = genId();

    const record: MenuRecord = {
      id,
      restaurant,
      items,
      createdAt: new Date().toISOString(),
    };

    all[id] = record;
    writeAll(all);

    return NextResponse.json({ id });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = String(searchParams.get("id") ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  const all = readAll();
  const record = all[id];
  if (!record) {
    return NextResponse.json({ error: "找不到菜單" }, { status: 404 });
  }

  return NextResponse.json(record);
}