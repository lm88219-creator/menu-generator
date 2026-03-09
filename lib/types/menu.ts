
import type { ThemeType } from "@/lib/theme";

export type MenuData = {
  schemaVersion?: number;
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

export type MenuSummaryRecord = {
  id: string;
  restaurant: string;
  theme?: ThemeType;
  slug?: string;
  createdAt?: number;
  updatedAt?: number;
  isPublished?: boolean;
  itemCount: number;
  hasLogo: boolean;
  missingInfoCount?: number;
  schemaVersion?: number;
};
