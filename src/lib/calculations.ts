import type { PackingItem, SelectedMenu } from "@/types";

interface IngredientData {
  masterProductId: string;
  productName: string;
  unit: string;
  cantidadBrutaUnitaria: number;
}

interface DishData {
  id: string;
  nombre: string;
  componente: string;
  ingredients: IngredientData[];
}

interface MenuData {
  id: string;
  nombre: string;
  dishes: {
    dish: DishData;
  }[];
}

/**
 * Explosión de Materiales a partir de Menús:
 * Menu → MenuDish → Dish → DishIngredient → MasterProduct
 *
 * Fórmula: (Cantidad Bruta en gramos × Raciones) / 1000 = Total en Kg o L
 * Agrupa ingredientes idénticos (mismo masterProductId) sumando cantidades.
 */
export function calculatePackingList(
  selectedMenus: SelectedMenu[],
  menus: MenuData[]
): PackingItem[] {
  const productMap = new Map<string, PackingItem>();

  for (const selected of selectedMenus) {
    const menu = menus.find((m) => m.id === selected.menuId);
    if (!menu || selected.raciones <= 0) continue;

    for (const menuDish of menu.dishes || []) {
      const dish = menuDish.dish;
      if (!dish) continue;

      for (const ingredient of dish.ingredients) {
        const quantity =
          (ingredient.cantidadBrutaUnitaria * selected.raciones) / 1000;

        const existing = productMap.get(ingredient.masterProductId);
        if (existing) {
          existing.totalQuantity = roundTo3(
            existing.totalQuantity + quantity
          );
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
  }

  return Array.from(productMap.values()).sort((a, b) =>
    a.productName.localeCompare(b.productName)
  );
}

function roundTo3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
