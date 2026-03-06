type MenuData = {
  restaurant: string;
  menuText: string;
};

const menus: Record<string, MenuData> = {};

export function saveMenu(id: string, data: MenuData) {
  menus[id] = data;
}

export function getMenu(id: string) {
  return menus[id] || null;
}