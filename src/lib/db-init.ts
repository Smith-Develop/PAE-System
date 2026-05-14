import { prisma } from "@/lib/prisma";

let initialized = false;

export async function ensureDb() {
  if (initialized) return;
  initialized = true;

  try {
    // Crear planes (puede fallar si la tabla no existe aún en Supabase)
    try {
      const plans = [
        { name: "Gratuito", maxUsers: 5, aiScansLimit: 10, price: 0 },
        { name: "Básico", maxUsers: 10, aiScansLimit: 30, price: 200000 },
        { name: "Profesional", maxUsers: 25, aiScansLimit: 100, price: 500000 },
        { name: "Enterprise", maxUsers: 100, aiScansLimit: 500, price: 1500000 },
      ];
      for (const p of plans) {
        await prisma.plan.upsert({ where: { name: p.name }, update: {}, create: p });
      }
    } catch {}

    // Modelos IA default
    try {
      const aiModels = [
        { name: "Gemini 2.5 Flash", provider: "google", modelId: "gemini-2.5-flash", isDefault: true },
        { name: "DeepSeek V3", provider: "deepseek", modelId: "deepseek-chat", baseUrl: "https://api.deepseek.com/v1" },
        { name: "GPT-4o", provider: "openai", modelId: "gpt-4o" },
      ];
      for (const m of aiModels) {
        await prisma.aIModel.upsert({ where: { name: m.name }, update: {}, create: { name: m.name, provider: m.provider, modelId: m.modelId, apiKey: "", baseUrl: m.baseUrl || null, isDefault: m.isDefault || false, active: true } });
      }
    } catch {}

    // Obtener plan gratuito para el tenant
    let freePlanId: string | null = null;
    try {
      const freePlan = await prisma.plan.findFirst({ where: { name: "Gratuito" } });
      freePlanId = freePlan?.id || null;
    } catch {}

    const [superRole, adminRole, empRole] = await Promise.all([
      prisma.role.upsert({ where: { name: "SUPER_ADMIN" }, update: {}, create: { name: "SUPER_ADMIN", description: "Super Admin", permissions: "{}" } }),
      prisma.role.upsert({ where: { name: "ADMIN" }, update: {}, create: { name: "ADMIN", description: "Admin", permissions: "{}" } }),
      prisma.role.upsert({ where: { name: "EMPLEADO" }, update: {}, create: { name: "EMPLEADO", description: "Empleado", permissions: "{}" } }),
    ]);

    // Tenant
    try {
      await prisma.tenant.upsert({
        where: { slug: "pae-antioquia" },
        update: {},
        create: { name: "PAE Antioquia", slug: "pae-antioquia", active: true, planId: freePlanId, maxUsers: 5, aiScansLimit: 10 },
      });
    } catch {}

    const tenant = await prisma.tenant.findUnique({ where: { slug: "pae-antioquia" } });

    // Super Admin (sin tenant)
    const existingSuper = await prisma.user.findUnique({ where: { email: "super@pae.gov.co" } });
    if (!existingSuper) {
      const { hash } = await import("bcryptjs");
      await prisma.user.create({ data: { email: "super@pae.gov.co", name: "Super Admin", password: await hash("super123", 12), roleId: superRole.id, active: true } });
    }

    // Admin del tenant
    if (tenant) {
      const existingAdmin = await prisma.user.findUnique({ where: { email: "admin@pae.gov.co" } });
      if (!existingAdmin) {
        const { hash } = await import("bcryptjs");
        await prisma.user.create({ data: { email: "admin@pae.gov.co", name: "Administrador PAE", password: await hash("admin123", 12), roleId: adminRole.id, active: true, tenantId: tenant.id } });
      }

      const existingEmp = await prisma.user.findUnique({ where: { email: "empleado@pae.gov.co" } });
      if (!existingEmp) {
        const { hash } = await import("bcryptjs");
        await prisma.user.create({ data: { email: "empleado@pae.gov.co", name: "Empleado PAE", password: await hash("empleado123", 12), roleId: empRole.id, active: true, tenantId: tenant.id } });
      }

      const names = ["Proteína", "Cereal", "Fruta", "Bebida", "Complemento", "Sopas", "Ensalada", "Postre"];
      for (const n of names) {
        try { await prisma.component.create({ data: { name: n, tenantId: tenant.id } }); } catch {}
      }
    }
  } catch (e: any) {
    console.log("Seed omitido:", e.message?.substring(0, 80));
  }
}
