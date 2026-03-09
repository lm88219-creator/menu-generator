export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  login: "/login",
} as const;

export function getDashboardEditPath(id: string) {
  return `${ROUTES.dashboard}/${encodeURIComponent(id)}`;
}

export function getPublicMenuPath(slugOrId: string) {
  return `/menu/${encodeURIComponent(slugOrId)}`;
}
