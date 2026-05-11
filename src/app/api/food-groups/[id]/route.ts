import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const group = await prisma.foodGroup.update({
      where: { id },
      data: { name, description },
    });

    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar el grupo alimentario" },
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
    
    // Verificar si tiene productos asociados
    const count = await prisma.masterProduct.count({
      where: { foodGroupId: id }
    });

    if (count > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un grupo que tiene productos asociados" },
        { status: 400 }
      );
    }

    await prisma.foodGroup.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Eliminado exitosamente" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar el grupo alimentario" },
      { status: 500 }
    );
  }
}
