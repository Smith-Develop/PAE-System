import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id }, include: { materials: true } });
    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      for (const mat of order.materials) {
        await tx.product.update({ where: { id: mat.productId }, data: { currentStock: { increment: mat.cantidadTotal } } });
        await tx.stockTransaction.create({ data: { productId: mat.productId, type: "ENTRADA", quantity: mat.cantidadTotal, reason: `Eliminación Pedido #${id}` } });
      }
      await tx.orderMaterial.deleteMany({ where: { orderId: id } });
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.order.delete({ where: { id } });
    });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "DELETE", entity: "order", entityId: id });

    return NextResponse.json({ message: "Pedido eliminado" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
