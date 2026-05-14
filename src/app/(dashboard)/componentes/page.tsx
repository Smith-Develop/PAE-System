import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { ComponentList } from "@/components/componentes/component-list";
import { Puzzle } from "lucide-react";

export default async function ComponentesPage() {
  const where = await withTenant();

  const components = await prisma.component.findMany({
    where,
    include: {
      _count: { select: { dishes: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <Puzzle className="h-6 w-6" /> Componentes de Plato
          </h1>
          <p className="text-muted-foreground">
            Define los tipos de componentes (Proteína, Cereal, Fruta, etc.)
            para clasificar los platos.
          </p>
        </div>
      </div>

      <ComponentList components={components} />
    </div>
  );
}
