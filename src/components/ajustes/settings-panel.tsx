"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  User, Key, Save, Download, Upload, Database, AlertTriangle,
  Users, Plus, Edit, Trash2, Shield, Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface UserData {
  id: string; name: string; email: string;
  role: { id: string; name: string }; active: boolean;
  createdAt: string;
}

interface SettingsPanelProps {
  user: { name?: string | null; email?: string | null; role?: string };
}

export function SettingsPanel({ user }: SettingsPanelProps) {
  // Perfil
  const [newName, setNewName] = useState(user.name || "");
  const [newEmail, setNewEmail] = useState(user.email || "");
  const [loadingProfile, setLoadingProfile] = useState(false);
  // Contraseña
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Backup
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Usuarios
  const [userList, setUserList] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [uName, setUName] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uRoleId, setURoleId] = useState("");
  const [uActive, setUActive] = useState(true);
  const [loadingUser, setLoadingUser] = useState(false);

  const fetchUsers = async () => {
    try {
      const [uRes, rRes] = await Promise.all([
        fetch("/api/users"), fetch("/api/roles"),
      ]);
      if (uRes.ok) setUserList(await uRes.json());
      if (rRes.ok) setRoles(await rRes.json());
    } catch {}
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- Perfil ---
  const handleUpdateProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), email: newEmail.trim() }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success("Perfil actualizado. Si cambiaste el email, inicia sesión de nuevo.");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoadingProfile(false); }
  };

  // --- Contraseña ---
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      toast.error(newPassword !== confirmPassword ? "No coinciden" : "Completa los campos");
      return;
    }
    if (newPassword.length < 6) { toast.error("Mínimo 6 caracteres"); return; }
    setLoadingPassword(true);
    try {
      const res = await fetch("/api/user/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success("Contraseña actualizada");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoadingPassword(false); }
  };

  // --- Backup ---
  const handleDownloadBackup = async () => {
    setLoadingBackup(true);
    try {
      const res = await fetch("/api/backup"); if (!res.ok) throw new Error("");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `backup-pae-${new Date().toISOString().slice(0, 10)}.json`;
      a.click(); URL.revokeObjectURL(a.href);
      toast.success("Backup descargado");
    } catch { toast.error("Error al generar backup"); }
    finally { setLoadingBackup(false); }
  };
  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!confirm("¿Restaurar? Se sobrescribirán todos los datos.")) { e.target.value = ""; return; }
    setLoadingRestore(true);
    try {
      const data = JSON.parse(await file.text());
      const res = await fetch("/api/backup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("BD restaurada. Recarga la página.");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoadingRestore(false); e.target.value = ""; }
  };

  // --- Usuarios ---
  const openCreateUser = () => {
    setEditingUser(null);
    setUName(""); setUEmail(""); setUPassword(""); setURoleId(roles[0]?.id || ""); setUActive(true);
    setUserModalOpen(true);
  };
  const openEditUser = (u: UserData) => {
    setEditingUser(u);
    setUName(u.name); setUEmail(u.email); setUPassword(""); setURoleId(u.role.id); setUActive(u.active);
    setUserModalOpen(true);
  };
  const handleSaveUser = async () => {
    if (!uName || !uEmail || !uRoleId) { toast.error("Completa nombre, email y rol"); return; }
    if (!editingUser && (!uPassword || uPassword.length < 6)) { toast.error("Contraseña mín 6 caracteres"); return; }
    setLoadingUser(true);
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";
      const body: any = { name: uName, email: uEmail, roleId: uRoleId, active: uActive };
      if (uPassword) body.password = uPassword;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success(editingUser ? "Usuario actualizado" : "Usuario creado");
      setUserModalOpen(false); fetchUsers();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoadingUser(false); }
  };
  const handleDeleteUser = async (u: UserData) => {
    if (!confirm(`¿Eliminar a ${u.name}?`)) return;
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success("Usuario eliminado"); fetchUsers();
    } catch (e: any) { toast.error(e.message); }
  };
  const handleToggleActive = async (u: UserData) => {
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !u.active }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(u.active ? "Usuario desactivado" : "Usuario activado");
      fetchUsers();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="profile">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />Perfil</TabsTrigger>
          <TabsTrigger value="security"><Key className="h-4 w-4 mr-2" />Contraseña</TabsTrigger>
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" />Usuarios</TabsTrigger>
          <TabsTrigger value="backup"><Database className="h-4 w-4 mr-2" />Backup</TabsTrigger>
        </TabsList>

        {/* PERFIL */}
        <TabsContent value="profile" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle><User className="h-5 w-5 inline mr-2" />Información del Perfil</CardTitle>
              <CardDescription>Actualiza tu nombre y correo electrónico.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Email actual</p>
                  <p className="font-mono text-sm bg-slate-50 px-3 py-2 rounded border">{user.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Rol</p>
                  <Badge variant="secondary" className="font-bold">{user.role || "—"}</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Nombre</p>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Tu nombre" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-1"><Mail className="h-3 w-3" /> Nuevo Email</p>
                <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="nuevo@email.com" />
              </div>
              <Button onClick={handleUpdateProfile} disabled={loadingProfile}>
                <Save className="h-4 w-4 mr-2" />{loadingProfile ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTRASEÑA */}
        <TabsContent value="security" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle><Key className="h-5 w-5 inline mr-2" />Cambiar Contraseña</CardTitle>
              <CardDescription>Mínimo 6 caracteres.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Contraseña Actual</p>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Nueva Contraseña</p>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Confirmar Nueva</p>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <Button onClick={handleChangePassword} disabled={loadingPassword}>
                {loadingPassword ? "Actualizando..." : "Actualizar Contraseña"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* USUARIOS */}
        <TabsContent value="users" className="space-y-6 mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle><Users className="h-5 w-5 inline mr-2" />Gestión de Usuarios</CardTitle>
                <CardDescription>Crea, edita y administra los usuarios del sistema.</CardDescription>
              </div>
              <Button onClick={openCreateUser} size="sm"><Plus className="h-4 w-4 mr-2" />Nuevo Usuario</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userList.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay usuarios</TableCell></TableRow>
                  ) : userList.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="font-mono text-sm">{u.email}</TableCell>
                      <TableCell><Badge variant="outline">{u.role.name}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={u.active ? "secondary" : "destructive"} className="cursor-pointer" onClick={() => handleToggleActive(u)}>
                          {u.active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditUser(u)} className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u)} className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BACKUP */}
        <TabsContent value="backup" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle><Download className="h-5 w-5 inline mr-2" />Copias de Seguridad</CardTitle>
              <CardDescription>Exporta todos los datos en formato JSON.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleDownloadBackup} disabled={loadingBackup}>
                <Download className="h-4 w-4 mr-2" />{loadingBackup ? "Generando..." : "Descargar Backup"}
              </Button>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="text-amber-800"><Upload className="h-5 w-5 inline mr-2" />Restaurar</CardTitle>
              <CardDescription className="text-amber-700">
                <AlertTriangle className="h-4 w-4 inline mr-1" />Sobrescribe todos los datos actuales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
              <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100" onClick={() => fileInputRef.current?.click()} disabled={loadingRestore}>
                <Upload className="h-4 w-4 mr-2" />{loadingRestore ? "Restaurando..." : "Seleccionar y Restaurar"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Crear/Editar Usuario */}
      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Nombre</p>
              <Input value={uName} onChange={(e) => setUName(e.target.value)} placeholder="Nombre completo" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Email</p>
              <Input type="email" value={uEmail} onChange={(e) => setUEmail(e.target.value)} placeholder="usuario@pae.gov.co" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Contraseña {editingUser ? "(dejar vacía para no cambiar)" : ""}</p>
              <Input type="password" value={uPassword} onChange={(e) => setUPassword(e.target.value)} placeholder={editingUser ? "••••••" : "Mín 6 caracteres"} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Rol</p>
              <Combobox options={roles.map(r => ({ label: r.name, value: r.id }))} value={uRoleId} onValueChange={setURoleId} placeholder="Seleccionar rol" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ua" checked={uActive} onChange={(e) => setUActive(e.target.checked)} />
              <label htmlFor="ua" className="text-sm cursor-pointer">Usuario activo</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setUserModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveUser} disabled={loadingUser}>{loadingUser ? "Guardando..." : "Guardar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
