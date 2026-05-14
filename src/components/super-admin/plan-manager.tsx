"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Layers } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface PlanItem {
  id: string; name: string; description: string | null;
  maxUsers: number; aiScansLimit: number; price: number;
  durationDays: number; active: boolean; mercadoPagoPlanId: string | null;
  _count: { tenants: number };
}

const cop = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

export function PlanManager() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlanItem | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxUsers, setMaxUsers] = useState(5);
  const [aiScansLimit, setAiScansLimit] = useState(10);
  const [price, setPrice] = useState(0);
  const [durationDays, setDurationDays] = useState(30);
  const [active, setActive] = useState(true);
  const [mercadoPagoPlanId, setMercadoPagoPlanId] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/super-admin/plans");
      if (res.ok) setPlans(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => {
    setEditing(null); setName(""); setDescription(""); setMaxUsers(5);
    setAiScansLimit(10); setPrice(0); setDurationDays(30); setActive(true);
    setMercadoPagoPlanId(""); setModalOpen(true);
  };

  const openEdit = (p: PlanItem) => {
    setEditing(p); setName(p.name); setDescription(p.description || "");
    setMaxUsers(p.maxUsers); setAiScansLimit(p.aiScansLimit); setPrice(p.price);
    setDurationDays(p.durationDays); setActive(p.active);
    setMercadoPagoPlanId(p.mercadoPagoPlanId || ""); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name) { toast.error("Nombre requerido"); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/super-admin/plans/${editing.id}` : "/api/super-admin/plans";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, description: description || null,
          maxUsers, aiScansLimit, price,
          durationDays, active,
          mercadoPagoPlanId: mercadoPagoPlanId || null,
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success(editing ? "Plan actualizado" : "Plan creado");
      setModalOpen(false); fetchPlans();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (p: PlanItem) => {
    if (p._count.tenants > 0) {
      toast.error(`El plan "${p.name}" tiene ${p._count.tenants} tenant(s) activo(s). Reasígnalos primero.`);
      return;
    }
    if (!confirm(`¿Eliminar el plan "${p.name}"?`)) return;
    try {
      const res = await fetch(`/api/super-admin/plans/${p.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Plan eliminado");
      fetchPlans();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold flex items-center gap-2"><Layers className="h-5 w-5" /> Gestión de Planes</h2>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-2" /> Nuevo Plan</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm py-8 text-center">Cargando...</p>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-slate-50">
                  <th className="py-3 px-4 font-semibold">Nombre</th>
                  <th className="py-3 px-4 font-semibold">Descripción</th>
                  <th className="py-3 px-4 font-semibold text-center">Max Users</th>
                  <th className="py-3 px-4 font-semibold text-center">Scans IA</th>
                  <th className="py-3 px-4 font-semibold text-right">Precio</th>
                  <th className="py-3 px-4 font-semibold text-center">Duración</th>
                  <th className="py-3 px-4 font-semibold text-center">Estado</th>
                  <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{p.name}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground max-w-[180px] truncate">{p.description || "-"}</td>
                    <td className="py-3 px-4 text-center">{p.maxUsers}</td>
                    <td className="py-3 px-4 text-center">{p.aiScansLimit}/mes</td>
                    <td className="py-3 px-4 text-right font-mono text-xs">{cop(p.price)}</td>
                    <td className="py-3 px-4 text-center">{p.durationDays} días</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={p.active ? "secondary" : "destructive"}>{p.active ? "Activo" : "Inactivo"}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[480px]">
          <DialogHeader><DialogTitle>{editing ? "Editar Plan" : "Nuevo Plan"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Nombre</p>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Basic" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Descripción</p>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Plan básico..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Max Usuarios</p>
                <Input type="number" min={1} value={maxUsers} onChange={(e) => setMaxUsers(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Scans IA / Mes</p>
                <Input type="number" min={0} value={aiScansLimit} onChange={(e) => setAiScansLimit(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Precio mensual (COP)</p>
                <Input type="number" min={0} step={1000} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Duración (días)</p>
                <Input type="number" min={1} value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">MercadoPago Plan ID</p>
              <Input value={mercadoPagoPlanId} onChange={(e) => setMercadoPagoPlanId(e.target.value)} placeholder="2c938084..." />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="plan-active" checked={active} onCheckedChange={(c) => setActive(!!c)} />
              <label htmlFor="plan-active" className="text-sm cursor-pointer">Plan activo</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
