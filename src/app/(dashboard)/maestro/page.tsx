import { prisma } from "@/lib/prisma";
import { ProductList } from "@/components/maestro/product-list";
import { Package } from "lucide-react";

export default async function MaestroPage() {
  const [products, providers, foodGroups] = await Promise.all([
    prisma.product.findMany({
      include: {
        provider: true,
        foodGroup: true,
      },
      orderBy: { alimento: "asc" },
    }),
    prisma.provider.findMany({ orderBy: { razonSocial: "asc" } }),
    prisma.foodGroup.findMany({ orderBy: { id: "asc" } }),
  ]);

  return (
    <div className="p-6 space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <Package className="h-6 w-6" /> Maestro de Productos
          </h1>
          <p className="text-muted-foreground">
            Gestiona los productos, proveedores y datos requeridos para el reporte (Res. 719).
          </p>
        </div>
      </div>

      <ProductList products={products} providers={providers} foodGroups={foodGroups} />
    </div>
  );
}
