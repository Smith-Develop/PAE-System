import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        masterProduct: {
          include: { foodGroup: true }
        },
        provider: true,
      },
      orderBy: { 
        masterProduct: { nombre: "asc" } 
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los productos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.issues },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        masterProductId: result.data.masterProductId,
        providerId: result.data.providerId,
        descripcionMarca: result.data.descripcionMarca,
        registroSanitario: result.data.registroSanitario,
        currentStock: result.data.currentStock,
      },
      include: {
        masterProduct: true,
        provider: true,
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear el producto" },
      { status: 500 }
    );
  }
}
