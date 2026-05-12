import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { purchaseSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function GET() {
  return NextResponse.json(await prisma.purchase.findMany({ include: { product: { include: { masterProduct: true, provider: true } }, operator: true, client: true }, orderBy: { fechaCompra: "desc" } }));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = purchaseSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

    const purchase = await prisma.purchase.create({ data: result.data, include: { product: { include: { masterProduct: true } } } });

    const session = await auth();
    await logAction({ userId: session?.user?.id || "", userEmail: session?.user?.email || "", userName: session?.user?.name || "", action: "CREATE", entity: "purchase", entityId: purchase.id, details: JSON.stringify({ producto: purchase.product?.masterProduct?.nombre, valor: purchase.valorTotal }) });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) { return NextResponse.json({ error: "Error al crear" }, { status: 500 }); }
}
