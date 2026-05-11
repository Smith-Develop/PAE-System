import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { masterProductSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = masterProductSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.issues },
        { status: 400 }
      );
    }

    const product = await prisma.masterProduct.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar el producto del catálogo" },
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

    const linkedProducts = await prisma.product.count({
      where: { masterProductId: id },
    });

    if (linkedProducts > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar porque hay productos de proveedor asociados. Elimine esos productos primero.",
        },
        { status: 400 }
      );
    }

    await prisma.masterProduct.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar el producto del catálogo" },
      { status: 500 }
    );
  }
}
