"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Building, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Tenant {
  id: string; name: string; slug: string; plan: string; active: boolean;
  maxUsers: number; aiScansLimit: number; aiScansUsed: number;
  _count: { users: number };
}

export function TenantManager() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState("free");
  const [active, setActive] = useState(true);
  const [maxUsers, setMaxUsers] = useState(5);
  const [aiScansLimit, setAiScansLimit] = useState(10);
  const [saving, setSaving] = useState(false);

  const fetchTenants = async () => {
    try {
      const res = await fetch("/api/super-admin/tenants");
      if (res.ok) setTenants(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTenants(); }, []);

  const openCreate = () => {
    setEditing(null); setName(""); setSlug(""); setPlan("free"); setActive(true);
    setMaxUsers(5); setAiScansLimit(10);
    setModalOpen(true);
  };

  const openEdit = (t: Tenant) => {
    setEditing(t); setName(t.name); setSlug(t.slug); setPlan(t.plan); setActive(t.active);
    setMaxUsers(t.maxUsers); setAiScansLimit(t.aiScansLimit);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name || !slug) { toast.error("Nombre y slug requeridos"); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/super-admin/tenants/${editing.id}` : "/api/super-admin/tenants";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, slug, plan, active, maxUsers, aiScansLimit }) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success(editing ? "Tenant actualizado" : "Tenant creado");
      setModalOpen(false); fetchTenants();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (t: Tenant) => {
    if (!confirm(`¿Eliminar el tenant "${t.name}"? Se perderán todos sus datos.`)) return;
    try {
      const res = await fetch(`/api/super-admin/tenants/${t.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Tenant eliminado");
      fetchTenants();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold flex items-center gap-2"><Building className="h-5 w-5" /> Gestión de Tenants</h2>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-2" /> Nuevo Tenant</Button>
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
                  <th className="py-3 px-4 font-semibold">Slug</th>
                  <th className="py-3 px-4 font-semibold">Plan</th>
                   <th className="py-3 px-4 font-semibold text-center">Uso</th>
                  <th className="py-3 px-4 font-semibold text-center">Estado</th>
                  <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{t.name}</td>
                    <td className="py-3 px-4 font-mono text-xs">{t.slug}</td>
                    <td className="py-3 px-4"><Badge variant="outline">{t.plan}</Badge></td>
                    <td className="py-3 px-4 text-center text-xs">{t._count.users}/{t.maxUsers} users, {t.aiScansUsed}/{t.aiScansLimit} scans</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={t.active ? "secondary" : "destructive"}>{t.active ? "Activo" : "Inactivo"}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`/t/${t.slug}`, "_blank")} title="Abrir tenant"><ExternalLink className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(t)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(t)}><Trash2 className="h-4 w-4" /></Button>
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
        <DialogContent className="max-w-[95vw] sm:max-w-[450px]">
          <DialogHeader><DialogTitle>{editing ? "Editar Tenant" : "Nuevo Tenant"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Nombre</p>
              <Input value={name} onChange={(e) => { setName(e.target.value); if (!editing) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); }} placeholder="PAE Antioquia" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Slug</p>
              <Input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="pae-antioquia" disabled={!!editing} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Plan</p>
              <select className="w-full border rounded px-3 py-2 text-sm" value={plan} onChange={(e) => setPlan(e.target.value)}>
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Max Usuarios</p>
              <Input type="number" min={1} value={maxUsers} onChange={(e) => setMaxUsers(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Scans IA / Mes</p>
              <Input type="number" min={0} value={aiScansLimit} onChange={(e) => setAiScansLimit(Number(e.target.value))} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <label htmlFor="active" className="text-sm cursor-pointer">Tenant activo</label>
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
