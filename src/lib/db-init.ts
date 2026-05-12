import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

let initialized = false;

export async function ensureDb() {
  if (initialized) return;
  initialized = true;

  try {
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

    const adminPassword = await hash("admin123", 12);
    await prisma.user.upsert({
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

    const names = [
      "Proteína", "Cereal", "Fruta", "Bebida",
      "Complemento", "Sopas", "Ensalada", "Postre",
    ];
    for (const name of names) {
      await prisma.component.upsert({ where: { name }, update: {}, create: { name } });
    }
    console.log("Seed verificado.");
  } catch (e: any) {
    console.log("Seed omitido:", e.message?.substring(0, 80));
  }
}
