"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StockTransaction } from "@/types";

interface TransactionHistoryProps {
  productId: string;
}

export function TransactionHistory({ productId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (productId) {
      fetchHistory();
    }
  }, [productId]);

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10">
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead>Concepto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                No hay movimientos registrados para este producto.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(t.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={t.type === "ENTRADA" ? "default" : "destructive"}
                    className={t.type === "ENTRADA" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                  >
                    {t.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-bold">
                  {t.type === "ENTRADA" ? "+" : "-"}{t.quantity.toFixed(2)}
                </TableCell>
                <TableCell className="text-sm">
                  {t.reason}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
