import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ensureDb } from "@/lib/db-init";
import { logAction } from "@/lib/audit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await ensureDb();

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { role: true },
        });

        if (!user || !user.active) return null;

        const isValid = await compare(
          credentials.password as string,
          user.password
        );
        if (!isValid) return null;

        // Registrar login
        await logAction({
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          action: "LOGIN",
          entity: "auth",
          details: JSON.stringify({ role: user.role.name }),
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name,
          tenantId: user.tenantId,
          permissions: user.role.permissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
        session.user.permissions = token.permissions;
      }
      return session;
    },
  },
});
