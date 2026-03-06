import fs from "fs"
import path from "path"

type Menu = {
  restaurant: string
  phone: string
  address: string
  hours: string
  menuText: string
}

const filePath = path.join(process.cwd(), "data", "menus.json")

function readMenus() {
  const text = fs.readFileSync(filePath, "utf8")
  return JSON.parse(text)
}

function writeMenus(data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

export function saveMenu(id: string, data: Menu) {
  const menus = readMenus()
  menus[id] = data
  writeMenus(menus)
}

export function getMenu(id: string) {
  const menus = readMenus()
  return menus[id]
}