import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

let initialized = false;

export async function ensureDb() {
  if (initialized) return;
  initialized = true;

  // Verificar si ya hay datos
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) return;
  } catch {
    // La BD o tabla no existe, intentar crear esquema
    console.log("Inicializando base de datos...");
    try {
      const { execSync } = await import("node:child_process");
      execSync("npx prisma db push --skip-generate --accept-data-loss", {
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL! },
        stdio: "pipe",
        timeout: 30000,
      });
    } catch (e: any) {
      console.log("No se pudo hacer db push (esperado en build):", e.message?.substring(0, 80));
      return;
    }
    console.log("Esquema creado.");
  }

  // Seed
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

    console.log("Seed completado: admin@pae.gov.co / admin123");
  } catch (e: any) {
    console.log("Seed omitido (ya existe o error):", e.message?.substring(0, 80));
  }
}
