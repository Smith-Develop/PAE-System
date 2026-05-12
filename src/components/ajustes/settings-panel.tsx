"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  User,
  Key,
  Save,
  Download,
  Upload,
  Database,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface SettingsPanelProps {
  user: { name?: string | null; email?: string | null; role?: string };
}

export function SettingsPanel({ user }: SettingsPanelProps) {
  const [newName, setNewName] = useState(user.name || "");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdateProfile = async () => {
    if (!newName.trim()) { toast.error("El nombre no puede estar vacío"); return; }
    setLoadingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success("Perfil actualizado");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoadingProfile(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { toast.error("Completa todos los campos"); return; }
    if (newPassword.length < 6) { toast.error("Mínimo 6 caracteres"); return; }
    if (newPassword !== confirmPassword) { toast.error("Las contraseñas no coinciden"); return; }
    setLoadingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success("Contraseña actualizada");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoadingPassword(false); }
  };

  const handleDownloadBackup = async () => {
    setLoadingBackup(true);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) throw new Error("Error al descargar");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `backup-pae-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Backup descargado");
    } catch { toast.error("Error al generar el backup"); }
    finally { setLoadingBackup(false); }
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm("¿Restaurar backup? Se SOBRESCRIBIRÁN todos los datos actuales.")) { e.target.value = ""; return; }
    setLoadingRestore(true);
    try {
      const data = JSON.parse(await file.text());
      const res = await fetch("/api/backup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success("Base de datos restaurada. Recarga la página.");
    } catch (e: any) { toast.error(e.message || "Error"); }
    finally { setLoadingRestore(false); e.target.value = ""; }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />Perfil</TabsTrigger>
          <TabsTrigger value="security"><Key className="h-4 w-4 mr-2" />Contraseña</TabsTrigger>
          <TabsTrigger value="backup"><Database className="h-4 w-4 mr-2" />Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle><User className="h-5 w-5 inline mr-2" />Información del Perfil</CardTitle>
              <CardDescription>Actualiza tu nombre de usuario.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Email</p>
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
              <Button onClick={handleUpdateProfile} disabled={loadingProfile}>
                <Save className="h-4 w-4 mr-2" />{loadingProfile ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

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
    </div>
  );
}
