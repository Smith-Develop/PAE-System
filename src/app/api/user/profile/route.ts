import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { name, email } = await request.json();
  const data: any = {};
  if (name?.trim()) data.name = name.trim();
  if (email?.trim()) {
    const exists = await prisma.user.findFirst({ where: { email: email.trim(), id: { not: session.user.id } } });
    if (exists) return NextResponse.json({ error: "Email en uso" }, { status: 400 });
    data.email = email.trim();
  }
  if (!Object.keys(data).length) return NextResponse.json({ error: "Sin cambios" }, { status: 400 });

  const user = await prisma.user.update({ where: { id: session.user.id }, data, select: { id: true, email: true, name: true } });

  await logAction({ userId: session.user.id, userEmail: session.user.email || "", userName: session.user.name || "", action: "UPDATE", entity: "profile", entityId: session.user.id, details: JSON.stringify(data) });

  return NextResponse.json(user);
}
