import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = productSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

    const session = await auth();
    const tenantId = session?.user?.role === "SUPER_ADMIN" ? undefined : session?.user?.tenantId;
    const whereClause: any = { id };
    if (tenantId) whereClause.tenantId = tenantId;

    const product = await prisma.product.update({ where: whereClause, data: result.data });
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "UPDATE", entity: "product", entityId: id });
    return NextResponse.json(product);
  } catch (error) { return NextResponse.json({ error: "Error al actualizar" }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const tenantId = session?.user?.role === "SUPER_ADMIN" ? undefined : session?.user?.tenantId;
    const whereClause: any = { id };
    if (tenantId) whereClause.tenantId = tenantId;

    const [purchaseCount, orderMatCount] = await Promise.all([
      prisma.purchase.count({ where: { productId: id } }),
      prisma.orderMaterial.count({ where: { productId: id } }),
    ]);
    if (purchaseCount > 0 || orderMatCount > 0) return NextResponse.json({ error: "Está en uso" }, { status: 400 });
    await prisma.product.delete({ where: whereClause });

    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "DELETE", entity: "product", entityId: id });
    return new NextResponse(null, { status: 204 });
  } catch (error) { return NextResponse.json({ error: "Error al eliminar" }, { status: 500 }); }
}
