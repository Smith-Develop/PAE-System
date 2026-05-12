import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    const component = await prisma.component.update({ where: { id }, data: { name: name.trim() } });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "UPDATE", entity: "component", entityId: id });

    return NextResponse.json(component);
  } catch (e: any) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const count = await prisma.dish.count({ where: { componenteId: id } });
    if (count > 0) return NextResponse.json({ error: "Tiene platos asociados" }, { status: 400 });
    await prisma.component.delete({ where: { id } });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "DELETE", entity: "component", entityId: id });

    return new NextResponse(null, { status: 204 });
  } catch (e: any) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
