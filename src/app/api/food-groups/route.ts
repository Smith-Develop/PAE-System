import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function GET() {
  const groups = await prisma.foodGroup.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(groups);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;
    if (!name) return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });

    const group = await prisma.foodGroup.create({ data: { name, description } });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "CREATE", entity: "foodGroup", entityId: group.id, details: JSON.stringify({ name }) });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear" }, { status: 500 });
  }
}
