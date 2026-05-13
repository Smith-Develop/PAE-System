import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Shield, Building, Users, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/login");

  const [tenantCount, userCount] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
  ]);

  const tenants = await prisma.tenant.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
          <Shield className="h-6 w-6" /> Panel Super Admin
        </h1>
        <p className="text-muted-foreground">Gestión global del sistema multi-tenant.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Building className="h-4 w-4" /> Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{tenantCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" /> Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-lg">Path-Based</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" /> Tenants Registrados</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 font-semibold">Nombre</th>
                <th className="py-2 font-semibold">Slug</th>
                <th className="py-2 font-semibold">Plan</th>
                <th className="py-2 font-semibold">Usuarios</th>
                <th className="py-2 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-b hover:bg-slate-50">
                  <td className="py-2 font-medium">{t.name}</td>
                  <td className="py-2 font-mono text-xs">{t.slug}</td>
                  <td className="py-2"><Badge variant="outline">{t.plan}</Badge></td>
                  <td className="py-2">{t._count.users}</td>
                  <td className="py-2">
                    <Badge variant={t.active ? "secondary" : "destructive"}>{t.active ? "Activo" : "Inactivo"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
