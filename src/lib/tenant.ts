import { prisma } from "@/lib/prisma";
import { auth as getSession } from "@/lib/auth";

// --- Path parsing ---
export function extractTenantSlug(pathname: string): string | null {
  const match = pathname.match(/^\/t\/([^/]+)/);
  return match ? match[1] : null;
}

export function stripTenantPrefix(pathname: string, slug: string): string {
  return pathname.replace(`/t/${slug}`, "") || "/";
}

export function buildTenantUrl(slug: string, path: string): string {
  return `/t/${slug}${path}`;
}

export async function getTenantBySlug(slug: string) {
  try { return await prisma.tenant.findUnique({ where: { slug } }); }
  catch { return null; }
}

// --- Auth filtering ---
export async function getAuthTenantId(): Promise<string | undefined> {
  const session = await getSession();
  if (!session?.user) return undefined;
  if (session.user.role === "SUPER_ADMIN") return undefined;
  return session.user.tenantId || undefined;
}

export async function withTenant(where: any = {}) {
  const tenantId = await getAuthTenantId();
  if (!tenantId) return where;
  return { ...where, tenantId };
}
