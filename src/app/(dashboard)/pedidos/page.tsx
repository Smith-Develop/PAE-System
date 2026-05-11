import { prisma } from "@/lib/prisma";
import { OrderCalculator } from "@/components/pedidos/order-calculator";
import { Calculator } from "lucide-react";

export default async function PedidosPage() {
  const [recipes, operators, masterProducts, clients] = await Promise.all([
    prisma.recipe.findMany({
      include: {
        ingredients: {
          include: {
            masterProduct: true,
          },
        },
      },
      orderBy: { nombre: "asc" },
    }),
    prisma.operator.findMany({
      orderBy: { nombreOperador: "asc" },
    }),
    prisma.masterProduct.findMany({
      include: {
        providerProducts: {
          include: {
            provider: true,
          },
        },
      },
    }),
    prisma.client.findMany({
      orderBy: { nombre: "asc" },
    }),
  ]);

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <Calculator className="h-6 w-6" /> Registro de Pedidos
          </h1>
          <p className="text-muted-foreground">
            Ingresa las raciones para realizar la explosión de materiales y
            generar la lista de empaque.
          </p>
        </div>
      </div>

      <div className="flex-1">
        <OrderCalculator
          recipes={recipes}
          operators={operators}
          masterProducts={masterProducts}
          clients={clients}
        />
      </div>
    </div>
  );
}
