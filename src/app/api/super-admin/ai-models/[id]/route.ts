import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Solo Super Admin" }, { status: 403 });
  const { id } = await params;
  const body = await request.json();
  const { name, provider, modelId, apiKey, baseUrl, isDefault, active } = body;
  try {
    if (isDefault) {
      await prisma.aIModel.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    }
    const model = await prisma.aIModel.update({ where: { id }, data: { name, provider, modelId, apiKey, baseUrl, isDefault, active } });
    return NextResponse.json(model);
  } catch { return NextResponse.json({ error: "Error al actualizar" }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Solo Super Admin" }, { status: 403 });
  const { id } = await params;
  try {
    const model = await prisma.aIModel.findUnique({ where: { id } });
    if (model?.isDefault) return NextResponse.json({ error: "No se puede eliminar el modelo por defecto. Asigna otro primero." }, { status: 400 });
    await prisma.aIModel.delete({ where: { id } });
    return NextResponse.json({ message: "Modelo eliminado" });
  } catch { return NextResponse.json({ error: "Error al eliminar" }, { status: 500 }); }
}
