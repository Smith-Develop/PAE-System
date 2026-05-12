const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");
const prisma = new PrismaClient();

const ADMIN_PERMISSIONS = {
  maestro: { ver: true, crear: true, editar: true, eliminar: true },
  recetas: { ver: true, crear: true, editar: true, eliminar: true },
  pedidos: { ver: true, crear: true, editar: true, eliminar: true },
  compras: { ver: true, crear: true, editar: true, eliminar: true },
  reporte: { ver: true, exportar: true },
  ajustes: { ver: true, editar: true },
};

const EMPLOYEE_PERMISSIONS = {
  maestro: { ver: true, crear: false, editar: false, eliminar: false },
  recetas: { ver: true, crear: false, editar: false, eliminar: false },
  pedidos: { ver: true, crear: true, editar: true, eliminar: true },
  compras: { ver: true, crear: true, editar: true, eliminar: true },
  reporte: { ver: true, exportar: true },
  ajustes: { ver: false, editar: false },
};

async function main() {
  console.log("=== PAE SEED ===");

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: { permissions: JSON.stringify(ADMIN_PERMISSIONS) },
    create: { name: "ADMIN", description: "Administrador del sistema", permissions: JSON.stringify(ADMIN_PERMISSIONS) },
  });
  console.log("Rol:", adminRole.name);

  const empRole = await prisma.role.upsert({
    where: { name: "EMPLEADO" },
    update: { permissions: JSON.stringify(EMPLOYEE_PERMISSIONS) },
    create: { name: "EMPLEADO", description: "Empleado operativo", permissions: JSON.stringify(EMPLOYEE_PERMISSIONS) },
  });
  console.log("Rol:", empRole.name);

  const adminPassword = await hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@pae.gov.co" },
    update: {},
    create: { email: "admin@pae.gov.co", name: "Administrador PAE", password: adminPassword, roleId: adminRole.id, active: true },
  });
  console.log("Usuario: admin@pae.gov.co (admin123)");

  const empPassword = await hash("empleado123", 12);
  await prisma.user.upsert({
    where: { email: "empleado@pae.gov.co" },
    update: {},
    create: { email: "empleado@pae.gov.co", name: "Empleado PAE", password: empPassword, roleId: empRole.id, active: true },
  });
  console.log("Usuario: empleado@pae.gov.co (empleado123)");

  const names = ["Proteína", "Cereal", "Fruta", "Bebida", "Complemento", "Sopas", "Ensalada", "Postre"];
  for (const name of names) {
    await prisma.component.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(`${names.length} componentes OK`);
  console.log("=== SEED COMPLETADO ===");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
