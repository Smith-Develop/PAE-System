import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { PurchaseList } from "@/components/compras/purchase-list";
import { Receipt } from "lucide-react";

export default async function ComprasPage() {
  const where = await withTenant();

  const [purchases, products, operators, clients] = await Promise.all([
    prisma.purchase.findMany({
      where,
      include: {
        product: {
          include: {
            provider: true,
            masterProduct: true,
          }
        },
        operator: true,
        client: true,
      },
      orderBy: { fechaCompra: "desc" },
    }),
    prisma.product.findMany({
      where,
      include: {
        provider: true,
        masterProduct: true,
      },
      orderBy: { 
        masterProduct: { nombre: "asc" } 
      },
    }),
    prisma.operator.findMany({
      where,
      orderBy: { nombreOperador: "asc" },
    }),
    prisma.client.findMany({
      where,
      orderBy: { nombre: "asc" },
    }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <Receipt className="h-6 w-6" /> Registro de Compras
          </h1>
          <p className="text-muted-foreground">
            Ingresa las facturas reales para alimentar el reporte y el inventario.
          </p>
        </div>
      </div>

      <PurchaseList 
        initialPurchases={purchases} 
        products={products} 
        operators={operators}
        clients={clients}
      />
    </div>
  );
}
