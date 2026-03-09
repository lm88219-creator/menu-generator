export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getDashboardEditPath } from "@/lib/routes";

export default async function LegacyUuDashboardEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(getDashboardEditPath(id));
}
