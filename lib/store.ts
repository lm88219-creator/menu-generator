import { Redis } from "@upstash/redis";
import { normalizeSlug } from "@/lib/menu";
import type { MenuData, MenuRecord, MenuSummaryRecord } from "@/lib/types/menu";

const redis = Redis.fromEnv();

const MENU_INDEX_KEY = "menus:index";
const MENU_SUMMARY_INDEX_KEY = "menus:summary:index";

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

function toMenuSummary(record: MenuRecord): MenuSummaryRecord {
  return {
    id: record.id,
    restaurant: record.restaurant,
    phone: record.phone,
    address: record.address,
    hours: record.hours,
    theme: record.theme,
    slug: record.slug,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    isPublished: record.isPublished,
    itemCount: countMenuItems(record.menuText),
    hasLogo: Boolean(record.logoDataUrl),
  };
}

async function writeMenuSummary(id: string, data: MenuData) {
  const summary = toMenuSummary({ id, ...data });
  await redis.set(getMenuSummaryKey(id), summary);
  await redis.sadd(MENU_SUMMARY_INDEX_KEY, id);
  return summary;
}

export async function createMenu(id: string, data: MenuData) {
  const slug = normalizeSlug(data.slug ?? "");
  const payload: MenuData = {
    ...data,
    slug: slug || undefined,
  };

  await redis.set(getMenuKey(id), payload);
  await redis.sadd(MENU_INDEX_KEY, id);
  await writeMenuSummary(id, payload);

  if (slug) {
    await redis.set(getSlugKey(slug), id);
  }

  return payload;
}

export async function getMenu(id: string): Promise<MenuData | null> {
  const data = await redis.get<MenuData>(getMenuKey(id));
  return data ?? null;
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

  const next: MenuData = {
    ...current,
    ...patch,
    slug: nextSlug || undefined,
    updatedAt: Date.now(),
  };

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

async function rebuildIndexesFromMenus(): Promise<Array<{ summary: MenuSummaryRecord }>> {
  const keys = await redis.keys("menu:*");
  const ids = keys
    .filter((key) => !key.startsWith("menu:slug:") && !key.startsWith("menu:summary:"))
    .map((key) => key.replace("menu:", ""));

  if (ids.length) {
    await redis.sadd(MENU_INDEX_KEY, ...(ids as [string, ...string[]]));
  }

  const records = await Promise.all(
    ids.map(async (id) => {
      const data = await getMenu(id);
      if (!data) return null;
      const summary = await writeMenuSummary(id, data);
      return { summary };
    })
  );

  return records.filter((item): item is { summary: MenuSummaryRecord } => Boolean(item));
}

export async function listMenus(): Promise<MenuRecord[]> {
  let ids = ((await redis.smembers(MENU_INDEX_KEY)) as string[] | null) ?? [];

  if (!ids.length) {
    await rebuildIndexesFromMenus();
    ids = ((await redis.smembers(MENU_INDEX_KEY)) as string[] | null) ?? [];
  }

  const menus = await Promise.all(
    ids.map(async (id) => {
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
  let ids = ((await redis.smembers(MENU_SUMMARY_INDEX_KEY)) as string[] | null) ?? [];

  if (!ids.length) {
    const rebuilt = await rebuildIndexesFromMenus();
    if (rebuilt.length) {
      return rebuilt
        .map((item) => item.summary)
        .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    }
    ids = ((await redis.smembers(MENU_SUMMARY_INDEX_KEY)) as string[] | null) ?? [];
  }

  const summaries = await Promise.all(
    ids.map(async (id) => {
      const summary = await redis.get<MenuSummaryRecord>(getMenuSummaryKey(id));
      if (summary) return summary;
      const data = await getMenu(id);
      if (!data) return null;
      return writeMenuSummary(id, data);
    })
  );

  return summaries
    .filter((item): item is MenuSummaryRecord => Boolean(item))
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}
