import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Solo Super Admin" }, { status: 403 });
  }
  const models = await prisma.aIModel.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(models);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Solo Super Admin" }, { status: 403 });
  }
  const body = await request.json();
  const { name, provider, modelId, apiKey, baseUrl, isDefault, active } = body;
  if (!name || !provider || !modelId) {
    return NextResponse.json({ error: "Nombre, proveedor y modelo requeridos" }, { status: 400 });
  }
  try {
    // Si es default, desactivar los otros
    if (isDefault) {
      await prisma.aIModel.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    }
    const model = await prisma.aIModel.create({
      data: { name, provider, modelId, apiKey: apiKey || "", baseUrl: baseUrl || null, isDefault: isDefault ?? false, active: active ?? true },
    });
    return NextResponse.json(model, { status: 201 });
  } catch {
    return NextResponse.json({ error: "El nombre ya existe" }, { status: 400 });
  }
}
