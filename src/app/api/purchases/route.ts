import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { purchaseSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearMonth = searchParams.get("month"); // Formato YYYY-MM
    
    let whereClause = {};
    if (yearMonth) {
      const [year, month] = yearMonth.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      
      whereClause = {
        fechaCompra: {
          gte: startDate,
          lte: endDate,
        }
      };
    }

    const purchases = await prisma.purchase.findMany({
      where: whereClause,
      include: {
        product: true,
      },
      orderBy: { fechaCompra: "desc" },
    });
    return NextResponse.json(purchases);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener las compras" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = purchaseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.issues },
        { status: 400 }
      );
    }

    const { productId, operatorId, cantidadComprada, fechaCompra, valorTotal } = result.data;

    // Usar una transacción de Prisma para asegurar consistencia
    const purchase = await prisma.$transaction(async (tx) => {
      // 1. Crear el registro de compra
      const newPurchase = await tx.purchase.create({
        data: {
          productId,
          operatorId,
          cantidadComprada,
          fechaCompra,
          valorTotal,
        },
      });

      // 2. Actualizar el stock del producto
      await tx.product.update({
        where: { id: productId },
        data: {
          currentStock: {
            increment: cantidadComprada,
          },
        },
      });

      // 3. Crear el historial de transacción de stock
      await tx.stockTransaction.create({
        data: {
          productId,
          type: "ENTRADA",
          quantity: cantidadComprada,
          reason: `Compra - Factura fecha ${fechaCompra.toLocaleDateString()}`,
        },
      });

      return newPurchase;
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Error al registrar la compra" },
      { status: 500 }
    );
  }
}
