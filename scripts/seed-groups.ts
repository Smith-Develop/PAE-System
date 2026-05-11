import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GROUPS_DATA = [
  {
    prefix: "1.",
    description: "Leche líquida (cruda, pasteurizada, ultrapasteurizada, UHT, esterilizada); Derivados lácteos bebibles o cuchareables, saborizados y/o fermentados (por ejemplo yogurt, kéfir, leches cultivadas, con bifidobacterias); Leche evaporada; Leche en polvo; Crema de leche; Mantequilla; Quesos frescos (no madurados); Quesos madurados; Quesos procesados; Postres a base de leche y otros derivados lácteos"
  },
  {
    prefix: "2.",
    description: "Grasas: aceites, manteca, ácidos grasos, aceites esenciales, ceras (diferentes a las de abejas) de origen vegetal; Manteca de origen animal, manteca de cerdo, oleo estearina bovina u ovina, oleo margarina bovina u ovina, grasa de cerdo fundida, aceite de pescado y otras grasas o aceites de origen animal o marino; Emulsiones con no menos del 80% de grasa de origen animal o ingredientes lácteos (margarina, mezclas de mantequilla-margarina); Emulsiones con menos del 80% de grasa (margarinas, esparcibles, etc.)"
  },
  {
    prefix: "3.",
    description: "Agua potable tratada, agua de manantial, agua mineral, agua gasificada; Hielo y helados de agua; Agua saborizada y agua gasificada saborizada, sin adición de azúcar u otro edulcorante ni otros aditivos diferentes a los saborizantes; Bebidas a base de agua saborizadas (con adición de azúcar o edulcorantes); Bebidas hidratantes y energizantes; Té, café e infusiones de hierbas listas para el consumo"
  },
  {
    prefix: "4.",
    description: "Frutas frescas, frutas frescas refrigeradas, frutas frescas congeladas, sin pelar y sin ningún tipo de tratamiento químico; frutas frescas, frutas frescas refrigeradas, frutas frescas congeladas, sin pelar y con tratamientos químicos en la superficie; Frutas frescas, frutas frescas refrigeradas, frutas frescas congeladas, peladas y/o cortadas sin tratamientos químicos; Frutas y hortalizas procesadas (deshidratadas, en conserva, mermeladas, purés, jugos, néctares)"
  },
  {
    prefix: "5.",
    description: "Chocolates de mesa; Cocoa; Chocolates para consumo directo, se incluyen los sucedáneos de chocolate para consumo directo; Confites de azúcar, caramelos, gomas, bombones, turrones, mazapanes; Productos de confitería de harina (barquillos, etc.); Otros productos de confitería"
  },
  {
    prefix: "6.",
    description: "Granos enteros o triturados o en copos se incluye el arroz; Harinas: se incluyen las de hortalizas y vegetales; Almidones y féculas; Pastas alimenticias; Cereales para el desayuno; Otros productos a base de cereales"
  },
  {
    prefix: "7.",
    description: "Panes leudados con levadura o con bicarbonato (se incluyen productos tipo roscones, panes y bollos dulces); Galletas crujientes “crackers”, galletas saladas; Productos de panadería dulce: tortas, galletas dulces, pasteles, bizcochos, donuts, panecillos dulces; Mezclas para panadería y repostería"
  },
  {
    prefix: "8.",
    description: "Carne y productos cárnicos comestibles; Derivados cárnicos frescos, tratados o no térmicamente; Derivados cárnicos madurados o fermentados, tratados o no térmicamente; Derivados cárnicos precocidos, tratados o no térmicamente; Derivados cárnicos cocidos, tratados o no térmicamente; Otros productos cárnicos"
  },
  {
    prefix: "9.",
    description: "Pescado fresco refrigerado o congelado; Productos de la pesca frescos, refrigerados o congelados; Pescado y/o productos de la pesca, fileteados o picados, refrigerados o congelados, pasta de pescado cruda; Productos de la pesca procesados (ahumados, secos, salados, en conserva)"
  },
  {
    prefix: "10.",
    description: "Huevos frescos; Huevos frescos; Productos congelados/refrigerados a base de huevo (huevo entero, clara o yema pasterizados y congelados/refrigerados); Productos de huevo deshidratados; Otros productos a base de huevo"
  },
  {
    prefix: "11.",
    description: "Azúcar blanco (cualquier tamaño de partícula), se incluye el azúcar blando (húmedo); Azúcar moreno, azúcar sin refinar; Soluciones azucaradas y jarabes de azúcar también azúcar total o parcialmente invertido, se incluye la panela; Melazas; Otros productos de azúcar"
  },
  {
    prefix: "12.",
    description: "Miel, cera y otros productos de origen apícola; Productos del grupo 12 enriquecidos, fortificados o adicionados de nutrientes o micronutrientes; Otros productos apícolas"
  },
  {
    prefix: "13.",
    description: "Sal para consumo humano; Sucedáneos de la sal para consumo humano; Hierbas aromáticas, especias, condimentos y aderezos; Vinagres; Sopas y caldos; Salsas y productos similares; Ensaladas y pastas para untar; Levaduras y productos similares; Productos proteínicos de origen vegetal o fúngico"
  },
  {
    prefix: "14.",
    description: "Alimentos de fórmula para lactantes de iniciación y fórmulas para lactantes de continuación; Alimentos para uso especial para Lactantes, Niños Pequeños, se incluyen los productos especiales para la primera infancia; Alimentos para regímenes especiales (ej. sin gluten, para diabéticos)"
  },
  {
    prefix: "15.",
    description: "Tamales; Empanadas y arepas rellenas; Platos preparados o combinados listos para el consumo; Otros alimentos compuestos"
  }
];

async function main() {
  console.log("Iniciando actualización de grupos alimentarios...");
  
  const allGroups = await prisma.foodGroup.findMany();

  for (const data of GROUPS_DATA) {
    // Buscamos un grupo que contenga el número al principio
    const existing = allGroups.find(g => 
      g.name.startsWith(data.prefix) || 
      g.name.includes("_" + data.prefix) || 
      g.name.includes("." + data.prefix)
    );

    if (existing) {
      await prisma.foodGroup.update({
        where: { id: existing.id },
        data: { 
          description: data.description 
        }
      });
      console.log(`Actualizado descripción para: ${existing.name}`);
    } else {
      console.log(`No se encontró grupo para el prefijo: ${data.prefix}`);
    }
  }
  
  console.log("Proceso completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
