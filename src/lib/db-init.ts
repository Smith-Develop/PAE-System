import { prisma } from "@/lib/prisma";

let initialized = false;

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

export async function ensureDb() {
  if (initialized) return;
  initialized = true;

  try {
    const [adminRole, empRole] = await Promise.all([
      prisma.role.upsert({
        where: { name: "ADMIN" },
        update: { permissions: JSON.stringify(ADMIN_PERMISSIONS) },
        create: { name: "ADMIN", description: "Administrador del sistema", permissions: JSON.stringify(ADMIN_PERMISSIONS) },
      }),
      prisma.role.upsert({
        where: { name: "EMPLEADO" },
        update: { permissions: JSON.stringify(EMPLOYEE_PERMISSIONS) },
        create: { name: "EMPLEADO", description: "Empleado operativo", permissions: JSON.stringify(EMPLOYEE_PERMISSIONS) },
      }),
    ]);

    // Admin user
    const existingAdmin = await prisma.user.findUnique({ where: { email: "admin@pae.gov.co" } });
    if (!existingAdmin) {
      const { hash } = await import("bcryptjs");
      await prisma.user.create({
        data: { email: "admin@pae.gov.co", name: "Administrador PAE", password: await hash("admin123", 12), roleId: adminRole.id, active: true },
      });
    }

    // Employee user
    const existingEmp = await prisma.user.findUnique({ where: { email: "empleado@pae.gov.co" } });
    if (!existingEmp) {
      const { hash } = await import("bcryptjs");
      await prisma.user.create({
        data: { email: "empleado@pae.gov.co", name: "Empleado PAE", password: await hash("empleado123", 12), roleId: empRole.id, active: true },
      });
    }

    const names = ["Proteína", "Cereal", "Fruta", "Bebida", "Complemento", "Sopas", "Ensalada", "Postre"];
    for (const name of names) {
      await prisma.component.upsert({ where: { name }, update: {}, create: { name } });
    }
    console.log("Roles y usuarios verificados.");
  } catch (e: any) {
    console.log("Seed omitido:", e.message?.substring(0, 80));
  }
}
