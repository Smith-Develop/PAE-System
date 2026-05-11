"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Package, 
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
  Users
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

const NAV_ITEMS = [
  { name: "Operadores", href: "/operadores", icon: Building },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Proveedores", href: "/proveedores", icon: Truck },
  { name: "Maestro de Productos", href: "/maestro", icon: Package },
  { name: "Grupos Alimentarios", href: "/grupos", icon: Layers },
  { name: "Recetario", href: "/recetas", icon: ChefHat },
  { name: "Bodega / Inventario", href: "/bodega", icon: Warehouse },
  { name: "Pedidos", href: "/pedidos", icon: Calculator },
  { name: "Registro de Compras", href: "/compras", icon: Receipt },
  { name: "Reporte Gobernación", href: "/reporte", icon: FileSpreadsheet },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="flex flex-row items-center gap-2 p-4 pt-6">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ChefHat className="size-5" />
        </div>
        <div className="flex flex-col gap-0.5 leading-none">
          <span className="font-semibold tracking-tight">PAE Antioquia</span>
          <span className="text-xs text-muted-foreground">Logística & Reportes</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos Principales</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    render={<Link href={item.href} />}
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.name}
                  >
                    <item.icon />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/ajustes" />} isActive={pathname.startsWith("/ajustes")}>
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
