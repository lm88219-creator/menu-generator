import { Redis } from "@upstash/redis";
import { normalizeSlug } from "@/lib/menu";
import { normalizeTheme } from "@/lib/theme";
import type { MenuData, MenuRecord, MenuSummaryRecord } from "@/lib/types/menu";

const redis = Redis.fromEnv();

const MENU_INDEX_KEY = "menus:index";
const MENU_SUMMARY_INDEX_KEY = "menus:summary:index";
const MENU_SCHEMA_VERSION = 2;

function getMenuKey(id: string) {
  return `menu:${id}`;
}

function getMenuSummaryKey(id: string) {
  return `menu:summary:${id}`;
}

function getSlugKey(slug: string) {
  return `menu:slug:${slug}`;
}

function countMenuItems(menuText: string) {
  return String(menuText || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => Boolean(line) && !/^#/.test(line) && !/^[\[【].+[\]】]$/.test(line) && line.split(/\s+/).length > 1).length;
}

function countMissingInfo(record: MenuData) {
  const checklist = [record.phone, record.address, record.hours, record.logoDataUrl];
  return checklist.filter((value) => !String(value ?? "").trim()).length;
}

function normalizeMenuData(data: MenuData | null | undefined): MenuData | null {
  if (!data) return null;

  return {
    schemaVersion: MENU_SCHEMA_VERSION,
    restaurant: String(data.restaurant ?? "").trim(),
    phone: String(data.phone ?? "").trim(),
    address: String(data.address ?? "").trim(),
    hours: String(data.hours ?? "").trim(),
    closedDay: String(data.closedDay ?? "").trim(),
    menuText: String(data.menuText ?? "").trim(),
    theme: normalizeTheme(data.theme),
    logoDataUrl: String(data.logoDataUrl ?? "").trim(),
    coverImageDataUrl: String(data.coverImageDataUrl ?? "").trim(),
    slug: normalizeSlug(data.slug ?? "") || undefined,
    createdAt: Number(data.createdAt ?? 0) || undefined,
    updatedAt: Number(data.updatedAt ?? 0) || undefined,
    isPublished: data.isPublished !== false,
  };
}

function toMenuSummary(record: MenuRecord): MenuSummaryRecord {
  return {
    id: record.id,
    restaurant: record.restaurant,
    theme: record.theme,
    slug: record.slug,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    isPublished: record.isPublished,
    itemCount: countMenuItems(record.menuText),
    hasLogo: Boolean(record.logoDataUrl),
    missingInfoCount: countMissingInfo(record),
    schemaVersion: MENU_SCHEMA_VERSION,
  };
}

async function writeMenuSummary(id: string, data: MenuData) {
  const normalized = normalizeMenuData(data);
  if (!normalized) return null;

  const summary = toMenuSummary({ id, ...normalized });
  await redis.set(getMenuSummaryKey(id), summary);
  await redis.sadd(MENU_SUMMARY_INDEX_KEY, id);
  return summary;
}

async function readIndexedIds() {
  const [menuIds, summaryIds] = await Promise.all([
    redis.smembers(MENU_INDEX_KEY) as Promise<string[] | null>,
    redis.smembers(MENU_SUMMARY_INDEX_KEY) as Promise<string[] | null>,
  ]);

  const ids = Array.from(new Set([...(menuIds ?? []), ...(summaryIds ?? [])].filter(Boolean)));
  if (ids.length) return ids;

  const summaryKeys = ((await redis.keys("menu:summary:*") as string[]) ?? []).map((key) => key.replace("menu:summary:", ""));
  if (summaryKeys.length) {
    await redis.sadd(MENU_SUMMARY_INDEX_KEY, ...(summaryKeys as [string, ...string[]]));
  }
  return summaryKeys;
}

export async function createMenu(id: string, data: MenuData) {
  const normalized = normalizeMenuData(data);
  if (!normalized) return null;

  await redis.set(getMenuKey(id), normalized);
  await redis.sadd(MENU_INDEX_KEY, id);
  await writeMenuSummary(id, normalized);

  if (normalized.slug) {
    await redis.set(getSlugKey(normalized.slug), id);
  }

  return normalized;
}

export async function getMenu(id: string): Promise<MenuData | null> {
  const data = await redis.get<MenuData>(getMenuKey(id));
  const normalized = normalizeMenuData(data);
  if (!normalized) return null;

  if (
    normalized.schemaVersion !== data?.schemaVersion ||
    normalized.theme !== data?.theme ||
    normalized.slug !== data?.slug ||
    normalized.closedDay !== data?.closedDay ||
    normalized.coverImageDataUrl !== data?.coverImageDataUrl
  ) {
    await redis.set(getMenuKey(id), normalized);
    await writeMenuSummary(id, normalized);
  }

  return normalized;
}

export async function getMenuIdBySlug(slug: string) {
  const safeSlug = normalizeSlug(slug);
  if (!safeSlug) return null;
  const id = await redis.get<string>(getSlugKey(safeSlug));
  return id ?? null;
}

export async function isSlugAvailable(slug: string, excludeId?: string) {
  const safeSlug = normalizeSlug(slug);
  if (!safeSlug) return true;

  const existingId = await redis.get<string>(getSlugKey(safeSlug));
  if (!existingId) return true;
  return existingId === excludeId;
}

export async function updateMenu(id: string, patch: Partial<MenuData>) {
  const current = await getMenu(id);
  if (!current) return null;

  const previousSlug = normalizeSlug(current.slug ?? "");
  const nextSlug = normalizeSlug(patch.slug ?? current.slug ?? "");

  const next = normalizeMenuData({
    ...current,
    ...patch,
    slug: nextSlug || undefined,
    updatedAt: Date.now(),
  });

  if (!next) return null;

  await redis.set(getMenuKey(id), next);
  await redis.sadd(MENU_INDEX_KEY, id);
  await writeMenuSummary(id, next);

  if (previousSlug && previousSlug !== nextSlug) {
    await redis.del(getSlugKey(previousSlug));
  }

  if (nextSlug) {
    await redis.set(getSlugKey(nextSlug), id);
  }

  return next;
}

export async function deleteMenu(id: string) {
  const current = await getMenu(id);
  await redis.del(getMenuKey(id));
  await redis.del(getMenuSummaryKey(id));
  await redis.srem(MENU_INDEX_KEY, id);
  await redis.srem(MENU_SUMMARY_INDEX_KEY, id);

  const slug = normalizeSlug(current?.slug ?? "");
  if (slug) {
    await redis.del(getSlugKey(slug));
  }
}

export async function listMenus(): Promise<MenuRecord[]> {
  const ids = await readIndexedIds();

  const menus = await Promise.all(
    ids.map(async (id: string) => {
      const data = await getMenu(id);
      if (!data) return null;
      return {
        id,
        ...data,
      } satisfies MenuRecord;
    })
  );

  return menus
    .filter((item): item is MenuRecord => Boolean(item))
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

export async function listMenuSummaries(): Promise<MenuSummaryRecord[]> {
  const ids = await readIndexedIds();

  const summaries = await Promise.all(
    ids.map(async (id: string) => {
      const summary = await redis.get<MenuSummaryRecord>(getMenuSummaryKey(id));
      if (summary) return summary;
      const data = await getMenu(id);
      if (!data) return null;
      return writeMenuSummary(id, data);
    })
  );

  return summaries
    .filter((item: MenuSummaryRecord | null): item is MenuSummaryRecord => Boolean(item))
    .sort((a: MenuSummaryRecord, b: MenuSummaryRecord) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}
