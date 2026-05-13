import { prisma } from "@/lib/prisma";

let initialized = false;

export async function ensureDb() {
  if (initialized) return;
  initialized = true;

  try {
    const [superRole, adminRole, empRole] = await Promise.all([
      prisma.role.upsert({ where: { name: "SUPER_ADMIN" }, update: {}, create: { name: "SUPER_ADMIN", description: "Super Admin", permissions: "{}" } }),
      prisma.role.upsert({ where: { name: "ADMIN" }, update: {}, create: { name: "ADMIN", description: "Admin", permissions: "{}" } }),
      prisma.role.upsert({ where: { name: "EMPLEADO" }, update: {}, create: { name: "EMPLEADO", description: "Empleado", permissions: "{}" } }),
    ]);

    const tenant = await prisma.tenant.upsert({
      where: { slug: "pae-antioquia" },
      update: {},
      create: { name: "PAE Antioquia", slug: "pae-antioquia", active: true, plan: "free" },
    });

    // Super Admin
    const existingSuper = await prisma.user.findUnique({ where: { email: "super@pae.gov.co" } });
    if (!existingSuper) {
      const { hash } = await import("bcryptjs");
      await prisma.user.create({ data: { email: "super@pae.gov.co", name: "Super Admin", password: await hash("super123", 12), roleId: superRole.id, active: true } });
    }

    // Admin tenant
    const existingAdmin = await prisma.user.findUnique({ where: { email: "admin@pae.gov.co" } });
    if (!existingAdmin) {
      const { hash } = await import("bcryptjs");
      await prisma.user.create({ data: { email: "admin@pae.gov.co", name: "Administrador PAE", password: await hash("admin123", 12), roleId: adminRole.id, active: true, tenantId: tenant.id } });
    }

    // Empleado
    const existingEmp = await prisma.user.findUnique({ where: { email: "empleado@pae.gov.co" } });
    if (!existingEmp) {
      const { hash } = await import("bcryptjs");
      await prisma.user.create({ data: { email: "empleado@pae.gov.co", name: "Empleado PAE", password: await hash("empleado123", 12), roleId: empRole.id, active: true, tenantId: tenant.id } });
    }

    // Componentes
    const names = ["Proteína", "Cereal", "Fruta", "Bebida", "Complemento", "Sopas", "Ensalada", "Postre"];
    for (const name of names) {
      try {
        await prisma.component.create({ data: { name, tenantId: tenant.id } });
      } catch { /* ya existe */ }
    }
  } catch (e: any) {
    console.log("Seed omitido:", e.message?.substring(0, 80));
  }
}
