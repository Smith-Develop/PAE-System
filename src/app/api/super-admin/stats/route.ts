import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Solo Super Admin" }, { status: 403 });
  }

  const [
    totalTenants,
    activeTenants,
    totalUsers,
    superAdminCount,
    activeSessions,
    aiScansThisMonth,
    byVencer,
    recentActivity,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { active: true } }),
    prisma.user.count({ where: { tenantId: { not: null } } }),
    prisma.user.count({ where: { tenantId: null } }),
    prisma.log.count({
      where: {
        action: "LOGIN",
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      },
    }),
    prisma.tenant.aggregate({
      _sum: { aiScansUsed: true },
    }),
    prisma.tenant.findMany({
      where: {
        expirationDate: {
          not: null,
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
        active: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        expirationDate: true,
      },
      orderBy: { expirationDate: "asc" },
      take: 20,
    }),
    prisma.log.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    totalTenants,
    activeTenants,
    totalUsers,
    superAdminCount,
    activeSessions,
    aiScansThisMonth: aiScansThisMonth._sum.aiScansUsed || 0,
    byVencer,
    recentActivity,
  });
}
