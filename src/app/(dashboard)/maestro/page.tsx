import { prisma } from "@/lib/prisma";
import { ProductList } from "@/components/maestro/product-list";
import { MasterProductList } from "@/components/maestro/master-product-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, BookOpen } from "lucide-react";

export default async function MaestroPage() {
  const [products, masterProducts, providers, foodGroups] = await Promise.all([
    prisma.product.findMany({
      include: {
        provider: true,
        masterProduct: {
          include: { foodGroup: true },
        },
      },
      orderBy: {
        masterProduct: { nombre: "asc" },
      },
    }),
    prisma.masterProduct.findMany({
      include: { foodGroup: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.provider.findMany({ orderBy: { razonSocial: "asc" } }),
    prisma.foodGroup.findMany({ orderBy: { id: "asc" } }),
  ]);

  return (
    <div className="p-6 space-y-6 w-full max-w-full overflow-hidden">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
          <Package className="h-6 w-6" /> Maestro de Productos
        </h1>
        <p className="text-muted-foreground">
          Gestiona el catálogo general y los productos por proveedor requeridos
          para el reporte (Res. 719).
        </p>
      </div>

      <Tabs defaultValue="catalogo" className="w-full">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="catalogo" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Catálogo General
          </TabsTrigger>
          <TabsTrigger value="proveedor" className="gap-2">
            <Package className="h-4 w-4" />
            Productos por Proveedor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalogo" className="mt-0">
          <MasterProductList
            masterProducts={masterProducts}
            foodGroups={foodGroups}
          />
        </TabsContent>

        <TabsContent value="proveedor" className="mt-0">
          <ProductList
            products={products}
            masterProducts={masterProducts}
            providers={providers}
            foodGroups={foodGroups}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
