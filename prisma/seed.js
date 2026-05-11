const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("=== PAE SEED ===");

  // 1. Rol Admin
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "Administrador del sistema",
      permissions: JSON.stringify({
        maestro: { ver: true, crear: true, editar: true, eliminar: true },
        recetas: { ver: true, crear: true, editar: true, eliminar: true },
        pedidos: { ver: true, crear: true },
        compras: { ver: true, crear: true, editar: true, eliminar: true },
        reporte: { ver: true, exportar: true },
        ajustes: { ver: true, editar: true },
      }),
    },
  });
  console.log("Rol:", adminRole.name);

  // 2. Usuario Admin
  const adminPassword = await hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@pae.gov.co" },
    update: {},
    create: {
      email: "admin@pae.gov.co",
      name: "Administrador PAE",
      password: adminPassword,
      roleId: adminRole.id,
      active: true,
    },
  });
  console.log("Usuario:", adminUser.email, "(password: admin123)");

  // 3. Componentes base
  const componentNames = ["Proteína", "Cereal", "Fruta", "Bebida", "Complemento", "Sopas", "Ensalada", "Postre"];
  for (const name of componentNames) {
    await prisma.component.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`${componentNames.length} componentes OK`);

  console.log("=== SEED COMPLETADO ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
