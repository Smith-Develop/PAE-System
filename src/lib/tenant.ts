import { prisma } from "@/lib/prisma";

export async function getTenantBySlug(slug: string) {
  try {
    return await prisma.tenant.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

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
