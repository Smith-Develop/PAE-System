import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { providerSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { withTenant } from "@/lib/tenant";

export async function GET() {
  const where = await withTenant();
  const providers = await prisma.provider.findMany({ where, orderBy: { razonSocial: "asc" } });
  return NextResponse.json(providers);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = providerSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.issues }, { status: 400 });

    const tenantId = (await auth())?.user?.tenantId;
    const provider = await prisma.provider.create({ data: { ...result.data, tenantId: tenantId || undefined } });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "CREATE", entity: "provider", entityId: provider.id, details: JSON.stringify({ razonSocial: provider.razonSocial, nit: provider.nit }) });

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear proveedor" }, { status: 500 });
  }
}
