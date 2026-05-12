import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { InstallPrompt } from "@/components/layout/install-prompt";
import { ensureDb } from "@/lib/db-init";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureDb();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-full max-w-full overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 w-full max-w-full overflow-x-hidden overflow-y-auto bg-muted/20 animate-fade-in">
          <div className="animate-slide-up">
            {children}
          </div>
        </main>
        <InstallPrompt />
      </SidebarInset>
    </SidebarProvider>
  );
}
