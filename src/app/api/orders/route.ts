import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        client: true,
        operator: true,
        items: {
          select: { menuId: true, raciones: true },
        },
        materials: {
          include: {
            masterProduct: true,
            product: {
              include: {
                provider: true,
              },
            },
          },
        },
      },
      orderBy: { fecha: "desc" },
      take: 50,
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, materials, operatorId, clientId, nota } = body;

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

    if (!clientId) {
      return NextResponse.json(
        { error: "Debe seleccionar un cliente" },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          operatorId,
          clientId,
          nota,
          items: {
            create: items.map((item: { menuId: string; raciones: number }) => ({
              menuId: item.menuId,
              raciones: item.raciones,
            })),
          },
          materials: {
            create: (materials || []).map((mat: any) => ({
              masterProductId: mat.masterProductId,
              productId: mat.productId,
              cantidadTotal: mat.cantidadTotal,
            })),
          }
        },
        include: {
          client: true,
          operator: true,
          items: true,
          materials: {
            include: {
              masterProduct: true,
              product: {
                include: { provider: true }
              }
            }
          }
        }
      });

      if (materials && Array.isArray(materials)) {
        for (const mat of materials) {
          await tx.product.update({
            where: { id: mat.productId },
            data: {
              currentStock: {
                decrement: mat.cantidadTotal,
              },
            },
          });

          await tx.stockTransaction.create({
            data: {
              productId: mat.productId,
              type: "SALIDA",
              quantity: mat.cantidadTotal,
              reason: `Pedido #${newOrder.id} - Explosión de materiales`,
            },
          });
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
