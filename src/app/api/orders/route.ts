import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { withTenant } from "@/lib/tenant";

export async function GET() {
  const where = await withTenant();
  const orders = await prisma.order.findMany({
    where,
    include: { client: true, operator: true, items: { select: { menuId: true, raciones: true } }, materials: { include: { masterProduct: true, product: { include: { provider: true } } } } },
    orderBy: { fecha: "desc" }, take: 50,
  });
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, materials, operatorId, clientId, nota } = body;
    if (!items?.length) return NextResponse.json({ error: "Items inválidos" }, { status: 400 });
    if (!operatorId) return NextResponse.json({ error: "Operador requerido" }, { status: 400 });
    if (!clientId) return NextResponse.json({ error: "Cliente requerido" }, { status: 400 });

    const tenantId = (await auth())?.user?.tenantId;
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          operatorId, clientId, nota, tenantId: tenantId || undefined,
          items: { create: items.map((i: any) => ({ menuId: i.menuId, raciones: i.raciones })) },
          materials: { create: (materials || []).map((m: any) => ({ masterProductId: m.masterProductId, productId: m.productId, cantidadTotal: m.cantidadTotal })) },
        },
        include: { client: true, operator: true, items: true, materials: { include: { masterProduct: true, product: { include: { provider: true } } } } },
      });
      for (const mat of materials || []) {
        await tx.product.update({ where: { id: mat.productId }, data: { currentStock: { decrement: mat.cantidadTotal } } });
        await tx.stockTransaction.create({ data: { productId: mat.productId, type: "SALIDA", quantity: mat.cantidadTotal, reason: `Pedido #${newOrder.id}` } });
      }
      return newOrder;
    });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "CREATE", entity: "order", entityId: order.id, details: JSON.stringify({ items: items.length, materials: materials?.length || 0 }) });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
