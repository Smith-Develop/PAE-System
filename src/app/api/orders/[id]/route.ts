import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { materials: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Restaurar stock de los materiales despachados
      for (const mat of order.materials) {
        await tx.product.update({
          where: { id: mat.productId },
          data: {
            currentStock: { increment: mat.cantidadTotal },
          },
        });

        await tx.stockTransaction.create({
          data: {
            productId: mat.productId,
            type: "ENTRADA",
            quantity: mat.cantidadTotal,
            reason: `Eliminación Pedido #${order.id} - Stock restaurado`,
          },
        });
      }

      // Eliminar en orden: materiales, items, pedido
      await tx.orderMaterial.deleteMany({ where: { orderId: id } });
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.order.delete({ where: { id } });
    });

    return NextResponse.json({ message: "Pedido eliminado y stock restaurado" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Error al eliminar el pedido" },
      { status: 500 }
    );
  }
}
