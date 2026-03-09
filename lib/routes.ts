export const ROUTES = {
  home: "/",
  dashboard: "/uu/dashboard",
  login: "/uu/login",
} as const;

export function getDashboardEditPath(id: string) {
  return `${ROUTES.dashboard}/${encodeURIComponent(id)}`;
}

export function getPublicMenuPath(slugOrId: string) {
  return `/uu/menu/${encodeURIComponent(slugOrId)}`;
}
