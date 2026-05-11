import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { menuSchema } from "@/lib/validations";

export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
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
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(menus);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los menús" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = menuSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.issues },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.create({
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

    return NextResponse.json(menu, { status: 201 });
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json(
      { error: "Error al crear el menú" },
      { status: 500 }
    );
  }
}
