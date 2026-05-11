import { prisma } from "@/lib/prisma";
import { MenuList } from "@/components/recetas/menu-list";
import { DishList } from "@/components/recetas/dish-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, UtensilsCrossed } from "lucide-react";

export default async function RecetasPage() {
  const [dishes, menus, masterProducts, components] = await Promise.all([
    prisma.dish.findMany({
      include: {
        componente: true,
        ingredients: {
          include: { masterProduct: true },
        },
      },
      orderBy: { componente: { name: "asc" } },
    }),
    prisma.menu.findMany({
      include: {
        dishes: {
          include: {
            dish: {
              include: {
                componente: true,
                ingredients: {
                  include: { masterProduct: true },
                },
              },
            },
          },
          orderBy: { orden: "asc" },
        },
      },
      orderBy: { nombre: "asc" },
    }),
    prisma.masterProduct.findMany({
      orderBy: { nombre: "asc" },
    }),
    prisma.component.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="p-6 space-y-6 w-full max-w-full overflow-hidden">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
          <ChefHat className="h-6 w-6" /> Recetario
        </h1>
        <p className="text-muted-foreground">
          Define los platos individuales y agrúpalos en menús para la explosión
          de materiales.
        </p>
      </div>

      <Tabs defaultValue="dishes" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dishes" className="gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Platos
          </TabsTrigger>
          <TabsTrigger value="menus" className="gap-2">
            <ChefHat className="h-4 w-4" />
            Menús
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dishes" className="mt-0">
          <DishList dishes={dishes} masterProducts={masterProducts} components={components} />
        </TabsContent>

        <TabsContent value="menus" className="mt-0">
          <MenuList menus={menus} dishes={dishes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
