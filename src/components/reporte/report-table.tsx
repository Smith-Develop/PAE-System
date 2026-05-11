"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { REPORT_COLUMNS } from "@/types";

type ReportRow = Record<(typeof REPORT_COLUMNS)[number], string | number | boolean | null>;

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReportTableProps {
  reportData: ReportRow[];
}

export function ReportTable({ reportData }: ReportTableProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    try {
      const ws = XLSX.utils.json_to_sheet(reportData, { header: [...REPORT_COLUMNS] });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte_Proveeduria");
      
      const fileName = `Reporte_Gobernacion_PAE_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Error al exportar:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={handleExport} 
          disabled={isExporting || reportData.length === 0}
          className="bg-blue-600 text-white hover:bg-success/90"
        >
          <Download className="mr-2 h-4 w-4" /> 
          {isExporting ? "Generando Excel..." : "Exportar a Excel (Gobernación)"}
        </Button>
      </div>

      <div className="rounded-xl border bg-white shadow-2xl overflow-auto max-h-[75vh] w-full scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        <Table className="relative min-w-[2500px] border-collapse">
          <TableHeader className="bg-slate-50 sticky top-0 z-30 shadow-sm">
            <TableRow className="hover:bg-transparent border-b-2 border-primary/10">
              <TableHead className="font-bold text-primary sticky left-0 bg-slate-50 w-[60px] z-40 border-r text-center">
                #
              </TableHead>
              {REPORT_COLUMNS.map((col, i) => (
                <TableHead key={i} className="font-bold text-primary whitespace-nowrap px-4 py-3 text-xs uppercase tracking-wider border-r last:border-r-0">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={REPORT_COLUMNS.length + 1} className="text-center py-20 text-muted-foreground bg-slate-50/30">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-lg font-medium text-slate-400">No hay datos para generar el reporte</p>
                    <p className="text-sm">Verifica los filtros o registros de compras.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              reportData.map((row, i) => (
                <TableRow key={i} className="hover:bg-primary/5 transition-colors group">
                  <TableCell className="sticky left-0 bg-white group-hover:bg-slate-50 font-bold z-20 border-r text-center text-primary/70">
                    {i + 1}
                  </TableCell>
                  {REPORT_COLUMNS.map((col, j) => (
                    <TableCell key={j} className="whitespace-nowrap max-w-[250px] truncate text-sm px-4 py-2 border-r last:border-r-0" title={String(row[col])}>
                      {row[col] !== null && row[col] !== undefined ? String(row[col]) : ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
