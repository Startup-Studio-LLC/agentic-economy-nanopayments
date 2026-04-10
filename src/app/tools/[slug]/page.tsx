import { notFound } from "next/navigation";
import { BuyerConsole } from "@/components/buyer-console";
import { ToolCard } from "@/components/tool-card";
import { getRequestedModeFromCookies, resolvePaymentMode } from "@/lib/env";
import { getProviderStatus } from "@/lib/payment";
import { getToolByIdOrSlug, listRecentInvocations } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mode = resolvePaymentMode(await getRequestedModeFromCookies());
  const tool = await getToolByIdOrSlug(slug);
  const invocations = await listRecentInvocations(8);

  if (!tool) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <ToolCard tool={tool} />
      <BuyerConsole
        tool={tool}
        initialInvocations={invocations}
        paymentMode={mode}
        providerStatus={getProviderStatus(mode)}
      />
    </div>
  );
}
