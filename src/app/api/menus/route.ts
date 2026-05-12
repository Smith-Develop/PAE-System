import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { menuSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function GET() {
  return NextResponse.json(await prisma.menu.findMany({ include: { dishes: { include: { dish: { include: { componente: true, ingredients: { include: { masterProduct: true } } } } }, orderBy: { orden: "asc" } } }, orderBy: { nombre: "asc" } }));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = menuSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

    const menu = await prisma.menu.create({
      data: { nombre: result.data.nombre, descripcion: result.data.descripcion, dishes: { create: result.data.dishes.map((d: any) => ({ dishId: d.dishId, orden: d.orden })) } },
      include: { dishes: { include: { dish: { include: { componente: true, ingredients: { include: { masterProduct: true } } } } }, orderBy: { orden: "asc" } } },
    });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "CREATE", entity: "menu", entityId: menu.id, details: JSON.stringify({ nombre: menu.nombre, platos: result.data.dishes.length }) });

    return NextResponse.json(menu, { status: 201 });
  } catch (error) { return NextResponse.json({ error: "Error al crear" }, { status: 500 }); }
}
