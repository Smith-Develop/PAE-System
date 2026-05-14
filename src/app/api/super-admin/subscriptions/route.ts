import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Solo Super Admin" }, { status: 403 });
  }
  const body = await request.json();
  const { tenantId, planId, amount, startDate, endDate } = body;

  if (!tenantId || !planId) {
    return NextResponse.json({ error: "tenantId y planId requeridos" }, { status: 400 });
  }

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    return NextResponse.json({ error: "Plan no encontrado" }, { status: 400 });
  }

  const now = new Date();
  const subStart = startDate ? new Date(startDate) : now;
  const subEnd = endDate ? new Date(endDate) : new Date(subStart.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  // Deactivate previous active subscriptions for this tenant
  await prisma.subscription.updateMany({
    where: { tenantId, active: true },
    data: { active: false },
  });

  const subscription = await prisma.subscription.create({
    data: {
      tenantId,
      planId,
      amount: amount ?? plan.price * plan.durationDays,
      startDate: subStart,
      endDate: subEnd,
      active: true,
    },
  });

  // Update tenant with plan data
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      planId,
      plan: undefined,
      maxUsers: plan.maxUsers,
      aiScansLimit: plan.aiScansLimit,
      aiScansUsed: 0,
      aiScansReset: now,
      expirationDate: subEnd,
    },
  });

  await logAction({
    userId: session.user.id!,
    userEmail: session.user.email || "",
    userName: session.user.name || "",
    action: "CREATE",
    entity: "subscription",
    entityId: subscription.id,
    details: JSON.stringify({ tenantId, planId, amount: subscription.amount }),
  });

  return NextResponse.json(subscription, { status: 201 });
}
