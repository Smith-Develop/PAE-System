import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { providerSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = providerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.issues },
        { status: 400 }
      );
    }

    const provider = await prisma.provider.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(provider);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar proveedor" },
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
    
    // Verificar dependencias
    const productCount = await prisma.product.count({ where: { providerId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar porque hay productos vinculados a este proveedor." },
        { status: 400 }
      );
    }

    await prisma.provider.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar proveedor" },
      { status: 500 }
    );
  }
}
