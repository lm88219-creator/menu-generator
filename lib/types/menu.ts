import type { ThemeType } from "@/lib/theme";

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

export type MenuSummaryRecord = Omit<MenuRecord, "menuText"> & {
  itemCount: number;
};
