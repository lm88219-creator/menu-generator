import { Redis } from "@upstash/redis";
import { normalizeSlug } from "@/lib/menu";
import type { ThemeType } from "@/lib/theme";

const redis = Redis.fromEnv();


export type MenuData = {
  restaurant: string;
  phone?: string;
  address?: string;
  hours?: string;
  menuText: string;
  theme?: ThemeType;
  logoDataUrl?: string;
  slug?: string;
  createdAt?: number;
  updatedAt?: number;
  isPublished?: boolean;
};

export type MenuRecord = MenuData & {
  id: string;
};

const MENU_INDEX_KEY = "menus:index";

function getMenuKey(id: string) {
  return `menu:${id}`;
}

function getSlugKey(slug: string) {
  return `menu:slug:${slug}`;
}

export async function createMenu(id: string, data: MenuData) {
  const slug = normalizeSlug(data.slug ?? "");
  const payload: MenuData = {
    ...data,
    slug: slug || undefined,
  };

  await redis.set(getMenuKey(id), payload);
  await redis.sadd(MENU_INDEX_KEY, id);

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
  await redis.srem(MENU_INDEX_KEY, id);

  const slug = normalizeSlug(current?.slug ?? "");
  if (slug) {
    await redis.del(getSlugKey(slug));
  }
}

export async function listMenus(): Promise<MenuRecord[]> {
  let ids = ((await redis.smembers(MENU_INDEX_KEY)) as string[] | null) ?? [];

  if (!ids.length) {
    const keys = await redis.keys("menu:*");
    ids = keys
      .filter((key) => !key.startsWith("menu:slug:"))
      .map((key) => key.replace("menu:", ""));

    if (ids.length) {
    await redis.sadd(MENU_INDEX_KEY, ...(ids as [string, ...string[]]));
    }
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
