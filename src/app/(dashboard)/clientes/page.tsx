import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { ClientList } from "@/components/clientes/client-list";
import { Users } from "lucide-react";

export default async function ClientesPage() {
  const where = await withTenant();

  const clients = await prisma.client.findMany({
    where,
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <Users className="h-6 w-6" /> Clientes
          </h1>
          <p className="text-muted-foreground">
            Gestiona las instituciones educativas y dependencias que reciben los
            pedidos.
          </p>
        </div>
      </div>

      <ClientList clients={clients} />
    </div>
  );
}
