import { prisma } from "@/lib/prisma";
import { StockList } from "@/components/bodega/stock-list";
import { Warehouse } from "lucide-react";

export default async function BodegaPage() {
  const products = await prisma.product.findMany({
    include: {
      provider: true,
      foodGroup: true,
    },
    orderBy: { alimento: "asc" },
  });

  return (
    <div className="p-6 space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <Warehouse className="h-6 w-6" /> Bodega / Inventario
          </h1>
          <p className="text-muted-foreground">
            Control de existencias y trazabilidad de movimientos de insumos.
          </p>
        </div>
      </div>

      <StockList initialProducts={products} />
    </div>
  );
}
