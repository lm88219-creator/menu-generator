export const dynamic = "force-dynamic";

import { GET as getMenus, POST as postMenus } from "@/app/api/menus/route";

export async function GET() {
  return getMenus();
}

export async function POST(req: Request) {
  return postMenus(req);
}
