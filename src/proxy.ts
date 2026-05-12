import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Rutas que solo ADMIN puede acceder
const ADMIN_ONLY_PATHS = ["/ajustes", "/operadores", "/proveedores", "/componentes"];
// APIs que solo ADMIN puede usar
const ADMIN_ONLY_API = ["/api/users", "/api/backup", "/api/roles", "/api/user/password", "/api/user/profile"];

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const publicPaths = ["/login", "/api/auth", "/manifest.json", "/sw.js", "/icons/"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!session && !isPublic) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && (pathname === "/login" || pathname === "/")) {
    return NextResponse.redirect(new URL("/maestro", request.url));
  }

  // Verificar permisos de admin para rutas protegidas
  if (session?.user?.role === "EMPLEADO") {
    const isAdminPage = ADMIN_ONLY_PATHS.some(p => pathname.startsWith(p));
    const isAdminApi = ADMIN_ONLY_API.some(p => pathname.startsWith(p));

    if (isAdminPage || isAdminApi) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Acceso restringido - solo administradores" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/pedidos", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)"],
};
