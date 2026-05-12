import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";

// Solo admin puede acceder
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
  }

  const { entity } = await request.json();
  if (!entity) return NextResponse.json({ error: "Entidad requerida" }, { status: 400 });

  try {
    await logAction({
      userId: session.user.id!,
      userEmail: session.user.email || "",
      userName: session.user.name || "",
      action: "MAINTENANCE",
      entity: entity,
      details: JSON.stringify({ action: "delete_all" }),
    });

    switch (entity) {
      case "providers":
        await prisma.product.deleteMany();
        await prisma.provider.deleteMany();
        break;
      case "operators":
        await prisma.orderMaterial.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.stockTransaction.deleteMany();
        await prisma.order.deleteMany();
        await prisma.operator.deleteMany();
        break;
      case "clients":
        await prisma.orderMaterial.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.stockTransaction.deleteMany();
        await prisma.order.deleteMany();
        await prisma.client.deleteMany();
        break;
      case "foodGroups":
        await prisma.dishIngredient.deleteMany();
        await prisma.menuDish.deleteMany();
        await prisma.menu.deleteMany();
        await prisma.dish.deleteMany();
        await prisma.orderMaterial.deleteMany();
        await prisma.product.deleteMany();
        await prisma.masterProduct.deleteMany();
        await prisma.foodGroup.deleteMany();
        break;
      case "dishes":
        await prisma.menuDish.deleteMany();
        await prisma.dishIngredient.deleteMany();
        await prisma.menu.deleteMany();
        await prisma.dish.deleteMany();
        break;
      case "menus":
        await prisma.orderItem.deleteMany();
        await prisma.orderMaterial.deleteMany();
        await prisma.stockTransaction.deleteMany();
        await prisma.order.deleteMany();
        await prisma.menuDish.deleteMany();
        await prisma.menu.deleteMany();
        break;
      case "orders":
        await prisma.orderMaterial.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.stockTransaction.deleteMany();
        await prisma.order.deleteMany();
        break;
      case "purchases":
        await prisma.purchase.deleteMany();
        break;
      case "products":
        await prisma.orderMaterial.deleteMany();
        await prisma.purchase.deleteMany();
        await prisma.stockTransaction.deleteMany();
        await prisma.product.deleteMany();
        break;
      case "masterProducts":
        await prisma.dishIngredient.deleteMany();
        await prisma.menuDish.deleteMany();
        await prisma.menu.deleteMany();
        await prisma.dish.deleteMany();
        await prisma.orderMaterial.deleteMany();
        await prisma.purchase.deleteMany();
        await prisma.product.deleteMany();
        await prisma.masterProduct.deleteMany();
        break;
      case "all":
        await prisma.stockTransaction.deleteMany();
        await prisma.orderMaterial.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.menuDish.deleteMany();
        await prisma.menu.deleteMany();
        await prisma.dishIngredient.deleteMany();
        await prisma.dish.deleteMany();
        await prisma.purchase.deleteMany();
        await prisma.product.deleteMany();
        await prisma.masterProduct.deleteMany();
        await prisma.foodGroup.deleteMany();
        await prisma.provider.deleteMany();
        await prisma.operator.deleteMany();
        await prisma.client.deleteMany();
        break;
      default:
        return NextResponse.json({ error: "Entidad no reconocida" }, { status: 400 });
    }
    return NextResponse.json({ message: `Entidad "${entity}" eliminada correctamente` });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
