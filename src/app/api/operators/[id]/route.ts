import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { operatorSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = operatorSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.issues }, { status: 400 });

    const session = await auth();
    const tenantId = session?.user?.role === "SUPER_ADMIN" ? undefined : session?.user?.tenantId;
    const whereClause: any = { id };
    if (tenantId) whereClause.tenantId = tenantId;

    const operator = await prisma.operator.update({ where: whereClause, data: result.data });

    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "UPDATE", entity: "operator", entityId: id, details: JSON.stringify({ nombre: operator.nombreOperador }) });

    return NextResponse.json(operator);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const tenantId = session?.user?.role === "SUPER_ADMIN" ? undefined : session?.user?.tenantId;
    const whereClause: any = { id };
    if (tenantId) whereClause.tenantId = tenantId;

    await prisma.operator.delete({ where: whereClause });

    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "DELETE", entity: "operator", entityId: id });

    return NextResponse.json({ message: "Operador eliminado" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
