import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { OperatorList } from "@/components/operadores/operator-list";
import { Building } from "lucide-react";

export default async function OperadoresPage() {
  const where = await withTenant();

  const operators = await prisma.operator.findMany({
    where,
    orderBy: { nombreOperador: "asc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <Building className="h-6 w-6" /> Gestión de Operadores
          </h1>
          <p className="text-muted-foreground">
            Administra los operadores del programa PAE y sus datos de contacto.
          </p>
        </div>
      </div>

      <OperatorList initialOperators={operators} />
    </div>
  );
}
