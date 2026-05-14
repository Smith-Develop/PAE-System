import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const session = await auth();
    const tenantId = session?.user?.role === "SUPER_ADMIN" ? undefined : session?.user?.tenantId;
    const whereClause: any = { id };
    if (tenantId) whereClause.tenantId = tenantId;

    const purchase = await prisma.purchase.update({ where: whereClause, data });
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "UPDATE", entity: "purchase", entityId: id });
    return NextResponse.json(purchase);
  } catch (error) { return NextResponse.json({ error: "Error al actualizar" }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const tenantId = session?.user?.role === "SUPER_ADMIN" ? undefined : session?.user?.tenantId;
    const whereClause: any = { id };
    if (tenantId) whereClause.tenantId = tenantId;

    await prisma.purchase.delete({ where: whereClause });
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "DELETE", entity: "purchase", entityId: id });
    return NextResponse.json({ message: "Eliminado" });
  } catch (error) { return NextResponse.json({ error: "Error al eliminar" }, { status: 500 }); }
}
