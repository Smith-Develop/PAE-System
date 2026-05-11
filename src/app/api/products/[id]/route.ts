import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.issues },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar el producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verificar si hay dependencias
    const [purchaseCount, orderMaterialCount, stockTxCount] = await Promise.all([
      prisma.purchase.count({ where: { productId: id } }),
      prisma.orderMaterial.count({ where: { productId: id } }),
      prisma.stockTransaction.count({ where: { productId: id } }),
    ]);

    if (purchaseCount > 0 || orderMaterialCount > 0 || stockTxCount > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar el producto porque está siendo usado en compras o pedidos." },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar el producto" },
      { status: 500 }
    );
  }
}
