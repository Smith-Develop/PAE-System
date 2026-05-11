import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.masterProduct.findMany({
      include: {
        foodGroup: true,
        providerProducts: {
          include: {
            provider: true
          }
        }
      },
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener catálogo" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const product = await prisma.masterProduct.create({
      data: {
        nombre: body.nombre,
        unidadMedida: body.unidadMedida,
        foodGroupId: body.foodGroupId,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Error al crear producto maestro" }, { status: 500 });
  }
}
