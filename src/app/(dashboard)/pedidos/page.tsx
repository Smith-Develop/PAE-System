import { prisma } from "@/lib/prisma";
import { OrderCalculator } from "@/components/pedidos/order-calculator";
import { Calculator } from "lucide-react";

export default async function PedidosPage() {
  const [menus, operators, masterProducts, clients] = await Promise.all([
    prisma.menu.findMany({
      include: {
        dishes: {
          include: {
            dish: {
              include: {
                componente: true,
                ingredients: {
                  include: { masterProduct: true },
                },
              },
            },
          },
          orderBy: { orden: "asc" },
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
            Selecciona un menú e ingresa las raciones para generar la lista de
            empaque.
          </p>
        </div>
      </div>

      <div className="flex-1">
        <OrderCalculator
          menus={menus}
          operators={operators}
          masterProducts={masterProducts}
          clients={clients}
        />
      </div>
    </div>
  );
}
