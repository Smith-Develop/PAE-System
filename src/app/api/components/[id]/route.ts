import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre del componente es requerido" },
        { status: 400 }
      );
    }

    const component = await prisma.component.update({
      where: { id },
      data: { name: name.trim() },
    });

    return NextResponse.json(component);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un componente con ese nombre" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al actualizar el componente" },
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

    const dishCount = await prisma.dish.count({
      where: { componenteId: id },
    });

    if (dishCount > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el componente porque tiene platos asociados. Reasigne esos platos primero.",
        },
        { status: 400 }
      );
    }

    await prisma.component.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar el componente" },
      { status: 500 }
    );
  }
}
