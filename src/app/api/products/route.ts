import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { withTenant } from "@/lib/tenant";

export async function GET() {
  const where = await withTenant();
  return NextResponse.json(await prisma.product.findMany({
    where,
    include: { masterProduct: { include: { foodGroup: true } }, provider: true },
    orderBy: { masterProduct: { nombre: "asc" } },
  }));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = productSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.issues }, { status: 400 });

    const tenantId = (await auth())?.user?.tenantId;
    const product = await prisma.product.create({
      data: { ...result.data, currentStock: result.data.currentStock || 0, tenantId: tenantId || undefined },
      include: { masterProduct: true, provider: true },
    });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "CREATE", entity: "product", entityId: product.id, details: JSON.stringify({ descripcion: product.descripcionMarca }) });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear" }, { status: 500 });
  }
}
