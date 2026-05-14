const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");
const prisma = new PrismaClient();

const ADMIN_PERMISSIONS = JSON.stringify({
  maestro: { ver: true, crear: true, editar: true, eliminar: true },
  recetas: { ver: true, crear: true, editar: true, eliminar: true },
  pedidos: { ver: true, crear: true, editar: true, eliminar: true },
  compras: { ver: true, crear: true, editar: true, eliminar: true },
  reporte: { ver: true, exportar: true },
  ajustes: { ver: true, editar: true },
});

const EMPLOYEE_PERMISSIONS = JSON.stringify({
  maestro: { ver: true, crear: false, editar: false, eliminar: false },
  recetas: { ver: true, crear: false, editar: false, eliminar: false },
  pedidos: { ver: true, crear: true, editar: true, eliminar: true },
  compras: { ver: true, crear: true, editar: true, eliminar: true },
  reporte: { ver: true, exportar: true },
  ajustes: { ver: false, editar: false },
});

async function main() {
  console.log("=== PAE SEED MULTI-TENANT ===\n");

  // Planes por defecto
  console.log("Creando planes...");
  const plans = [
    { name: "Gratuito", description: "Plan gratuito con funciones básicas", maxUsers: 5, aiScansLimit: 10, price: 0, durationDays: 30 },
    { name: "Básico", description: "Plan básico para operadores pequeños", maxUsers: 10, aiScansLimit: 30, price: 200000, durationDays: 30 },
    { name: "Profesional", description: "Plan profesional con funciones completas", maxUsers: 25, aiScansLimit: 100, price: 500000, durationDays: 30 },
    { name: "Enterprise", description: "Plan enterprise para grandes operadores", maxUsers: 100, aiScansLimit: 500, price: 1500000, durationDays: 30 },
  ];
  const createdPlans = {};
  for (const p of plans) {
    const plan = await prisma.plan.upsert({ where: { name: p.name }, update: p, create: p });
    createdPlans[p.name] = plan;
    console.log(`  Plan: ${plan.name} (${plan.maxUsers} users, ${plan.aiScansLimit} scans, $${plan.price.toLocaleString("es-CO")} COP)`);
  }

  // Tenant
  console.log("\nCreando tenant...");
  const tenant = await prisma.tenant.upsert({
    where: { slug: "pae-antioquia" },
    update: {},
    create: {
      name: "PAE Antioquia", slug: "pae-antioquia", active: true,
      planId: createdPlans["Gratuito"].id,
      maxUsers: createdPlans["Gratuito"].maxUsers,
      aiScansLimit: createdPlans["Gratuito"].aiScansLimit,
    },
  });

  // Subscription inicial
  const existingSub = await prisma.subscription.findFirst({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" } });
  if (!existingSub) {
    const end = new Date(); end.setDate(end.getDate() + 30);
    await prisma.subscription.create({
      data: { tenantId: tenant.id, planId: createdPlans["Gratuito"].id, startDate: new Date(), endDate: end, amount: 0 },
    });
    await prisma.tenant.update({ where: { id: tenant.id }, data: { expirationDate: end } });
  }

  // Roles
  console.log("\nCreando roles...");
  const [superRole, adminRole, empRole] = await Promise.all([
    prisma.role.upsert({ where: { name: "SUPER_ADMIN" }, update: { permissions: ADMIN_PERMISSIONS }, create: { name: "SUPER_ADMIN", description: "Super Admin", permissions: ADMIN_PERMISSIONS } }),
    prisma.role.upsert({ where: { name: "ADMIN" }, update: { permissions: ADMIN_PERMISSIONS }, create: { name: "ADMIN", description: "Admin", permissions: ADMIN_PERMISSIONS } }),
    prisma.role.upsert({ where: { name: "EMPLEADO" }, update: { permissions: EMPLOYEE_PERMISSIONS }, create: { name: "EMPLEADO", description: "Empleado", permissions: EMPLOYEE_PERMISSIONS } }),
  ]);

  // Usuarios
  console.log("\nCreando usuarios...");
  const users = [
    { email: "super@pae.gov.co", name: "Super Admin", password: "super123", roleId: superRole.id },
    { email: "admin@pae.gov.co", name: "Administrador PAE", password: "admin123", roleId: adminRole.id, tenantId: tenant.id },
    { email: "empleado@pae.gov.co", name: "Empleado PAE", password: "empleado123", roleId: empRole.id, tenantId: tenant.id },
  ];
  for (const u of users) {
    const exists = await prisma.user.findUnique({ where: { email: u.email } });
    if (!exists) {
      await prisma.user.create({ data: { email: u.email, name: u.name, password: await hash(u.password, 12), roleId: u.roleId, active: true, tenantId: u.tenantId || null } });
    }
    console.log(`  ${u.email} (${u.password})`);
  }

  // Componentes base
  const names = ["Proteína", "Cereal", "Fruta", "Bebida", "Complemento", "Sopas", "Ensalada", "Postre"];
  for (const n of names) {
    try { await prisma.component.create({ data: { name: n, tenantId: tenant.id } }); } catch {}
  }

  console.log("\n=== SEED COMPLETADO ===");
}

main().catch(console.error).finally(() => prisma.$disconnect());
