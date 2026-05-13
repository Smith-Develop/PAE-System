import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { operatorId, clientId, fechaCompra, items } = await request.json();
    if (!operatorId || !fechaCompra || !items?.length) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const purchases = await prisma.$transaction(
      items.map((item: any) =>
        prisma.purchase.create({
          data: {
            productId: item.productId,
            operatorId,
            clientId: clientId || null,
            fechaCompra: new Date(fechaCompra),
            precioUnitario: item.precioUnitario || 0,
            cantidadComprada: item.cantidadComprada,
            valorTotal: item.valorTotal,
          },
          include: { product: { include: { masterProduct: true, provider: true } }, operator: true, client: true },
        })
      )
    );

    await logAction({
      userId: session.user.id!,
      userEmail: session.user.email || "",
      userName: session.user.name || "",
      action: "CREATE",
      entity: "purchase_batch",
      details: JSON.stringify({ count: items.length }),
    });

    return NextResponse.json({ purchases, count: purchases.length }, { status: 201 });
  } catch (e: any) {
    console.error("Batch purchase error:", e);
    return NextResponse.json({ error: "Error al guardar compras" }, { status: 500 });
  }
}
