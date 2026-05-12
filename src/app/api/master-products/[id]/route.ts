import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { masterProductSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = masterProductSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

    const product = await prisma.masterProduct.update({ where: { id }, data: result.data });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "UPDATE", entity: "masterProduct", entityId: id });

    return NextResponse.json(product);
  } catch (error) { return NextResponse.json({ error: "Error al actualizar" }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const count = await prisma.product.count({ where: { masterProductId: id } });
    if (count > 0) return NextResponse.json({ error: "Tiene productos de proveedor asociados" }, { status: 400 });
    await prisma.masterProduct.delete({ where: { id } });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "DELETE", entity: "masterProduct", entityId: id });

    return new NextResponse(null, { status: 204 });
  } catch (error) { return NextResponse.json({ error: "Error al eliminar" }, { status: 500 }); }
}
