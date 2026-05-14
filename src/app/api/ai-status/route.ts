import { NextResponse } from "next/server";
import { isAIEnabled } from "@/lib/ai-config";

export async function GET() {
  const enabled = await isAIEnabled();
  return NextResponse.json({ enabled });
}
