import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const roles = await prisma.role.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
  return NextResponse.json(roles);
}
