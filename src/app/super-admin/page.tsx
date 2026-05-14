import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Building, Users, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TenantManager } from "@/components/super-admin/tenant-manager";
import { UserManager } from "@/components/super-admin/user-manager";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/login");

  const [tenantCount, userCount] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Panel Super Admin
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

      <TenantManager />

      <UserManager />
    </div>
  );
}
