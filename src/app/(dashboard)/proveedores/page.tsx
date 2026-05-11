import { prisma } from "@/lib/prisma";
import { ProviderList } from "@/components/proveedores/provider-list";
import { Truck } from "lucide-react";

export default async function ProveedoresPage() {
  const providers = await prisma.provider.findMany({
    orderBy: { razonSocial: "asc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <Truck className="h-6 w-6" /> Directorio de Proveedores
          </h1>
          <p className="text-muted-foreground">
            Gestiona los datos legales y comerciales de los proveedores para el reporte.
          </p>
        </div>
      </div>

      <ProviderList providers={providers} />
    </div>
  );
}
