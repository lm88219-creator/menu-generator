import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export type MenuData = {
  restaurant: string;
  phone?: string;
  address?: string;
  hours?: string;
  menuText: string;
  theme?: string;
  logoDataUrl?: string;
};

export async function saveMenu(id: string, data: MenuData) {
  await redis.set(`menu:${id}`, data);
}

export async function getMenu(id: string): Promise<MenuData | null> {
  const data = await redis.get<MenuData>(`menu:${id}`);
  return data ?? null;
}