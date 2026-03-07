export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default function LegacyDashboardPage() {
  redirect("/uu/dashboard");
}
