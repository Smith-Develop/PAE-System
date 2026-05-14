import { prisma } from "@/lib/prisma";

export async function isAIEnabled(): Promise<boolean> {
  try {
    // Primero verificar si hay un modelo configurado en DB
    const dbModel = await prisma.aIModel.findFirst({ where: { isDefault: true, active: true } });
    if (dbModel) return true;
    // Fallback: verificar env var
    return !!process.env.GEMINI_API_KEY;
  } catch {
    return !!process.env.GEMINI_API_KEY;
  }
}
