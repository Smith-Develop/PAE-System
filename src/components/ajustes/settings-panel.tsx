"use client";

import { useState, useEffect, useRef } from "react";
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
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function SettingsPanel() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "", role: "" });
  const [newName, setNewName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setMounted(true);
    fetch("/api/user/profile")
      .then((r) => { if (!r.ok) throw new Error("Error"); return r.json(); })
      .then((data) => { setProfile(data); setNewName(data.name || ""); })
      .catch(() => toast.error("No se pudo cargar el perfil"));
  }, []);

  if (!mounted) {
    return <div className="text-center text-muted-foreground py-20">Cargando...</div>;
  }

  const handleUpdateProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success("Perfil actualizado");
      setProfile((p) => ({ ...p, name: newName.trim() }));
    } catch (e: any) { toast.error(e.message); }
    finally { setLoadingProfile(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      toast.error(newPassword !== confirmPassword ? "Las contraseñas no coinciden" : "Completa todos los campos");
      return;
    }
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
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Información del Perfil</CardTitle>
              <CardDescription>Actualiza tu nombre de usuario.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase">Email</Label>
                  <p className="font-mono text-sm bg-slate-50 px-3 py-2 rounded border">{profile.email || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase">Rol</Label>
                  <Badge variant="secondary" className="font-bold">{profile.role || "—"}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Tu nombre" />
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
              <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" />Cambiar Contraseña</CardTitle>
              <CardDescription>Mínimo 6 caracteres.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cp">Contraseña Actual</Label>
                <Input id="cp" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="np">Nueva Contraseña</Label>
                <Input id="np" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpa">Confirmar Nueva</Label>
                <Input id="cpa" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
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
              <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />Copias de Seguridad</CardTitle>
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
              <CardTitle className="flex items-center gap-2 text-amber-800"><Upload className="h-5 w-5" />Restaurar</CardTitle>
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
