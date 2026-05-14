import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { DashboardStats } from "@/components/super-admin/dashboard-stats";
import { TenantManager } from "@/components/super-admin/tenant-manager";
import { PlanManager } from "@/components/super-admin/plan-manager";
import { AiModelManager } from "@/components/super-admin/ai-model-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/login");

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
          <Shield className="h-6 w-6" /> Panel Super Admin
        </h1>
        <p className="text-muted-foreground">Gestión global del sistema multi-tenant.</p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="plans">Planes</TabsTrigger>
          <TabsTrigger value="ai">Modelos IA</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard"><DashboardStats /></TabsContent>
        <TabsContent value="tenants"><TenantManager /></TabsContent>
        <TabsContent value="plans"><PlanManager /></TabsContent>
        <TabsContent value="ai"><AiModelManager /></TabsContent>
      </Tabs>
    </div>
  );
}
