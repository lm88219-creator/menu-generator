export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function LegacyDashboardPage() {
  redirect(ROUTES.dashboard);
}
