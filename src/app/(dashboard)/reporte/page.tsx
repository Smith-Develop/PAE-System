import { prisma } from "@/lib/prisma";
import { ReportTable } from "@/components/reporte/report-table";
import { FileSpreadsheet } from "lucide-react";

export default async function ReportePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  
  // Lógica de filtrado por mes
  let whereClause = {};
  if (month) {
    const [year, m] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(m) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(m), 0, 23, 59, 59);
    
    whereClause = {
      fechaCompra: {
        gte: startDate,
        lte: endDate,
      },
      cantidadComprada: {
        gt: 0 // Excluir compras con cantidad 0
      }
    };
  } else {
    // Si no hay filtro, solo exluimos los de 0
    whereClause = {
      cantidadComprada: {
        gt: 0
      }
    };
  }

  const purchases = await prisma.purchase.findMany({
    where: whereClause,
    include: {
      product: {
        include: {
          provider: true,
          foodGroup: true,
        }
      },
      operator: true,
    },
    orderBy: { fechaCompra: "asc" },
  });

  // Mapear los datos según las 30 columnas exactas
  const reportData = purchases.map((purchase) => {
    const product = purchase.product;
    const provider = product.provider;
    const operator = purchase.operator || {
      nombreOperador: "",
      nitOperador: "",
      modeloAtencion: "",
      modalidadAtencion: "",
      direccionBodega: "",
      municipioBodega: "",
      contactoBodega: "",
      telefonoBodega: "",
    };
    const dateObj = new Date(purchase.fechaCompra);
    const mesFormat = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

    return {
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
      "GRUPO ALIMENTOS (Res 719)": product.foodGroup?.name || "",
      "ALIMENTOS (Res 719)": product.alimento,
      "DESCRIPCIÓN Y MARCA": product.descripcionMarca,
      "REGISTRO SANITARIO": product.registroSanitario || "",
      "FECHA VISITA": provider.fechaVisita || "",
      "CONCEPTO SANITARIO": provider.conceptoSanitario || "",
      "ENTIDAD EMISORA": provider.entidadEmisora || "",
      "MES COMPRA": mesFormat,
      "ALIMENTO COMPRADO": product.alimento,
      "CANTIDAD TOTAL COMPRADA": purchase.cantidadComprada,
      "UNIDAD": product.unidadMedida,
      "VALOR TOTAL": purchase.valorTotal,
    };
  });

  return (
    <div className="p-6 space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <FileSpreadsheet className="h-6 w-6" /> Reporte Gobernación (Res 719)
          </h1>
          <p className="text-muted-foreground">
            Tabla consolidada cruzando compras y productos. Listo para exportar.
          </p>
        </div>
        
        {/* Aquí iría un componente cliente para cambiar la URL con el parametro ?month=YYYY-MM */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filtrar por mes:</span>
          <form className="flex gap-2">
            <input 
              type="month" 
              name="month" 
              defaultValue={month} 
              className="border rounded px-2 py-1 bg-white"
            />
            <button type="submit" className="bg-primary text-white px-4 py-1 rounded-md text-sm font-bold hover:bg-primary/90 transition-colors">
              Aplicar
            </button>
          </form>
        </div>
      </div>

      <ReportTable reportData={reportData} />
    </div>
  );
}
