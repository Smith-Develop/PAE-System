import { prisma } from "@/lib/prisma";
import { GroupList } from "@/components/grupos/group-list";
import { Layers } from "lucide-react";

export default async function GruposPage() {
  const groups = await prisma.foodGroup.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { masterProducts: true }
      }
    }
  });

  return (
    <div className="p-6 space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <Layers className="h-6 w-6" /> Grupos Alimentarios (Res 719)
          </h1>
          <p className="text-muted-foreground">
            Definición y descripción de los grupos alimentarios según la normativa vigente.
          </p>
        </div>
      </div>

      <GroupList initialGroups={groups} />
    </div>
  );
}
