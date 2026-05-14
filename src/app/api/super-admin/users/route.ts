import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { logAction } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true,
      role: { select: { id: true, name: true } },
      tenant: { select: { id: true, name: true, slug: true } },
      active: true, createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { name, email, password, roleId, tenantId } = await request.json();

  if (!name || !email || !password || !roleId) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 400 });
  }

  const hashed = await hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name, email, password: hashed, roleId, active: true,
      tenantId: tenantId || null,
    },
    select: {
      id: true, name: true, email: true,
      role: { select: { id: true, name: true } },
      tenant: { select: { id: true, name: true, slug: true } },
      active: true, createdAt: true,
    },
  });

  await logAction({
    userId: session.user.id!,
    userEmail: session.user.email || "",
    userName: session.user.name || "",
    action: "CREATE",
    entity: "user",
    entityId: user.id,
    details: JSON.stringify({ name: user.name, email: user.email }),
  });

  return NextResponse.json(user, { status: 201 });
}
