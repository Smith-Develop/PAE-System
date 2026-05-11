import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { providerSchema } from "@/lib/validations";

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      orderBy: { razonSocial: "asc" },
    });
    return NextResponse.json(providers);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener proveedores" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = providerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.issues },
        { status: 400 }
      );
    }

    const provider = await prisma.provider.create({
      data: result.data,
    });

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear proveedor" },
      { status: 500 }
    );
  }
}
