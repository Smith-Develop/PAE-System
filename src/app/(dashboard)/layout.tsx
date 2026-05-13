import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { InstallPrompt } from "@/components/layout/install-prompt";
import { ensureDb } from "@/lib/db-init";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await ensureDb();

  const heads = await headers();
  const tenantId = heads.get("x-tenant-id");
  const tenantSlug = heads.get("x-tenant-slug");

  let tenantName = "";
  if (tenantId) {
    try {
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true, slug: true } });
      tenantName = tenant?.name || "";
    } catch {}
  }

  return (
    <SidebarProvider>
      <AppSidebar tenantSlug={tenantSlug} />
      <SidebarInset className="w-full max-w-full overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
          {tenantName && <Badge variant="outline" className="ml-2 text-xs font-medium">{tenantName}</Badge>}
        </header>
        <main className="flex-1 w-full max-w-full overflow-x-hidden overflow-y-auto bg-muted/20 animate-fade-in">
          <div className="animate-slide-up">{children}</div>
        </main>
        <InstallPrompt />
      </SidebarInset>
    </SidebarProvider>
  );
}
