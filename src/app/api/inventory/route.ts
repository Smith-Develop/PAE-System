import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        provider: true,
        masterProduct: {
          include: { foodGroup: true },
        },
      },
      orderBy: { masterProduct: { nombre: "asc" } },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener el inventario" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID requerido" }, { status: 400 });
    }

    const transactions = await prisma.stockTransaction.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener el historial" },
      { status: 500 }
    );
  }
}
