import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = clientSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.issues }, { status: 400 });

    const session = await auth();
    const tenantId = session?.user?.role === "SUPER_ADMIN" ? undefined : session?.user?.tenantId;
    const whereClause: any = { id };
    if (tenantId) whereClause.tenantId = tenantId;

    const client = await prisma.client.update({ where: whereClause, data: result.data });

    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "UPDATE", entity: "client", entityId: id, details: JSON.stringify({ nombre: client.nombre }) });

    return NextResponse.json(client);
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

    await prisma.client.delete({ where: whereClause });

    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "DELETE", entity: "client", entityId: id });

    return NextResponse.json({ message: "Cliente eliminado" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
