import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const groups = await prisma.foodGroup.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { masterProducts: true }
        }
      }
    });
    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los grupos alimentarios" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const group = await prisma.foodGroup.create({
      data: { name, description },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Error creating food group:", error);
    return NextResponse.json(
      { error: "Error al crear el grupo alimentario" },
      { status: 500 }
    );
  }
}
