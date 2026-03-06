export const dynamic = "force-dynamic";

import { listMenus } from "@/lib/store";

export async function GET() {
  try {
    const menus = await listMenus();
    return Response.json({ menus });
  } catch (error) {
    console.error("GET /api/menus error:", error);
    return Response.json({ menus: [] }, { status: 500 });
  }
}
