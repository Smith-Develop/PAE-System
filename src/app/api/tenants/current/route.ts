import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      tenantId: true,
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
          planId: true,
          plan: { select: { name: true } },
          expirationDate: true,
          maxUsers: true,
          aiScansLimit: true,
          aiScansUsed: true,
          active: true,
        },
      },
    },
  });

  if (!user?.tenant) {
    return NextResponse.json({ tenant: null });
  }

  return NextResponse.json({ tenant: user.tenant });
}
