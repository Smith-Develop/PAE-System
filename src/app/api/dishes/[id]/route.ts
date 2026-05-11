import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dishSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = dishSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.issues },
        { status: 400 }
      );
    }

    // Already deleted ingredients above; now update dish
    await prisma.dishIngredient.deleteMany({ where: { dishId: id } });

    const dish = await prisma.dish.update({
      where: { id },
      data: {
        nombre: result.data.nombre,
        componenteId: result.data.componenteId,
        descripcion: result.data.descripcion,
        ingredients: {
          create: result.data.ingredients.map((ing) => ({
            masterProductId: ing.masterProductId,
            cantidadBrutaUnitaria: ing.cantidadBrutaUnitaria,
          })),
        },
      },
      include: {
        componente: true,
        ingredients: {
          include: { masterProduct: true },
        },
      },
    });

    return NextResponse.json(dish);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar el plato" },
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

    const menuCount = await prisma.menuDish.count({
      where: { dishId: id },
    });

    if (menuCount > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el plato porque está incluido en uno o más menús.",
        },
        { status: 400 }
      );
    }

    await prisma.dish.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar el plato" },
      { status: 500 }
    );
  }
}
