import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Exportar toda la BD como JSON (backup)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const [
      users, roles, operators, clients, providers,
      foodGroups, masterProducts, components,
      dishes, dishIngredients, menus, menuDishes,
      orders, orderItems, orderMaterials,
      products, purchases, stockTransactions,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.role.findMany(),
      prisma.operator.findMany(),
      prisma.client.findMany(),
      prisma.provider.findMany(),
      prisma.foodGroup.findMany(),
      prisma.masterProduct.findMany(),
      prisma.component.findMany(),
      prisma.dish.findMany(),
      prisma.dishIngredient.findMany(),
      prisma.menu.findMany(),
      prisma.menuDish.findMany(),
      prisma.order.findMany(),
      prisma.orderItem.findMany(),
      prisma.orderMaterial.findMany(),
      prisma.product.findMany(),
      prisma.purchase.findMany(),
      prisma.stockTransaction.findMany(),
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      data: {
        users, roles, operators, clients, providers,
        foodGroups, masterProducts, components,
        dishes, dishIngredients, menus, menuDishes,
        orders, orderItems, orderMaterials,
        products, purchases, stockTransactions,
      },
    };

    return NextResponse.json(backup, {
      headers: {
        "Content-Disposition": `attachment; filename="backup-pae-${new Date().toISOString().slice(0, 10)}.json"`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json({ error: "Error al generar backup" }, { status: 500 });
  }
}

// POST: Restaurar BD desde JSON (backup)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const backup = await request.json();

    if (!backup?.data) {
      return NextResponse.json({ error: "Archivo de backup inválido" }, { status: 400 });
    }

    const d = backup.data;

    await prisma.$transaction(async (tx) => {
      // Limpiar datos existentes (orden por dependencias FK)
      await tx.stockTransaction.deleteMany();
      await tx.orderMaterial.deleteMany();
      await tx.orderItem.deleteMany();
      await tx.order.deleteMany();
      await tx.menuDish.deleteMany();
      await tx.menu.deleteMany();
      await tx.dishIngredient.deleteMany();
      await tx.dish.deleteMany();
      await tx.purchase.deleteMany();
      await tx.product.deleteMany();
      await tx.masterProduct.deleteMany();
      await tx.foodGroup.deleteMany();
      await tx.component.deleteMany();
      await tx.provider.deleteMany();
      await tx.operator.deleteMany();
      await tx.client.deleteMany();
      await tx.user.deleteMany();
      await tx.role.deleteMany();

      // Restaurar datos
      if (d.roles?.length) await tx.role.createMany({ data: d.roles });
      if (d.users?.length) await tx.user.createMany({ data: d.users });
      if (d.operators?.length) await tx.operator.createMany({ data: d.operators });
      if (d.clients?.length) await tx.client.createMany({ data: d.clients });
      if (d.providers?.length) await tx.provider.createMany({ data: d.providers });
      if (d.foodGroups?.length) await tx.foodGroup.createMany({ data: d.foodGroups });
      if (d.masterProducts?.length) await tx.masterProduct.createMany({ data: d.masterProducts });
      if (d.components?.length) await tx.component.createMany({ data: d.components });
      if (d.dishes?.length) await tx.dish.createMany({ data: d.dishes });
      if (d.dishIngredients?.length) await tx.dishIngredient.createMany({ data: d.dishIngredients });
      if (d.menus?.length) await tx.menu.createMany({ data: d.menus });
      if (d.menuDishes?.length) await tx.menuDish.createMany({ data: d.menuDishes });
      if (d.orders?.length) await tx.order.createMany({ data: d.orders });
      if (d.orderItems?.length) await tx.orderItem.createMany({ data: d.orderItems });
      if (d.orderMaterials?.length) await tx.orderMaterial.createMany({ data: d.orderMaterials });
      if (d.products?.length) await tx.product.createMany({ data: d.products });
      if (d.purchases?.length) await tx.purchase.createMany({ data: d.purchases });
      if (d.stockTransactions?.length) await tx.stockTransaction.createMany({ data: d.stockTransactions });
    });

    return NextResponse.json({ message: "Base de datos restaurada exitosamente" });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json({ error: "Error al restaurar el backup" }, { status: 500 });
  }
}
