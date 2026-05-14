import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Solo Super Admin" }, { status: 403 });
  const { id } = await params;
  const body = await request.json();
  const { name, slug, planId, active, maxUsers, aiScansLimit } = body;
  try {
    const tenant = await prisma.tenant.update({
      where: { id },
      data: { name, slug: slug?.toLowerCase().replace(/\s+/g, "-"), planId: planId || null, active, ...(maxUsers !== undefined && { maxUsers }), ...(aiScansLimit !== undefined && { aiScansLimit }) },
    });
    return NextResponse.json(tenant);
  } catch { return NextResponse.json({ error: "Error al actualizar" }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Solo Super Admin" }, { status: 403 });
  const { id } = await params;
  try {
    await prisma.tenant.delete({ where: { id } });
    return NextResponse.json({ message: "Tenant eliminado" });
  } catch { return NextResponse.json({ error: "Error al eliminar" }, { status: 500 }); }
}
