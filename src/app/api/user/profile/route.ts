import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { name, email } = await request.json();

  const data: any = {};
  if (name && typeof name === "string" && name.trim()) {
    data.name = name.trim();
  }
  if (email && typeof email === "string" && email.trim()) {
    const exists = await prisma.user.findFirst({
      where: { email: email.trim(), id: { not: session.user.id } },
    });
    if (exists) {
      return NextResponse.json({ error: "El email ya está en uso" }, { status: 400 });
    }
    data.email = email.trim();
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Sin cambios" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json(user);
}
