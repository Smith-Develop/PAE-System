import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recipeSchema } from "@/lib/validations";

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        ingredients: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(recipes);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener las recetas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = recipeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.issues },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.create({
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

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear la receta" },
      { status: 500 }
    );
  }
}
