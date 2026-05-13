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
  console.log("=== PAE SEED MULTI-TENANT ===\n");

  // 1. Crear Tenant "PAE Antioquia"
  console.log("Creando tenant...");
  const tenant = await prisma.tenant.create({
    data: { name: "PAE Antioquia", slug: "pae-antioquia", active: true, plan: "enterprise" },
  });

  // 2. Crear roles
  console.log("Creando roles...");
  const [superAdminRole, adminRole, empRole] = await Promise.all([
    prisma.role.create({ data: { name: "SUPER_ADMIN", description: "Super Administrador del sistema", permissions: JSON.stringify(ADMIN_PERMISSIONS) } }),
    prisma.role.create({ data: { name: "ADMIN", description: "Administrador del tenant", permissions: JSON.stringify(ADMIN_PERMISSIONS) } }),
    prisma.role.create({ data: { name: "EMPLEADO", description: "Empleado operativo", permissions: JSON.stringify(EMPLOYEE_PERMISSIONS) } }),
  ]);

  // 3. Crear usuarios
  console.log("Creando usuarios...");
  const superPwd = await hash("super123", 12);
  const adminPwd = await hash("admin123", 12);
  const empPwd = await hash("empleado123", 12);

  await prisma.user.create({ data: { email: "super@pae.gov.co", name: "Super Admin", password: superPwd, roleId: superAdminRole.id, active: true } });
  console.log("  super@pae.gov.co (super123)");

  await prisma.user.create({ data: { email: "admin@pae.gov.co", name: "Administrador PAE", password: adminPwd, roleId: adminRole.id, active: true, tenantId: tenant.id } });
  console.log("  admin@pae.gov.co (admin123)");

  await prisma.user.create({ data: { email: "empleado@pae.gov.co", name: "Empleado PAE", password: empPwd, roleId: empRole.id, active: true, tenantId: tenant.id } });
  console.log("  empleado@pae.gov.co (empleado123)");

  // 4. Componentes base
  console.log("Creando componentes...");
  const names = ["Proteína", "Cereal", "Fruta", "Bebida", "Complemento", "Sopas", "Ensalada", "Postre"];
  for (const name of names) {
    await prisma.component.create({ data: { name, tenantId: tenant.id } });
  }

  console.log("\n=== SEED COMPLETADO ===");
  console.log(`Tenant: ${tenant.name} (${tenant.slug})`);
  console.log("Credenciales:");
  console.log("  Super Admin: super@pae.gov.co / super123");
  console.log("  Admin:       admin@pae.gov.co / admin123");
  console.log("  Empleado:    empleado@pae.gov.co / empleado123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
