import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, operatorId, nota } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items inválidos" },
        { status: 400 }
      );
    }

    if (!operatorId) {
      return NextResponse.json(
        { error: "Debe seleccionar un operador" },
        { status: 400 }
      );
    }

    // Usar una transacción de Prisma para asegurar consistencia
    const order = await prisma.$transaction(async (tx) => {
      // 1. Crear el pedido
      const newOrder = await tx.order.create({
        data: {
          operatorId,
          nota,
          items: {
            create: items.map((item: { recipeId: string; raciones: number }) => ({
              recipeId: item.recipeId,
              raciones: item.raciones,
            })),
          },
        },
      });

      // 2. Explosión de materiales y deducción de stock
      for (const item of items) {
        // Obtener ingredientes de la receta
        const recipe = await tx.recipe.findUnique({
          where: { id: item.recipeId },
          include: { ingredients: true },
        });

        if (recipe) {
          for (const ingredient of recipe.ingredients) {
            // Calcular cantidad total (gramos/ml a Kilos/Litros)
            // (Cantidad Bruta * Raciones) / 1000
            const quantityToSubtract = (ingredient.cantidadBrutaUnitaria * item.raciones) / 1000;

            // Actualizar stock del producto
            await tx.product.update({
              where: { id: ingredient.productId },
              data: {
                currentStock: {
                  decrement: quantityToSubtract,
                },
              },
            });

            // Registrar transacción de stock
            await tx.stockTransaction.create({
              data: {
                productId: ingredient.productId,
                type: "SALIDA",
                quantity: quantityToSubtract,
                reason: `Pedido #${newOrder.id} - Receta: ${recipe.nombre}`,
              },
            });
          }
        }
      }

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Error al guardar el pedido" },
      { status: 500 }
    );
  }
}
