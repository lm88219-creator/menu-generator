export const dynamic = "force-dynamic";

import { isAdminAuthenticated } from "@/lib/auth";
import { listMenuSummaries } from "@/lib/store";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "請先登入管理員後台", menus: [] }, { status: 401 });
  }
  try {
    const menus = await listMenuSummaries();
    return Response.json({ menus });
  } catch {
    return Response.json({ menus: [] }, { status: 500 });
  }
}
