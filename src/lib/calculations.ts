import type { PackingItem, SelectedMenu } from "@/types";

interface IngredientData {
  masterProductId: string;
  productName: string;
  unit: string;
  cantidadBrutaUnitaria: number; // en gramos o mililitros
}

interface RecipeData {
  id: string;
  nombre: string;
  ingredients: IngredientData[];
}

/**
 * Explosión de Materiales:
 * Calcula la lista de empaque consolidada a partir de los menús seleccionados.
 * 
 * Fórmula: (Cantidad Bruta en gramos × Raciones) / 1000 = Total en Kg o L
 * Agrupa ingredientes idénticos (mismo masterProductId) sumando cantidades.
 */
export function calculatePackingList(
  selectedMenus: SelectedMenu[],
  recipes: RecipeData[]
): PackingItem[] {
  const productMap = new Map<string, PackingItem>();

  for (const menu of selectedMenus) {
    const recipe = recipes.find((r) => r.id === menu.recipeId);
    if (!recipe || menu.raciones <= 0) continue;

    for (const ingredient of recipe.ingredients) {
      // Fórmula: (gramos * raciones) / 1000 = Kg o L
      const quantity = (ingredient.cantidadBrutaUnitaria * menu.raciones) / 1000;

      const existing = productMap.get(ingredient.masterProductId);
      if (existing) {
        // Agrupar: sumar cantidades del mismo producto
        existing.totalQuantity = roundTo3(existing.totalQuantity + quantity);
      } else {
        productMap.set(ingredient.masterProductId, {
          masterProductId: ingredient.masterProductId,
          productName: ingredient.productName,
          unit: ingredient.unit,
          totalQuantity: roundTo3(quantity),
        });
      }
    }
  }

  return Array.from(productMap.values()).sort((a, b) =>
    a.productName.localeCompare(b.productName)
  );
}

/**
 * Redondea a 3 decimales para evitar errores de punto flotante en JS.
 */
function roundTo3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
