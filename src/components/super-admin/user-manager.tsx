"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users, Building } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Role { id: string; name: string; }
interface TenantInfo { id: string; name: string; slug: string; }

interface UserItem {
  id: string; name: string; email: string;
  role: Role; tenant: TenantInfo | null;
  active: boolean; createdAt: string;
}

export function UserManager() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/super-admin/users");
      if (res.ok) setUsers(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  const fetchMeta = async () => {
    try {
      const [rRes, tRes] = await Promise.all([
        fetch("/api/roles"),
        fetch("/api/super-admin/tenants"),
      ]);
      if (rRes.ok) setRoles(await rRes.json());
      if (tRes.ok) setTenants(await tRes.json());
    } catch {}
  };

  useEffect(() => { fetchUsers(); fetchMeta(); }, []);

  const openCreate = () => {
    setEditing(null); setName(""); setEmail(""); setPassword(""); setRoleId("");
    setTenantId(""); setActive(true); setModalOpen(true);
  };

  const openEdit = (u: UserItem) => {
    setEditing(u); setName(u.name); setEmail(u.email); setPassword("");
    setRoleId(u.role.id); setTenantId(u.tenant?.id || ""); setActive(u.active);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name || !email) { toast.error("Nombre y email requeridos"); return; }
    if (!editing && !password) { toast.error("Contraseña requerida"); return; }
    if (!roleId) { toast.error("Rol requerido"); return; }

    setSaving(true);
    try {
      const url = editing ? `/api/super-admin/users/${editing.id}` : "/api/super-admin/users";
      const method = editing ? "PUT" : "POST";
      const body: any = { name, email, roleId, active, tenantId: tenantId || null };
      if (password) body.password = password;

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success(editing ? "Usuario actualizado" : "Usuario creado");
      setModalOpen(false); fetchUsers();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (u: UserItem) => {
    if (!confirm(`¿Eliminar el usuario "${u.name}"?`)) return;
    try {
      const res = await fetch(`/api/super-admin/users/${u.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Usuario eliminado");
      fetchUsers();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold flex items-center gap-2"><Users className="h-5 w-5" /> Gestión de Usuarios</h2>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-2" /> Nuevo Usuario</Button>
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
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Rol</th>
                  <th className="py-3 px-4 font-semibold">Tenant</th>
                  <th className="py-3 px-4 font-semibold text-center">Estado</th>
                  <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{u.name}</td>
                    <td className="py-3 px-4 font-mono text-xs">{u.email}</td>
                    <td className="py-3 px-4"><Badge variant="outline">{u.role.name}</Badge></td>
                    <td className="py-3 px-4">
                      {u.tenant ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          {u.tenant.name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin tenant</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={u.active ? "secondary" : "destructive"}>{u.active ? "Activo" : "Inactivo"}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(u)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(u)}><Trash2 className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Nombre</p>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Pérez" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Email</p>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juan@ejemplo.com" type="email" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Contraseña {editing && "(dejar vacío para no cambiar)"}</p>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" type="password" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Rol</p>
              <select className="w-full border rounded px-3 py-2 text-sm" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                <option value="">Seleccionar rol...</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Tenant (opcional)</p>
              <select className="w-full border rounded px-3 py-2 text-sm" value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
                <option value="">Sin tenant (Super Admin)</option>
                {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="user-active" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <label htmlFor="user-active" className="text-sm cursor-pointer">Usuario activo</label>
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
