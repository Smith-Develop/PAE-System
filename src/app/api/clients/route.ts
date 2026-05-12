import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function GET() {
  const clients = await prisma.client.findMany({ orderBy: { nombre: "asc" } });
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = clientSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.issues }, { status: 400 });

    const client = await prisma.client.create({ data: result.data });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "CREATE", entity: "client", entityId: client.id, details: JSON.stringify({ nombre: client.nombre, nit: client.nit }) });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear" }, { status: 500 });
  }
}
