import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Solo Super Admin" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  const { name, description, maxUsers, aiScansLimit, price, durationDays, active, mercadoPagoPlanId } = body;
  try {
    const plan = await prisma.plan.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(maxUsers !== undefined && { maxUsers }),
        ...(aiScansLimit !== undefined && { aiScansLimit }),
        ...(price !== undefined && { price }),
        ...(durationDays !== undefined && { durationDays }),
        ...(active !== undefined && { active }),
        ...(mercadoPagoPlanId !== undefined && { mercadoPagoPlanId }),
      },
    });
    await logAction({
      userId: session.user.id!,
      userEmail: session.user.email || "",
      userName: session.user.name || "",
      action: "UPDATE",
      entity: "plan",
      entityId: id,
      details: JSON.stringify({ changes: Object.keys(body) }),
    });
    return NextResponse.json(plan);
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Solo Super Admin" }, { status: 403 });
  }
  const { id } = await params;
  try {
    await prisma.plan.delete({ where: { id } });
    await logAction({
      userId: session.user.id!,
      userEmail: session.user.email || "",
      userName: session.user.name || "",
      action: "DELETE",
      entity: "plan",
      entityId: id,
    });
    return NextResponse.json({ message: "Plan eliminado" });
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
