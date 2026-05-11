import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { operatorSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = operatorSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.issues },
        { status: 400 }
      );
    }

    const operator = await prisma.operator.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(operator);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar el operador" },
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
    await prisma.operator.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Operador eliminado" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar el operador" },
      { status: 500 }
    );
  }
}
