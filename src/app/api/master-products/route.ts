import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { masterProductSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function GET() {
  return NextResponse.json(await prisma.masterProduct.findMany({ include: { foodGroup: true, providerProducts: { include: { provider: true } } }, orderBy: { nombre: "asc" } }));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = masterProductSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

    const product = await prisma.masterProduct.create({ data: result.data });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "CREATE", entity: "masterProduct", entityId: product.id, details: JSON.stringify({ nombre: product.nombre }) });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear" }, { status: 500 });
  }
}
