import { NextResponse } from "next/server";
import { getToolByIdOrSlug } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ toolId: string }>;
  },
) {
  const { toolId } = await context.params;
  const tool = await getToolByIdOrSlug(toolId);

  if (!tool) {
    return NextResponse.json({ error: "Tool not found." }, { status: 404 });
  }

  return NextResponse.json({ tool });
}
