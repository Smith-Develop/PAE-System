import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Solo Super Admin" }, { status: 403 });
  }
  const tenants = await prisma.tenant.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tenants);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Solo Super Admin" }, { status: 403 });
  }
  const body = await request.json();
  const { name, slug, plan, active, maxUsers, aiScansLimit } = body;
  if (!name || !slug) return NextResponse.json({ error: "Nombre y slug requeridos" }, { status: 400 });
  try {
    const tenant = await prisma.tenant.create({ data: { name, slug: slug.toLowerCase().replace(/\s+/g, "-"), plan: plan || "free", active: active ?? true, maxUsers: maxUsers ?? 5, aiScansLimit: aiScansLimit ?? 10 } });
    return NextResponse.json(tenant, { status: 201 });
  } catch {
    return NextResponse.json({ error: "El slug ya existe" }, { status: 400 });
  }
}
