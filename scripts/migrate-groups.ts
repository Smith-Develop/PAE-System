import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLEAN_GROUPS = [
  { name: "1_LECHE", full: "1. LECHE, DERIVADOS LACTEROS Y PRODUCTOS DE IMITACION ADICIONADOS O NO DE NUTRIENTES U OTROS BIOCOMPONENTES DIFERENTES A LOS DEL GRUPO 2", items: "Leche líquida (cruda, pasteurizada, ultrapasteurizada, UHT, esterilizada); Derivados lácteos bebibles o cuchareables, saborizados y/o fermentados (por ejemplo yogurt, kéfir, leches cultivadas, con bifidobacterias); Leche evaporada; Leche en polvo; Crema de leche; Mantequilla; Quesos frescos (no madurados); Quesos madurados; Quesos procesados; Postres a base de leche y otros derivados lácteos" },
  { name: "2_GRASAS", full: "2. GRASAS, ACEITES, EMULSIONES GRASAS Y CERAS", items: "Grasas: aceites, manteca, ácidos grasos, aceites esenciales, ceras (diferentes a las de abejas) de origen vegetal; Manteca de origen animal, manteca de cerdo, oleo estearina bovina u ovina, oleo margarina bovina u ovina, grasa de cerdo fundida, aceite de pescado y otras grasas o aceites de origen animal o marino; Emulsiones con no menos del 80% de grasa de origen animal o ingredientes lácteos (margarina, mezclas de mantequilla-margarina); Emulsiones con menos del 80% de grasa (margarinas, esparcibles, etc.)" },
  { name: "3_AGUA", full: "3. PRODUCTOS CUYO INGREDIENTE PRINCIPAL ES EL AGUA O DESTINADAS A SER HIDRATADAS O PREPARADAS CON LECHE U OTRA BEBIDA. SE EXCLUYEN LAS DEL GRUPO 1", items: "Agua potable tratada, agua de manantial, agua mineral, agua gasificada; Hielo y helados de agua; Agua saborizada y agua gasificada saborizada, sin adición de azúcar u otro edulcorante ni otros aditivos diferentes a los saborizantes; Bebidas a base de agua saborizadas (con adición de azúcar o edulcorantes); Bebidas hidratantes y energizantes; Té, café e infusiones de hierbas listas para el consumo" },
  { name: "4_FRUTAS", full: "4. FRUTAS Y OTROS PRODUCTOS VEGETALES INCLUIDOS HONGOS Y SETAS, RAÍCES Y TUBÉRCULOS, LEGUMINOSAS, Y ALOE VERA, ALGAS MARINAS, NUECES, SEMILLAS; FRUTAS Y HORTALIZAS PROCESADAS", items: "Frutas frescas, frutas frescas refrigeradas, frutas frescas congeladas, sin pelar y sin ningún tipo de tratamiento químico; frutas frescas, frutas frescas refrigeradas, frutas frescas congeladas, sin pelar y con tratamientos químicos en la superficie; Frutas frescas, frutas frescas refrigeradas, frutas frescas congeladas, peladas y/o cortadas sin tratamientos químicos; Frutas y hortalizas procesadas (deshidratadas, en conserva, mermeladas, purés, jugos, néctares)" },
  { name: "5_CONFITERIA", full: "5. CONFITERÍA", items: "Chocolates de mesa; Cocoa; Chocolates para consumo directo, se incluyen los sucedáneos de chocolate para consumo directo; Confites de azúcar, caramelos, gomas, bombones, turrones, mazapanes; Productos de confitería de harina (barquillos, etc.); Otros productos de confitería" },
  { name: "6_CEREALES", full: "6. CEREALES Y PRODUCTOS A BASE DE CEREALES, DERIVADOS DE GRANOS DE CEREALES, DE RAÍCES Y TUBERCULOS, LEGUMINOSAS, EXCLUIDOS LOS PRODUCTOS DE PANADERIA DEL GRUPO 7", items: "Granos enteros o triturados o en copos se incluye el arroz; Harinas: se incluyen las de hortalizas y vegetales; Almidones y féculas; Pastas alimenticias; Cereales para el desayuno; Otros productos a base de cereales" },
  { name: "7_PAN", full: "7. PAN Y PRODUCTOS DE PANADERÍA", items: "Panes leudados con levadura o con bicarbonato (se incluyen productos tipo roscones, panes y bollos dulces); Galletas crujientes “crackers”, galletas saladas; Productos de panadería dulce: tortas, galletas dulces, pasteles, bizcochos, donuts, panecillos dulces; Mezclas para panadería y repostería" },
  { name: "8_CARNES", full: "8. CARNES, PRODUCTOS CÁRNICOS COMESTIBLES Y DERIVADOS CÁRNICOS", items: "Carne y productos cárnicos comestibles; Derivados cárnicos frescos, tratados o no térmicamente; Derivados cárnicos madurados o fermentados, tratados o no térmicamente; Derivados cárnicos precocidos, tratados o no térmicamente; Derivados cárnicos cocidos, tratados o no térmicamente; Otros productos cárnicos" },
  { name: "9_PESCADOS", full: "9. PESCADOS Y PRODUCTOS DE LA PESCA (MOLUSCOS, CRUSTÁCEOS Y EQUINODERMOS)", items: "Pescado fresco refrigerado o congelado; Productos de la pesca frescos, refrigerados o congelados; Pescado y/o productos de la pesca, fileteados o picados, refrigerados o congelados, pasta de pescado cruda; Productos de la pesca procesados (ahumados, secos, salados, en conserva)" },
  { name: "10_HUEVOS", full: "10. HUEVOS Y PRODUCTOS A BASE DE HUEVO", items: "Huevos frescos; Productos congelados/refrigerados a base de huevo (huevo entero, clara o yema pasterizados y congelados/refrigerados); Productos de huevo deshidratados; Otros productos a base de huevo" },
  { name: "11_AZUCAR", full: "11. AZÚCAR, PRODUCTOS CUYO COMPONENTE PRINCIPAL ES AZÚCAR", items: "Azúcar blanco (cualquier tamaño de partícula), se incluye el azúcar blando (húmedo); Azúcar moreno, azúcar sin refinar; Soluciones azucaradas y jarabes de azúcar también azúcar total o parcialmente invertido, se incluye la panela; Melazas; Otros productos de azúcar" },
  { name: "12_MIEL", full: "12. MIEL, CERA Y OTROS PRPDUCTOS DE ORIGEN APÍCOLA", items: "Miel, cera y otros productos de origen apícola; Productos del grupo 12 enriquecidos, fortificados o adicionados de nutrientes o micronutrientes; Otros productos apícolas" },
  { name: "13_SAL", full: "13. SAL, HIERBAS AROMÁTICAS, ESPECIAS, CONDIMENTOS, VINAGRE, SOPAS, SALSAS, ENSALADAS, PRODUCTOS PROTEÍNICOS DIFERENTES A LOS DE 6.8.4", items: "Sal para consumo humano; Sucedáneos de la sal para consumo humano; Hierbas aromáticas, especias, condimentos y aderezos; Vinagres; Sopas y caldos; Salsas y productos similares; Ensaladas y pastas para untar; Levaduras y productos similares; Productos proteínicos de origen vegetal o fúngico" },
  { name: "14_ESPECIALES", full: "14. ALIMENTOS PARA USOS NUTRICIONALES ESPECIALES", items: "Alimentos de fórmula para lactantes de iniciación y fórmulas para lactantes de continuación; Alimentos para uso especial para Lactantes, Niños Pequeños, se incluyen los productos especiales para la primera infancia; Alimentos para regímenes especiales (ej. sin gluten, para diabéticos)" },
  { name: "15_COMPUESTOS", full: "15. ALIMENTOS COMPUESTOS (QUE NO PUEDEN CLASIFICARSE EN LOS GRUPOS 1 A 14), ESTE GRUPO COMPRENDE LOS PLATOS PREPARADOS O COMBINADOS", items: "Tamales; Empanadas y arepas rellenas; Platos preparados o combinados listos para el consumo; Otros alimentos compuestos" }
];

async function main() {
  console.log("Iniciando migración profunda de grupos alimentarios...");

  // 1. Crear grupos limpios si no existen
  const idMap: Record<string, string> = {}; // Prefix -> New ID

  for (const clean of CLEAN_GROUPS) {
    const prefix = clean.name.split('_')[0] + '.'; // "1."
    const group = await prisma.foodGroup.upsert({
      where: { name: clean.name },
      update: { description: clean.items },
      create: { 
        name: clean.name,
        description: clean.items
      }
    });
    idMap[prefix] = group.id;
    console.log(`Grupo listo: ${clean.name}`);
  }

  // 2. Mover MasterProducts
  const oldGroups = await prisma.foodGroup.findMany({
    include: { masterProducts: true }
  });

  for (const oldGroup of oldGroups) {
    // Si es uno de los grupos nuevos, saltar
    if (CLEAN_GROUPS.some(c => c.name === oldGroup.name)) continue;

    // Intentar encontrar el nuevo grupo correspondiente por prefijo
    let targetPrefix = "";
    for (let i = 1; i <= 15; i++) {
      const p = i + ".";
      if (oldGroup.name.includes(p) || oldGroup.name.startsWith(p)) {
        targetPrefix = p;
        break;
      }
    }

    if (targetPrefix && idMap[targetPrefix]) {
      const targetId = idMap[targetPrefix];
      console.log(`Moviendo ${oldGroup.masterProducts.length} productos de "${oldGroup.name}" a ID ${targetId}`);
      
      for (const product of oldGroup.masterProducts) {
        await prisma.masterProduct.update({
          where: { id: product.id },
          data: { foodGroupId: targetId }
        });
      }
      
      // Borrar el grupo viejo si no tiene más productos
      await prisma.foodGroup.delete({
        where: { id: oldGroup.id }
      });
      console.log(`Borrado grupo viejo: ${oldGroup.name}`);
    } else {
      console.log(`ADVERTENCIA: No se pudo mapear el grupo viejo "${oldGroup.name}"`);
    }
  }

  console.log("Migración completada.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
