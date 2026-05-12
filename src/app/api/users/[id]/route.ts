import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { logAction } from "@/lib/audit";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { name, email, password, roleId, active } = await request.json();

  const data: any = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (roleId) data.roleId = roleId;
  if (active !== undefined) data.active = active;
  if (password && password.length >= 6) {
    data.password = await hash(password, 12);
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: { select: { id: true, name: true } }, active: true },
    });

    await logAction({
      userId: session.user.id!,
      userEmail: session.user.email || "",
      userName: session.user.name || "",
      action: "UPDATE",
      entity: "user",
      entityId: id,
      details: JSON.stringify({ changes: Object.keys(data) }),
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json({ error: "No puedes eliminar tu propio usuario" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });

  await logAction({
    userId: session.user.id!,
    userEmail: session.user.email || "",
    userName: session.user.name || "",
    action: "DELETE",
    entity: "user",
    entityId: id,
  });

  return NextResponse.json({ message: "Eliminado" });
}
