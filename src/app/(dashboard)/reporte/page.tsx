import { prisma } from "@/lib/prisma";
import { ReportTable } from "@/components/reporte/report-table";
import { FileSpreadsheet } from "lucide-react";

export default async function ReportePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; clientId?: string }>;
}) {
  const { month, clientId } = await searchParams;

  const whereOrder: any = {};
  const whereMaterial: any = {};

  if (month) {
    const [year, m] = month.split("-");
    const startDate = new Date(parseInt(year), parseInt(m) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(m), 0, 23, 59, 59);

    whereOrder.fecha = {
      gte: startDate,
      lte: endDate,
    };
  }

  if (clientId) {
    whereOrder.clientId = clientId;
  }

  const [orders, clients] = await Promise.all([
    prisma.order.findMany({
      where: whereOrder,
      include: {
        client: true,
        operator: true,
        materials: {
          include: {
            masterProduct: {
              include: { foodGroup: true },
            },
            product: {
              include: {
                provider: true,
              },
            },
          },
        },
      },
      orderBy: { fecha: "asc" },
    }),
    prisma.client.findMany({
      orderBy: { nombre: "asc" },
    }),
  ]);

  // Aplanar: cada OrderMaterial → una fila del reporte
  const reportData: Record<string, any>[] = [];

  for (const order of orders) {
    const operator = order.operator || {
      nombreOperador: "",
      nitOperador: "",
      modeloAtencion: "",
      modalidadAtencion: "",
      direccionBodega: "",
      municipioBodega: "",
      contactoBodega: "",
      telefonoBodega: "",
    };
    const dateObj = new Date(order.fecha);
    const mesFormat = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;

    for (const material of order.materials) {
      const product = material.product;
      const master = material.masterProduct;
      const provider = product.provider;

      if (material.cantidadTotal <= 0) continue;

      reportData.push({
        "NOMBRE DEL OPERADOR": operator.nombreOperador,
        "CC/NIT OPERADOR": operator.nitOperador,
        "MODELO ATENCIÓN": operator.modeloAtencion,
        "MODALIDAD ATENCIÓN": operator.modalidadAtencion,
        "DIRECCIÓN BODEGA": operator.direccionBodega,
        "MUNICIPIO BODEGA": operator.municipioBodega,
        "CONTACTO BODEGA": operator.contactoBodega,
        "TELÉFONO BODEGA": operator.telefonoBodega,
        "RAZÓN SOCIAL PROVEEDOR": provider.razonSocial,
        "CÓDIGO INSCRIPCIÓN": provider.codigoInscripcion || "",
        "NIT PROVEEDOR": provider.nit,
        "REPRESENTANTE LEGAL": provider.representanteLegal,
        "MUNICIPIO PROVEEDOR": provider.municipio,
        "DIRECCIÓN ESTABLECIMIENTO": provider.direccionEstablecimiento || "",
        "TELÉFONO": provider.telefono || "",
        "CORREO": provider.correo || "",
        "TIPO ACTIVIDAD": provider.tipoActividad,
        "COMPRA LOCAL": provider.compraLocal ? "SI" : "NO",
        "GRUPO ALIMENTOS (Res 719)": master.foodGroup?.name || "",
        "ALIMENTOS (Res 719)": master.nombre,
        "DESCRIPCIÓN Y MARCA": product.descripcionMarca,
        "REGISTRO SANITARIO": product.registroSanitario || "",
        "FECHA VISITA": provider.fechaVisita || "",
        "CONCEPTO SANITARIO": provider.conceptoSanitario || "",
        "ENTIDAD EMISORA": provider.entidadEmisora || "",
        "MES COMPRA": mesFormat,
        "ALIMENTO COMPRADO": master.nombre,
        "CANTIDAD TOTAL COMPRADA": material.cantidadTotal,
        "UNIDAD": master.unidadMedida,
        "VALOR TOTAL": 0, // Los pedidos no tienen valor monetario
      });
    }
  }

  return (
    <div className="p-6 space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <FileSpreadsheet className="h-6 w-6" /> Reporte Gobernación (Res
            719)
          </h1>
          <p className="text-muted-foreground">
            Datos consolidados desde los pedidos registrados. Listo para
            exportar.
          </p>
        </div>

        <form className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Mes:</label>
            <input
              type="month"
              name="month"
              defaultValue={month}
              className="border rounded px-2 py-1 bg-white text-sm h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Cliente:</label>
            <select
              name="clientId"
              defaultValue={clientId || ""}
              className="border rounded px-2 py-1 bg-white text-sm h-9 max-w-[220px]"
            >
              <option value="">Todos los clientes</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-primary text-white px-4 py-1 rounded-md text-sm font-bold hover:bg-primary/90 transition-colors h-9"
          >
            Aplicar
          </button>
        </form>
      </div>

      <ReportTable reportData={reportData} />
    </div>
  );
}
