import { prisma } from "@/lib/prisma";
import { PurchaseList } from "@/components/compras/purchase-list";
import { Receipt } from "lucide-react";

export default async function ComprasPage() {
  const [purchases, products, operators] = await Promise.all([
    prisma.purchase.findMany({
      include: {
        product: {
          include: {
            provider: true,
          }
        },
        operator: true,
      },
      orderBy: { fechaCompra: "desc" },
    }),
    prisma.product.findMany({
      include: {
        provider: true,
      },
      orderBy: { alimento: "asc" },
    }),
    prisma.operator.findMany({
      orderBy: { nombreOperador: "asc" },
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
      />
    </div>
  );
}
