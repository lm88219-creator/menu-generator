import { redirect } from "next/navigation";
export default async function LegacyEditRedirect({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; redirect(`/uu/dashboard/${id}`); }
