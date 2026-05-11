import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const components = await prisma.component.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(components);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los componentes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre del componente es requerido" },
        { status: 400 }
      );
    }

    const component = await prisma.component.create({
      data: { name: name.trim() },
    });

    return NextResponse.json(component, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un componente con ese nombre" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al crear el componente" },
      { status: 500 }
    );
  }
}
