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

function ensureFile() {
  const dir = path.dirname(filePath)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "{}", "utf8")
  }
}

function readMenus(): Record<string, Menu> {
  ensureFile()

  try {
    const text = fs.readFileSync(filePath, "utf8")
    return JSON.parse(text || "{}")
  } catch {
    return {}
  }
}

function writeMenus(data: Record<string, Menu>) {
  ensureFile()
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8")
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