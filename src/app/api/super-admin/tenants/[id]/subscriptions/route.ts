import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Solo Super Admin" }, { status: 403 });
  }
  const { id } = await params;

  const subscriptions = await prisma.subscription.findMany({
    where: { tenantId: id },
    include: {
      plan: { select: { name: true } },
    },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(subscriptions);
}
