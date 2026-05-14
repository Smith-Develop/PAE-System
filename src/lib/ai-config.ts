import { prisma } from "@/lib/prisma";

export async function isAIEnabled(): Promise<boolean> {
  try {
    const dbModel = await prisma.aIModel.findFirst({ where: { isDefault: true, active: true } });
    return !!dbModel;
  } catch {
    return false;
  }
}
