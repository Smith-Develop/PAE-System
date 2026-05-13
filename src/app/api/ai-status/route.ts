import { NextResponse } from "next/server";
import { AI_ENABLED } from "@/lib/ai-config";

export async function GET() {
  return NextResponse.json({ enabled: AI_ENABLED });
}
