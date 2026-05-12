import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { menuSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = menuSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

    await prisma.menuDish.deleteMany({ where: { menuId: id } });
    const menu = await prisma.menu.update({
      where: { id }, data: { nombre: result.data.nombre, descripcion: result.data.descripcion, dishes: { create: result.data.dishes.map((d: any) => ({ dishId: d.dishId, orden: d.orden })) } },
      include: { dishes: { include: { dish: { include: { componente: true, ingredients: { include: { masterProduct: true } } } } }, orderBy: { orden: "asc" } } },
    });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "UPDATE", entity: "menu", entityId: id });
    return NextResponse.json(menu);
  } catch (error) { return NextResponse.json({ error: "Error al actualizar" }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const count = await prisma.orderItem.count({ where: { menuId: id } });
    if (count > 0) return NextResponse.json({ error: "Está en pedidos" }, { status: 400 });
    await prisma.menu.delete({ where: { id } });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "DELETE", entity: "menu", entityId: id });
    return new NextResponse(null, { status: 204 });
  } catch (error) { return NextResponse.json({ error: "Error al eliminar" }, { status: 500 }); }
}
