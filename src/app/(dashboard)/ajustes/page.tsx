import { auth } from "@/lib/auth";
import { SettingsPanel } from "@/components/ajustes/settings-panel";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const session = await auth();
  const user = session?.user || { name: "", email: "", role: "" };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
          <Settings className="h-6 w-6" /> Ajustes
        </h1>
        <p className="text-muted-foreground">
          Configuración del perfil, seguridad y respaldo de datos.
        </p>
      </div>
      <SettingsPanel user={user} />
    </div>
  );
}
