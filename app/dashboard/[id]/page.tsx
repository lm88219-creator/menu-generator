export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default async function LegacyDashboardEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/uu/dashboard/${id}`);
}
