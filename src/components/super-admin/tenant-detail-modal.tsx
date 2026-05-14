"use client";

import { useState, useEffect, useCallback } from "react";
import { Edit, Trash2, Plus, RefreshCw, Users, Calendar, Zap, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface Tenant {
  id: string; name: string; slug: string;
  plan: string; planId?: string; active: boolean;
  maxUsers: number; aiScansLimit: number; aiScansUsed: number;
  expirationDate: string | null;
  _count: { users: number };
}

interface UserItem {
  id: string; name: string; email: string;
  role: { id: string; name: string };
  active: boolean;
}

interface Subscription {
  id: string; planId: string; plan: { name: string };
  startDate: string; endDate: string; amount: number;
  active: boolean;
}

interface Plan {
  id: string; name: string; price: number; durationDays: number;
  maxUsers: number; aiScansLimit: number;
}

interface Props {
  open: boolean;
  tenant: Tenant | null;
  onClose: () => void;
}

export function TenantDetailModal({ open, tenant, onClose }: Props) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  // Create user mini form
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRoleId, setNewUserRoleId] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  // Renew sub-modal
  const [showRenew, setShowRenew] = useState(false);
  const [renewPlanId, setRenewPlanId] = useState("");
  const [renewAmount, setRenewAmount] = useState(0);
  const [renewing, setRenewing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const [uRes, sRes, pRes] = await Promise.all([
        fetch(`/api/super-admin/users?tenantId=${tenant.id}`),
        fetch(`/api/super-admin/tenants/${tenant.id}/subscriptions`),
        fetch("/api/super-admin/plans"),
      ]);
      if (uRes.ok) setUsers(await uRes.json());
      if (sRes.ok) setSubscriptions(await sRes.json());
      if (pRes.ok) setPlans(await pRes.json());
    } catch {}
    finally { setLoading(false); }
  }, [tenant]);

  useEffect(() => {
    if (open && tenant) fetchData();
  }, [open, tenant, fetchData]);

  const handleCreateUser = async () => {
    if (!newUserName || !newUserEmail || !newUserPassword) {
      toast.error("Nombre, email y contraseña requeridos"); return;
    }
    setCreatingUser(true);
    try {
      const res = await fetch("/api/super-admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName, email: newUserEmail, password: newUserPassword,
          roleId: newUserRoleId || undefined, tenantId: tenant!.id, active: true,
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success("Usuario creado");
      setNewUserName(""); setNewUserEmail(""); setNewUserPassword("");
      setShowCreateUser(false);
      fetchData();
    } catch (e: any) { toast.error(e.message); }
    finally { setCreatingUser(false); }
  };

  const handleDeleteUser = async (u: UserItem) => {
    if (!confirm(`¿Eliminar al usuario "${u.name}"?`)) return;
    try {
      const res = await fetch(`/api/super-admin/users/${u.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Usuario eliminado");
      fetchData();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleRenew = async () => {
    if (!renewPlanId) { toast.error("Selecciona un plan"); return; }
    setRenewing(true);
    try {
      const res = await fetch("/api/super-admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: tenant!.id, planId: renewPlanId, amount: renewAmount || undefined }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success("Suscripción renovada");
      setShowRenew(false); fetchData();
    } catch (e: any) { toast.error(e.message); }
    finally { setRenewing(false); }
  };

  const openRenew = () => {
    setShowRenew(true);
    if (plans.length > 0) {
      const activePlan = plans.find((p) => p.id === tenant?.planId);
      setRenewPlanId(activePlan?.id || plans[0].id);
      setRenewAmount(activePlan?.price || plans[0]?.price || 0);
    }
  };

  const daysLeft = tenant?.expirationDate
    ? Math.max(0, Math.ceil((new Date(tenant.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const cop = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

  if (!tenant) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-[95vw] sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {tenant.name}
            <code className="text-xs font-mono text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded">{tenant.slug}</code>
            <Badge variant="outline">{tenant.plan}</Badge>
            <Badge variant={tenant.active ? "secondary" : "destructive"}>{tenant.active ? "Activo" : "Inactivo"}</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Stats section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Users className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Usuarios</p>
              <p className="text-lg font-bold">{users.length}/{tenant.maxUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Zap className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Scans IA</p>
              <p className="text-lg font-bold">{tenant.aiScansUsed}/{tenant.aiScansLimit}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Calendar className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Vencimiento</p>
              <p className={`text-lg font-bold ${daysLeft !== null && daysLeft <= 7 ? "text-red-600" : daysLeft !== null && daysLeft <= 15 ? "text-amber-600" : ""}`}>
                {tenant.expirationDate
                  ? `${daysLeft} días`
                  : "Sin fecha"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <RefreshCw className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Suscripciones</p>
              <p className="text-lg font-bold">{subscriptions.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Users section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Usuarios</h3>
            <Button variant="outline" size="sm" onClick={() => setShowCreateUser(!showCreateUser)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
            </Button>
          </div>

          {showCreateUser && (
            <Card className="mb-3 border-dashed">
              <CardContent className="p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Nuevo usuario para {tenant.name}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCreateUser(false)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Nombre" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="h-8 text-xs" />
                  <Input placeholder="Email" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="h-8 text-xs" />
                  <Input placeholder="Contraseña" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} className="h-8 text-xs" />
                  <Input placeholder="Rol ID (opcional)" value={newUserRoleId} onChange={(e) => setNewUserRoleId(e.target.value)} className="h-8 text-xs" />
                </div>
                <Button size="sm" onClick={handleCreateUser} disabled={creatingUser}>{creatingUser ? "Creando..." : "Crear Usuario"}</Button>
              </CardContent>
            </Card>
          )}

          {users.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Sin usuarios en este tenant.</p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-slate-50 text-left">
                    <th className="py-2 px-3 font-semibold">Nombre</th>
                    <th className="py-2 px-3 font-semibold">Email</th>
                    <th className="py-2 px-3 font-semibold">Rol</th>
                    <th className="py-2 px-3 font-semibold text-center">Estado</th>
                    <th className="py-2 px-3 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium">{u.name}</td>
                      <td className="py-2 px-3 font-mono">{u.email}</td>
                      <td className="py-2 px-3"><Badge variant="outline" className="text-[10px]">{u.role.name}</Badge></td>
                      <td className="py-2 px-3 text-center">
                        <Badge variant={u.active ? "secondary" : "destructive"} className="text-[10px]">{u.active ? "Activo" : "Inactivo"}</Badge>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary"><Edit className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteUser(u)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Separator />

        {/* Renewal History */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Historial de Renovaciones</h3>
            <Button variant="outline" size="sm" onClick={openRenew}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Renovar
            </Button>
          </div>

          {subscriptions.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Sin suscripciones registradas.</p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-slate-50 text-left">
                    <th className="py-2 px-3 font-semibold">Plan</th>
                    <th className="py-2 px-3 font-semibold">Inicio</th>
                    <th className="py-2 px-3 font-semibold">Fin</th>
                    <th className="py-2 px-3 font-semibold text-right">Monto</th>
                    <th className="py-2 px-3 font-semibold text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium">{s.plan.name}</td>
                      <td className="py-2 px-3">{new Date(s.startDate).toLocaleDateString("es-CO")}</td>
                      <td className="py-2 px-3">{new Date(s.endDate).toLocaleDateString("es-CO")}</td>
                      <td className="py-2 px-3 text-right font-mono">{cop(s.amount)}</td>
                      <td className="py-2 px-3 text-center">
                        <Badge variant={s.active ? "secondary" : "outline"} className="text-[10px]">{s.active ? "Activa" : "Finalizada"}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Renew sub-modal */}
      <Dialog open={showRenew} onOpenChange={setShowRenew}>
        <DialogContent className="max-w-[95vw] sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Renovar Suscripción - {tenant.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Plan</p>
              <select className="w-full border rounded px-3 py-2 text-sm" value={renewPlanId} onChange={(e) => {
                setRenewPlanId(e.target.value);
                const selected = plans.find((p) => p.id === e.target.value);
                if (selected) setRenewAmount(selected.price * selected.durationDays);
              }}>
                {plans.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.durationDays}d)</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Monto Total (COP)</p>
              <Input type="number" min={0} step={1000} value={renewAmount} onChange={(e) => setRenewAmount(Number(e.target.value))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowRenew(false)}>Cancelar</Button>
              <Button onClick={handleRenew} disabled={renewing}>{renewing ? "Renovando..." : "Renovar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
