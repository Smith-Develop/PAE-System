"use client";

import { useState, useEffect } from "react";
import { Building, Users, Activity, Zap, AlertTriangle, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatsData {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  superAdminCount: number;
  activeSessions: number;
  aiScansThisMonth: number;
  byVencer: { id: string; name: string; slug: string; expirationDate: string }[];
  recentActivity: { id: string; action: string; entity: string; userName: string; createdAt: string; details: string | null }[];
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/super-admin/stats");
        if (res.ok) setStats(await res.json());
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4"><div className="h-16 bg-slate-100 animate-pulse rounded" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const daysLeft = (date: string) =>
    Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Tenants</p>
                <p className="text-2xl font-bold">{stats.totalTenants}</p>
              </div>
              <Building className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Badge variant="secondary" className="text-[10px]">{stats.activeTenants} activos</Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Usuarios</p>
                <p className="text-2xl font-bold">{stats.totalUsers + stats.superAdminCount}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalUsers} tenant · {stats.superAdminCount} super admin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Sesiones</p>
                <p className="text-2xl font-bold">{stats.activeSessions}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Últimas 2 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Scans IA</p>
                <p className="text-2xl font-bold">{stats.aiScansThisMonth.toLocaleString("es-CO")}</p>
              </div>
              <Zap className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>

        <Card className={stats.byVencer.length > 0 ? "border-amber-300" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Por Vencer</p>
                <p className="text-2xl font-bold">{stats.byVencer.length}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${stats.byVencer.length > 0 ? "text-amber-500" : "text-muted-foreground/30"}`} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Próximos 30 días</p>
          </CardContent>
        </Card>
      </div>

      {/* Tenants por vencer list */}
      {stats.byVencer.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-amber-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Tenants por Vencer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-amber-50 text-left">
                  <th className="py-2 px-4 font-semibold">Nombre</th>
                  <th className="py-2 px-4 font-semibold">Slug</th>
                  <th className="py-2 px-4 font-semibold text-right">Días restantes</th>
                </tr>
              </thead>
              <tbody>
                {stats.byVencer.map((t) => {
                  const d = daysLeft(t.expirationDate);
                  return (
                    <tr key={t.id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-4 font-medium">{t.name}</td>
                      <td className="py-2 px-4 font-mono text-xs">{t.slug}</td>
                      <td className={`py-2 px-4 text-right font-bold ${d <= 7 ? "text-red-600" : "text-amber-600"}`}>
                        {d} {d === 1 ? "día" : "días"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Recent activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Clock className="h-4 w-4" /> Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="py-2 px-4 font-semibold">Usuario</th>
                <th className="py-2 px-4 font-semibold">Acción</th>
                <th className="py-2 px-4 font-semibold">Entidad</th>
                <th className="py-2 px-4 font-semibold text-right">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentActivity.map((log) => (
                <tr key={log.id} className="border-b hover:bg-slate-50">
                  <td className="py-2 px-4 font-medium">{log.userName}</td>
                  <td className="py-2 px-4">
                    <Badge variant="outline" className="text-[10px]">{log.action}</Badge>
                  </td>
                  <td className="py-2 px-4 text-xs">{log.entity}</td>
                  <td className="py-2 px-4 text-right text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("es-CO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
              {stats.recentActivity.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">Sin actividad registrada</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
