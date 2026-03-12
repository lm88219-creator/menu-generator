export const dynamic = "force-dynamic";

import {
  GET as getMenuById,
  PATCH as patchMenuById,
  DELETE as deleteMenuById,
} from "@/app/api/menus/[id]/route";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: Params) {
  return getMenuById(req, context);
}

export async function PATCH(req: Request, context: Params) {
  return patchMenuById(req, context);
}

export async function DELETE(req: Request, context: Params) {
  return deleteMenuById(req, context);
}
