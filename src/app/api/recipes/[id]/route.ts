import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recipeSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = recipeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.issues },
        { status: 400 }
      );
    }

    // Delete existing ingredients and recreate them (easier than diffing)
    await prisma.recipeIngredient.deleteMany({
      where: { recipeId: id },
    });

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        nombre: result.data.nombre,
        descripcion: result.data.descripcion,
        ingredients: {
          create: result.data.ingredients.map((ing) => ({
            componente: ing.componente,
            preparacion: ing.preparacion,
            cantidadBrutaUnitaria: ing.cantidadBrutaUnitaria,
            productId: ing.productId,
          })),
        },
      },
      include: {
        ingredients: true,
      },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar la receta" },
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

    // Check if recipe is used in orders
    const orderCount = await prisma.orderItem.count({
      where: { recipeId: id },
    });

    if (orderCount > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar la receta porque está siendo usada en pedidos históricos." },
        { status: 400 }
      );
    }

    await prisma.recipe.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar la receta" },
      { status: 500 }
    );
  }
}
