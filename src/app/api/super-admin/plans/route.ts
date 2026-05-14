import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Solo Super Admin" }, { status: 403 });
  }
  const plans = await prisma.plan.findMany({
    include: { _count: { select: { tenants: true } } },
    orderBy: { price: "asc" },
  });
  return NextResponse.json(plans);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Solo Super Admin" }, { status: 403 });
  }
  const body = await request.json();
  const { name, description, maxUsers, aiScansLimit, price, durationDays, active, mercadoPagoPlanId } = body;
  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  try {
    const plan = await prisma.plan.create({
      data: {
        name,
        description: description || null,
        maxUsers: maxUsers ?? 5,
        aiScansLimit: aiScansLimit ?? 10,
        price: price ?? 0,
        durationDays: durationDays ?? 30,
        active: active ?? true,
        mercadoPagoPlanId: mercadoPagoPlanId || null,
      },
    });
    await logAction({
      userId: session.user.id!,
      userEmail: session.user.email || "",
      userName: session.user.name || "",
      action: "CREATE",
      entity: "plan",
      entityId: plan.id,
      details: JSON.stringify({ name }),
    });
    return NextResponse.json(plan, { status: 201 });
  } catch {
    return NextResponse.json({ error: "El nombre del plan ya existe" }, { status: 400 });
  }
}
