import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, description } = await request.json();
    const session = await auth();
    const tenantId = session?.user?.role === "SUPER_ADMIN" ? undefined : session?.user?.tenantId;
    const whereClause: any = { id };
    if (tenantId) whereClause.tenantId = tenantId;

    const group = await prisma.foodGroup.update({ where: whereClause, data: { name, description } });

    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "UPDATE", entity: "foodGroup", entityId: id, details: JSON.stringify({ name }) });

    return NextResponse.json(group);
  } catch (error) { return NextResponse.json({ error: "Error al actualizar" }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const tenantId = session?.user?.role === "SUPER_ADMIN" ? undefined : session?.user?.tenantId;
    const whereClause: any = { id };
    if (tenantId) whereClause.tenantId = tenantId;

    const count = await prisma.masterProduct.count({ where: { foodGroupId: id } });
    if (count > 0) return NextResponse.json({ error: "Tiene productos asociados" }, { status: 400 });
    await prisma.foodGroup.delete({ where: whereClause });

    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "DELETE", entity: "foodGroup", entityId: id });

    return NextResponse.json({ message: "Eliminado" });
  } catch (error) { return NextResponse.json({ error: "Error al eliminar" }, { status: 500 }); }
}
