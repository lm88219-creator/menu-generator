import fs from "fs";
import path from "path";

export type MenuRecord = {
  restaurant: string;
  menuText: string;
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

export function saveMenu(id: string, record: { restaurant: string; menuText: string }) {
  const all = readAll();
  all[id] = {
    restaurant: record.restaurant,
    menuText: record.menuText,
    createdAt: new Date().toISOString(),
  };
  writeAll(all);
}

export function getMenu(id: string): MenuRecord | null {
  const all = readAll();
  return all[id] ?? null;
}