import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { extractTenantSlug, stripTenantPrefix, getTenantBySlug } from "@/lib/tenant";

// Rutas que solo ADMIN puede acceder
const ADMIN_ONLY_PATHS = ["/ajustes", "/operadores", "/proveedores", "/componentes"];
const ADMIN_ONLY_API = ["/api/users", "/api/backup", "/api/roles", "/api/user/password", "/api/user/profile"];
// Rutas públicas
const PUBLIC_PATHS = ["/login", "/api/auth", "/api/ai-status", "/manifest.json", "/sw.js", "/icons/", "/logo.png"];

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Detectar tenant por path: /t/{slug}
  const tenantSlug = extractTenantSlug(pathname);
  let tenantId: string | null = null;

  if (tenantSlug) {
    const tenant = await getTenantBySlug(tenantSlug);
    if (!tenant?.active) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    tenantId = tenant.id;
  }

  // Verificar acceso público
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname === "/";

  if (!session && !isPublic) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Login redirect según rol
  if (session && (pathname === "/login" || pathname === "/")) {
    if (session.user.role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/super-admin", request.url));
    }
    if (session.user.tenantId) {
      const tenant = await prisma_findTenant(session.user.tenantId);
      const slug = tenant?.slug || "pae-antioquia";
      return NextResponse.redirect(new URL(`/t/${slug}/maestro`, request.url));
    }
    return NextResponse.redirect(new URL("/maestro", request.url));
  }

  // Verificar que el usuario tenga acceso al tenant
  if (session && tenantId && session.user.tenantId && tenantId !== session.user.tenantId) {
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Verificar permisos admin para empleados
  if (session?.user?.role === "EMPLEADO") {
    const isAdminPage = ADMIN_ONLY_PATHS.some(p => pathname.startsWith(p));
    const isAdminApi = ADMIN_ONLY_API.some(p => pathname.startsWith(p));
    const cleanPath = tenantSlug ? stripTenantPrefix(pathname, tenantSlug) : pathname;
    if (ADMIN_ONLY_PATHS.some(p => cleanPath.startsWith(p))) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Acceso restringido" }, { status: 403 });
      }
      return NextResponse.redirect(new URL(tenantSlug ? `/t/${tenantSlug}/pedidos` : "/pedidos", request.url));
    }
  }

  // Reescribir URL quitando /t/{slug} para que Next.js routee normalmente
  if (tenantSlug) {
    const newPath = stripTenantPrefix(pathname, tenantSlug);
    const url = new URL(newPath, request.url);
    // Pasar tenantId via header
    const headers = new Headers(request.headers);
    headers.set("x-tenant-id", tenantId!);
    headers.set("x-tenant-slug", tenantSlug);

    // Mantener query params
    const response = NextResponse.rewrite(url);
    response.headers.set("x-tenant-id", tenantId!);
    response.headers.set("x-tenant-slug", tenantSlug);
    return response;
  }

  return NextResponse.next();
}

async function prisma_findTenant(id: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.tenant.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)"],
};
