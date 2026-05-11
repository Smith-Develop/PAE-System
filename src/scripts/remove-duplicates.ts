import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando limpieza de duplicados...");

  // 1. Limpiar FoodGroups (por nombre)
  const foodGroups = await prisma.foodGroup.findMany();
  const fgMap = new Map();
  for (const fg of foodGroups) {
    if (fgMap.has(fg.name)) {
      console.log(`Eliminando FoodGroup duplicado: ${fg.name} (${fg.id})`);
      await prisma.foodGroup.delete({ where: { id: fg.id } });
    } else {
      fgMap.set(fg.name, fg.id);
    }
  }

  // 2. Limpiar Providers (por NIT)
  const providers = await prisma.provider.findMany();
  const providerMap = new Map();
  for (const p of providers) {
    if (providerMap.has(p.nit)) {
      console.log(`Eliminando Provider duplicado: ${p.razonSocial} - NIT: ${p.nit} (${p.id})`);
      // Antes de eliminar, debemos mover o eliminar sus productos si existen
      // Pero para este script simple, solo eliminamos si no tiene relaciones críticas
      try {
        await prisma.provider.delete({ where: { id: p.id } });
      } catch (e) {
        console.error(`No se pudo eliminar el proveedor ${p.id} porque tiene productos asociados.`);
      }
    } else {
      providerMap.set(p.nit, p.id);
    }
  }

  // 3. Limpiar Operators (por NIT)
  const operators = await prisma.operator.findMany();
  const operatorMap = new Map();
  for (const o of operators) {
    if (operatorMap.has(o.nitOperador)) {
      console.log(`Eliminando Operator duplicado: ${o.nombreOperador} - NIT: ${o.nitOperador} (${o.id})`);
      try {
        await prisma.operator.delete({ where: { id: o.id } });
      } catch (e) {
        console.error(`No se pudo eliminar el operador ${o.id} porque tiene pedidos asociados.`);
      }
    } else {
      operatorMap.set(o.nitOperador, o.id);
    }
  }

  // 4. Limpiar Products (por alimento + providerId) - Ignoramos marca para ser más agresivos
  const products = await prisma.product.findMany();
  const productMap = new Map();
  let productsRemoved = 0;
  for (const prod of products) {
    const key = `${prod.alimento.toLowerCase().trim()}-${prod.providerId}`;
    if (productMap.has(key)) {
      console.log(`Eliminando Product duplicado: ${prod.alimento} (${prod.id})`);
      try {
        await prisma.product.delete({ where: { id: prod.id } });
        productsRemoved++;
      } catch (e) {
        console.error(`No se pudo eliminar el producto ${prod.id} porque tiene transacciones o recetas asociadas.`);
      }
    } else {
      productMap.set(key, prod.id);
    }
  }

  // 5. Limpiar Recipes (por nombre)
  const recipes = await prisma.recipe.findMany();
  const recipeMap = new Map();
  let recipesRemoved = 0;
  for (const r of recipes) {
    const key = r.nombre.toLowerCase().trim();
    if (recipeMap.has(key)) {
      console.log(`Eliminando Receta duplicada: ${r.nombre} (${r.id})`);
      try {
        await prisma.recipe.delete({ where: { id: r.id } });
        recipesRemoved++;
      } catch (e) {
        console.error(`No se pudo eliminar la receta ${r.id}.`);
      }
    } else {
      recipeMap.set(key, r.id);
    }
  }

  console.log(`Limpieza completada. Productos eliminados: ${productsRemoved}, Recetas eliminadas: ${recipesRemoved}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
