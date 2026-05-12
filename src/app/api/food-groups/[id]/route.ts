import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, description } = await request.json();
    const group = await prisma.foodGroup.update({ where: { id }, data: { name, description } });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "UPDATE", entity: "foodGroup", entityId: id, details: JSON.stringify({ name }) });

    return NextResponse.json(group);
  } catch (error) { return NextResponse.json({ error: "Error al actualizar" }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const count = await prisma.masterProduct.count({ where: { foodGroupId: id } });
    if (count > 0) return NextResponse.json({ error: "Tiene productos asociados" }, { status: 400 });
    await prisma.foodGroup.delete({ where: { id } });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "DELETE", entity: "foodGroup", entityId: id });

    return NextResponse.json({ message: "Eliminado" });
  } catch (error) { return NextResponse.json({ error: "Error al eliminar" }, { status: 500 }); }
}
