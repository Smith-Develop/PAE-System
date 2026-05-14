import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!session.user.tenantId) return NextResponse.json({ name: null });

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: {
      id: true, name: true, slug: true, active: true,
      plan: { select: { id: true, name: true, maxUsers: true, aiScansLimit: true, price: true } },
      expirationDate: true, maxUsers: true, aiScansLimit: true, aiScansUsed: true,
      _count: { select: { users: true } },
    },
  });

  if (!tenant) return NextResponse.json({ name: null });

  return NextResponse.json(tenant);
}
