"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChefHat,
  Calculator,
  Receipt,
  FileSpreadsheet,
  Settings,
  LogOut,
  Truck,
  Warehouse,
  Building,
  Layers,
  Users,
  Puzzle,
  Package,
  ClipboardList,
  BookOpen,
  Store,
} from "lucide-react";
import { signOut } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const ADMIN_ITEMS = [
  { name: "Operadores", href: "/operadores", icon: Building },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Proveedores", href: "/proveedores", icon: Truck },
];

const CATALOG_ITEMS = [
  { name: "Maestro de Productos", href: "/maestro", icon: Package },
  { name: "Grupos Alimentarios", href: "/grupos", icon: Layers },
  { name: "Componentes", href: "/componentes", icon: Puzzle },
];

const RECIPE_ITEMS = [
  { name: "Recetario", href: "/recetas", icon: ChefHat },
];

const OPERATIONS_ITEMS = [
  { name: "Pedidos", href: "/pedidos", icon: Calculator },
  { name: "Compras", href: "/compras", icon: Receipt },
  { name: "Bodega / Inventario", href: "/bodega", icon: Warehouse },
];

const REPORT_ITEMS = [
  { name: "Reporte Gobernación", href: "/reporte", icon: FileSpreadsheet },
];

function NavSection({
  label,
  items,
  pathname,
  prefix = "",
}: {
  label: string;
  items: { name: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
  pathname: string;
  prefix?: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const href = prefix + item.href;
            return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                render={<Link href={href} />}
                isActive={pathname === href || pathname.startsWith(href + "/")}
                tooltip={item.name}
              >
                <item.icon />
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )})}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar({ tenantSlug }: { tenantSlug?: string | null }) {
  const pathname = usePathname();
  const prefix = tenantSlug ? `/t/${tenantSlug}` : "";

  const resolveHref = (href: string) => prefix + href;

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="flex flex-row items-center gap-3 px-4 pt-6 pb-4">
        <div className="flex items-center justify-center">
          <img src="/logo.png" alt="PAE System" className="size-9 object-contain" />
        </div>
        <div className="flex flex-col gap-0.5 leading-none">
          <span className="font-bold tracking-tight text-sm">PAE System</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Logística & Reportes
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <NavSection label="Administración" items={ADMIN_ITEMS} pathname={pathname} prefix={prefix} />
        <NavSection label="Catálogo" items={CATALOG_ITEMS} pathname={pathname} prefix={prefix} />
        <NavSection label="Recetario" items={RECIPE_ITEMS} pathname={pathname} prefix={prefix} />
        <NavSection label="Operaciones" items={OPERATIONS_ITEMS} pathname={pathname} prefix={prefix} />
        <NavSection label="Reportes" items={REPORT_ITEMS} pathname={pathname} prefix={prefix} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href={`${prefix}/ajustes`} />}
                  isActive={pathname.startsWith(`${prefix}/ajustes`)}
                >
                  <Settings />
                  <span>Ajustes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => signOut({ callbackUrl: "/login" })}>
                  <LogOut />
                  <span>Cerrar sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
