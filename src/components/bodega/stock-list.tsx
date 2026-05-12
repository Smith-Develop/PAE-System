"use client";

import { useState } from "react";
import { History, Search, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionHistory } from "./transaction-history";
import { Product } from "@/types";

interface StockListProps {
  initialProducts: Product[];
}

export function StockList({ initialProducts }: StockListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filteredProducts = initialProducts.filter((p) =>
    p.masterProduct?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descripcionMarca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.provider?.razonSocial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const openHistory = (product: Product) => {
    setSelectedProduct(product);
    setIsHistoryOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por alimento o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-lg overflow-hidden">
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-primary py-4">Producto / Alimento</TableHead>
                <TableHead className="font-bold text-primary py-4">Grupo Alimentos</TableHead>
                <TableHead className="font-bold text-primary py-4">Proveedor</TableHead>
                <TableHead className="text-right font-bold text-primary py-4">Existencias</TableHead>
                <TableHead className="text-right font-bold text-primary py-4">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                    No se encontraron productos en inventario.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <div className="font-bold text-slate-800">{p.masterProduct?.nombre}</div>
                      <div className="text-xs text-muted-foreground italic">{p.descripcionMarca}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-semibold bg-slate-100 text-slate-700">
                        {p.masterProduct?.foodGroup?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-slate-700">{p.provider?.razonSocial}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className={cn(
                          "text-xl font-bold",
                          p.currentStock <= 0 ? "text-destructive" : "text-success"
                        )}>
                          {p.currentStock.toLocaleString("es-CO", { minimumFractionDigits: 1 })}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          {p.masterProduct?.unidadMedida}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openHistory(p)} className="h-9 font-semibold border-primary/20 text-primary hover:bg-primary/5">
                        <History className="mr-2 h-4 w-4" /> Historial
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} totalItems={filteredProducts.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="w-[95vw] max-w-none h-[90vh] overflow-y-auto p-0 flex flex-col">
          <DialogHeader className="p-6 border-b bg-muted/20">
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
              <History className="h-6 w-6 text-primary" />
              Historial de Transacciones: {selectedProduct?.masterProduct?.nombre}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {selectedProduct && (
              <TransactionHistory productId={selectedProduct.id} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function cn if not available in context (it is available in lib/utils)
import { cn } from "@/lib/utils";
