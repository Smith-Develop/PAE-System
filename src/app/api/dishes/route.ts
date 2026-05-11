import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dishSchema } from "@/lib/validations";

export async function GET() {
  try {
    const dishes = await prisma.dish.findMany({
      include: {
        componente: true,
        ingredients: {
          include: { masterProduct: true },
        },
      },
      orderBy: { componente: { name: "asc" } },
    });
    return NextResponse.json(dishes);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los platos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = dishSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.issues },
        { status: 400 }
      );
    }

    const dish = await prisma.dish.create({
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

    return NextResponse.json(dish, { status: 201 });
  } catch (error) {
    console.error("Error creating dish:", error);
    return NextResponse.json(
      { error: "Error al crear el plato" },
      { status: 500 }
    );
  }
}
