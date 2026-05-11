import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth();

  // Redirigir a login si no hay sesión y la ruta no es /login
  if (!session && request.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirigir a /maestro si hay sesión y trata de entrar a /login o a /
  if (session && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/")) {
    return NextResponse.redirect(new URL("/maestro", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
