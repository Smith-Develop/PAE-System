"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Settings,
  User,
  Key,
  Save,
  Download,
  Upload,
  Database,
  Shield,
  Check,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function SettingsPanel() {
  // Perfil
  const [profile, setProfile] = useState({ name: "", email: "", role: "" });
  const [newName, setNewName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Backup
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setNewName(data.name || "");
      })
      .catch(() => {});
  }, []);

  const handleUpdateProfile = async () => {
    if (!newName.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    setLoadingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error");
      }
      toast.success("Perfil actualizado");
      setProfile((p) => ({ ...p, name: newName.trim() }));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Completa todos los campos");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setLoadingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error");
      }
      toast.success("Contraseña actualizada. Deberás iniciar sesión nuevamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDownloadBackup = async () => {
    setLoadingBackup(true);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) throw new Error("Error al descargar");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-pae-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup descargado exitosamente");
    } catch {
      toast.error("Error al generar el backup");
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("¿Estás seguro de restaurar este backup? Se SOBRESCRIBIRÁN todos los datos actuales. Esta acción no se puede deshacer.")) {
      e.target.value = "";
      return;
    }

    setLoadingRestore(true);
    try {
      const data = JSON.parse(await file.text());
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al restaurar");
      }
      toast.success("Base de datos restaurada exitosamente. Recarga la página.");
    } catch (e: any) {
      toast.error(e.message || "Error al restaurar");
    } finally {
      setLoadingRestore(false);
      e.target.value = "";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none gap-1 mb-8">
          <TabsTrigger value="profile" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            <User className="h-4 w-4 mr-2" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            <Key className="h-4 w-4 mr-2" /> Contraseña
          </TabsTrigger>
          <TabsTrigger value="backup" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            <Database className="h-4 w-4 mr-2" /> Backup
          </TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="profile" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Información del Perfil</CardTitle>
              <CardDescription>Actualiza tu nombre de usuario.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase">Email</Label>
                  <p className="font-mono text-sm bg-slate-50 px-3 py-2 rounded border">{profile.email}</p>
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
                {loadingProfile ? "Guardando..." : <><Save className="h-4 w-4 mr-2" /> Guardar Cambios</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contraseña */}
        <TabsContent value="security" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> Cambiar Contraseña</CardTitle>
              <CardDescription>Actualiza tu contraseña de acceso. Mínimo 6 caracteres.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPwd">Contraseña Actual</Label>
                <Input id="currentPwd" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="newPwd">Nueva Contraseña</Label>
                <Input id="newPwd" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPwd">Confirmar Nueva Contraseña</Label>
                <Input id="confirmPwd" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la nueva contraseña" />
              </div>
              <Button onClick={handleChangePassword} disabled={loadingPassword}>
                {loadingPassword ? "Actualizando..." : <><Check className="h-4 w-4 mr-2" /> Actualizar Contraseña</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="backup" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Descargar Copia de Seguridad</CardTitle>
              <CardDescription>Exporta todos los datos de la base de datos en formato JSON.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleDownloadBackup} disabled={loadingBackup} variant="default">
                {loadingBackup ? "Generando..." : <><Download className="h-4 w-4 mr-2" /> Descargar Backup (JSON)</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800"><Upload className="h-5 w-5" /> Restaurar Copia de Seguridad</CardTitle>
              <CardDescription className="text-amber-700">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Esta acción sobrescribirá todos los datos actuales. Asegúrate de tener un backup reciente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
              <Button
                variant="outline"
                className="border-amber-300 text-amber-800 hover:bg-amber-100"
                onClick={() => fileInputRef.current?.click()}
                disabled={loadingRestore}
              >
                {loadingRestore ? "Restaurando..." : <><Upload className="h-4 w-4 mr-2" /> Seleccionar Archivo y Restaurar</>}
              </Button>
              {loadingRestore && <p className="text-sm text-amber-600">Restaurando datos, esto puede tomar unos segundos...</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
