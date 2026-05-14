import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dishSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { withTenant } from "@/lib/tenant";

export async function GET() {
  const where = await withTenant();
  return NextResponse.json(await prisma.dish.findMany({ where, include: { componente: true, ingredients: { include: { masterProduct: true } } }, orderBy: { componente: { name: "asc" } } }));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = dishSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

    const tenantId = (await auth())?.user?.tenantId;
    const dish = await prisma.dish.create({
      data: { nombre: result.data.nombre, componenteId: result.data.componenteId, descripcion: result.data.descripcion, tenantId: tenantId || undefined, ingredients: { create: result.data.ingredients.map((i: any) => ({ masterProductId: i.masterProductId, cantidadBrutaUnitaria: i.cantidadBrutaUnitaria })) } },
      include: { componente: true, ingredients: { include: { masterProduct: true } } },
    });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "CREATE", entity: "dish", entityId: dish.id, details: JSON.stringify({ nombre: dish.nombre }) });

    return NextResponse.json(dish, { status: 201 });
  } catch (error) { return NextResponse.json({ error: "Error al crear" }, { status: 500 }); }
}
