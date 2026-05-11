import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { menuSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = menuSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.issues },
        { status: 400 }
      );
    }

    await prisma.menuDish.deleteMany({ where: { menuId: id } });

    const menu = await prisma.menu.update({
      where: { id },
      data: {
        nombre: result.data.nombre,
        descripcion: result.data.descripcion,
        dishes: {
          create: result.data.dishes.map((d) => ({
            dishId: d.dishId,
            orden: d.orden,
          })),
        },
      },
      include: {
        dishes: {
          include: {
            dish: {
              include: {
                ingredients: {
                  include: { masterProduct: true },
                },
              },
            },
          },
          orderBy: { orden: "asc" },
        },
      },
    });

    return NextResponse.json(menu);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar el menú" },
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

    const orderCount = await prisma.orderItem.count({
      where: { menuId: id },
    });

    if (orderCount > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el menú porque está siendo usado en pedidos.",
        },
        { status: 400 }
      );
    }

    await prisma.menu.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar el menú" },
      { status: 500 }
    );
  }
}
