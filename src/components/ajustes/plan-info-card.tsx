"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Zap, Calendar, AlertTriangle } from "lucide-react";

export function PlanInfoCard() {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tenants/current")
      .then((r) => r.json())
      .then((d) => { if (d.name) setTenant(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Cargando...</p>;
  if (!tenant) return null;

  const daysLeft = tenant.expirationDate
    ? Math.max(0, Math.ceil((new Date(tenant.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
  const userPct = Math.min(100, Math.round((tenant._count?.users || 0) / tenant.maxUsers * 100));
  const scanPct = Math.min(100, Math.round((tenant.aiScansUsed || 0) / (tenant.aiScansLimit || 1) * 100));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          Plan Actual: <Badge variant="outline" className="font-bold">{tenant.plan?.name || "Sin plan"}</Badge>
          {isExpired ? (
            <Badge variant="destructive" className="text-[10px]">Vencido</Badge>
          ) : isExpiringSoon ? (
            <Badge className="bg-amber-100 text-amber-700 text-[10px]">Por vencer</Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px]">Activo</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expiration warning */}
        {(isExpiringSoon || isExpired) && (
          <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${isExpired ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              {isExpired
                ? "Tu membresía ha vencido. Contacta al administrador para renovar."
                : `Tu membresía vence en ${daysLeft} días. Contacta al administrador para renovar.`}
            </span>
          </div>
        )}

        {/* Users bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Usuarios</span>
            <span className="font-medium">{tenant._count?.users || 0} / {tenant.maxUsers}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${userPct > 80 ? "bg-red-500" : userPct > 50 ? "bg-amber-500" : "bg-primary"}`} style={{ width: `${userPct}%` }} />
          </div>
        </div>

        {/* IA Scans bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Escaneos IA</span>
            <span className="font-medium">{tenant.aiScansUsed || 0} / {tenant.aiScansLimit}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${scanPct > 80 ? "bg-red-500" : scanPct > 50 ? "bg-amber-500" : "bg-purple-500"}`} style={{ width: `${scanPct}%` }} />
          </div>
        </div>

        {/* Expiration */}
        {tenant.expirationDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Vence: {new Date(tenant.expirationDate).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</span>
            {daysLeft !== null && daysLeft > 0 && <span className="font-medium">({daysLeft} días)</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
