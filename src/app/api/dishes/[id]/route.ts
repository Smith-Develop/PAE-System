import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dishSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = dishSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

    await prisma.dishIngredient.deleteMany({ where: { dishId: id } });
    const dish = await prisma.dish.update({
      where: { id }, data: { nombre: result.data.nombre, componenteId: result.data.componenteId, descripcion: result.data.descripcion, ingredients: { create: result.data.ingredients.map((i: any) => ({ masterProductId: i.masterProductId, cantidadBrutaUnitaria: i.cantidadBrutaUnitaria })) } },
      include: { componente: true, ingredients: { include: { masterProduct: true } } },
    });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "UPDATE", entity: "dish", entityId: id });
    return NextResponse.json(dish);
  } catch (error) { return NextResponse.json({ error: "Error al actualizar" }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const count = await prisma.menuDish.count({ where: { dishId: id } });
    if (count > 0) return NextResponse.json({ error: "Está en menús" }, { status: 400 });
    await prisma.dish.delete({ where: { id } });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "DELETE", entity: "dish", entityId: id });
    return new NextResponse(null, { status: 204 });
  } catch (error) { return NextResponse.json({ error: "Error al eliminar" }, { status: 500 }); }
}
