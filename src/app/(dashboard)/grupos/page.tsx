import { prisma } from "@/lib/prisma";
import { GroupList } from "@/components/grupos/group-list";
import { ProductsByGroup } from "@/components/grupos/products-by-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Box } from "lucide-react";

export default async function GruposPage() {
  const [groups, masterProducts] = await Promise.all([
    prisma.foodGroup.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { masterProducts: true } },
      },
    }),
    prisma.masterProduct.findMany({
      include: { foodGroup: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  return (
    <div className="p-6 space-y-6 w-full max-w-full overflow-hidden">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
          <Layers className="h-6 w-6" /> Grupos Alimentarios (Res 719)
        </h1>
        <p className="text-muted-foreground">
          Gestión de los grupos alimentarios y los productos del catálogo
          asociados según la normativa vigente.
        </p>
      </div>

      <Tabs defaultValue="grupos" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="grupos" className="gap-2">
            <Layers className="h-4 w-4" />
            Grupos Alimentarios
          </TabsTrigger>
          <TabsTrigger value="productos" className="gap-2">
            <Box className="h-4 w-4" />
            Productos por Grupo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grupos" className="mt-0">
          <GroupList initialGroups={groups} />
        </TabsContent>

        <TabsContent value="productos" className="mt-0">
          <ProductsByGroup
            masterProducts={masterProducts}
            foodGroups={groups}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
