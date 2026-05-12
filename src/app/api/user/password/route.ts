import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { logAction } from "@/lib/audit";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { currentPassword, newPassword } = await request.json();
  if (!currentPassword || !newPassword || newPassword.length < 6) return NextResponse.json({ error: "Datos inválidos (mín 6 chars)" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !(await compare(currentPassword, user.password))) return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 400 });

  await prisma.user.update({ where: { id: session.user.id }, data: { password: await hash(newPassword, 12) } });

  await logAction({ userId: session.user.id, userEmail: session.user.email || "", userName: session.user.name || "", action: "PASSWORD", entity: "user", entityId: session.user.id });

  return NextResponse.json({ message: "Contraseña actualizada" });
}
