import { prisma } from "@/lib/prisma";
import { RecipeList } from "@/components/recetas/recipe-list";
import { ChefHat } from "lucide-react";

export default async function RecetasPage() {
  const [recipes, products] = await Promise.all([
    prisma.recipe.findMany({
      include: {
        ingredients: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { nombre: "asc" },
    }),
    prisma.product.findMany({
      orderBy: { alimento: "asc" },
    }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <ChefHat className="h-6 w-6" /> Recetario
          </h1>
          <p className="text-muted-foreground">
            Define los menús y sus porciones unitarias (explosión de materiales).
          </p>
        </div>
      </div>

      <RecipeList recipes={recipes} products={products} />
    </div>
  );
}
