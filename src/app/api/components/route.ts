import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function GET() { return NextResponse.json(await prisma.component.findMany({ orderBy: { name: "asc" } })); }

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    const component = await prisma.component.create({ data: { name: name.trim() } });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "CREATE", entity: "component", entityId: component.id, details: JSON.stringify({ name }) });

    return NextResponse.json(component, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "Ya existe" }, { status: 400 });
    return NextResponse.json({ error: "Error al crear" }, { status: 500 });
  }
}
