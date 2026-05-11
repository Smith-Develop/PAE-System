import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_PERMISSIONS = JSON.stringify({
  maestro: { ver: true, crear: true, editar: true, eliminar: true },
  recetas: { ver: true, crear: true, editar: true, eliminar: true },
  pedidos: { ver: true, crear: true },
  compras: { ver: true, crear: true, editar: true, eliminar: true },
  reporte: { ver: true, exportar: true },
  ajustes: { ver: true, editar: true },
});

const VIEWER_PERMISSIONS = JSON.stringify({
  maestro: { ver: true, crear: false, editar: false, eliminar: false },
  recetas: { ver: true, crear: false, editar: false, eliminar: false },
  pedidos: { ver: true, crear: false },
  compras: { ver: true, crear: false, editar: false, eliminar: false },
  reporte: { ver: true, exportar: false },
  ajustes: { ver: false, editar: false },
});

async function main() {
  console.log("🌱 Seeding database...");

  // Crear roles
  const adminRole = await prisma.role.upsert({
    where: { name: "Administrador" },
    update: {},
    create: {
      name: "Administrador",
      description: "Acceso total a todos los módulos",
      permissions: ADMIN_PERMISSIONS,
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: "Consulta" },
    update: {},
    create: {
      name: "Consulta",
      description: "Solo lectura en todos los módulos",
      permissions: VIEWER_PERMISSIONS,
    },
  });

  // Crear usuario admin
  const hashedPassword = await hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@pae.com" },
    update: {},
    create: {
      email: "admin@pae.com",
      name: "Administrador PAE",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  // Crear un operador inicial de ejemplo
  const existingOperator = await prisma.operator.findFirst();
  if (!existingOperator) {
    await prisma.operator.create({
      data: {
        nombreOperador: "OPERADOR PAE ANTIOQUIA SAS",
        nitOperador: "900.000.000-1",
        modeloAtencion: "RPC (Ración Preparada en Centro)",
        modalidadAtencion: "Complemento AM/PM",
        direccionBodega: "Calle Central #10-20",
        municipioBodega: "Medellín",
        contactoBodega: "Juan Pérez",
        telefonoBodega: "604 1234567",
      },
    });
  }

  // Grupos de alimentos (Res 719)
  const FOOD_GROUPS = [
    "1. LECHE, DERIVADOS LACTEOS Y PRODUCTOS DE IMITACION ADICIONADOS O NO DE NUTRIENTES U OTROS BIOCOMPONENTES DIFERENTES A LOS DEL GRUPO 2",
    "2. GRASAS, ACEITES EMULSIONES GRASAS Y CERAS",
    "3. PRODUCTOS CUYO INGREDIENTE PRINCIPAL ES EL AGUA O DESTINADAS A SER HIDRATADAS O PREPARADAS CON LECHE U OTRA BEBIDA. SE EXCLUYEN LAS DEL GRUPO 1",
    "4. FRUTAS Y OTROS PRODUCTOS VEGETALES INCLUIDOS HONGOS Y SETAS, RAÍCES Y TUBÉRCULOS, LEGUMINOSAS, Y ALOE VERA, ALGAS MARINAS, NUECES, SEMILLAS, FRUTAS Y HORTALIZAS PROCESADAS",
    "5. CONFITERÍA",
    "6. CEREALES Y PRODUCTOS A BASE DE CEREALES, DERIVADOS DE GRANOS DE CEREALES, DE RAÍCES Y TUBERCULOS, LEGUMINOSAS, EXCLUIDOS LOS PRODUCTOS DE PANADERIA DEL GRUPO 7",
    "7. PAN Y PRODUCTOS DE PANADERÍA",
    "8. CARNES, PRODUCTOS CÁRNICOS COMESTIBLES Y DERIVADOS CÁRNICOS",
    "9. PESCADOS Y PRODUCTOS DE LA PESCA, MOLUSCOS, CRUSTÁCEOS Y EQUINODERMOS",
    "10. HUEVOS Y PRODUCTOS A BASE DE HUEVO",
    "11. AZÚCAR, PRODUCTOS CUYO COMPONENTE PRINCIPAL ES AZÚCAR",
    "12. MIEL, CERA Y OTROS PRODUCTOS DE ORIGEN APÍCOLA",
    "13. SAL, HIERBAS AROMÁTICAS, ESPECIAS, CONDIMENTOS, VINAGRE, SOPAS, SALSAS, ENSALADAS, PRODUCTOS PROTEÍNICOS DIFERENTES A LOS DE 6.8.4",
    "14. ALIMENTOS PARA USOS NUTRICIONALES ESPECIALES",
    "15. ALIMENTOS COMPUESTOS, QUE NO PUEDEN CLASIFICARSE EN LOS GRUPOS 1 A 14"
  ];

  console.log("Creando grupos de alimentos...");
  for (const name of FOOD_GROUPS) {
    await prisma.foodGroup.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("✅ Seed completed!");
  console.log(`   Admin: admin@pae.com / admin123`);
  console.log(`   Roles: ${adminRole.name}, ${viewerRole.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
