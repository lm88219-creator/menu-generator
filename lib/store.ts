type Menu = {
  restaurant: string;
  menuText: string;
};

const menus: Record<string, Menu> = {};

export function saveMenu(id: string, data: Menu) {
  menus[id] = data;
}

export function getMenu(id: string) {
  return menus[id];
}