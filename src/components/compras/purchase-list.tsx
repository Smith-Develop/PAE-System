"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PurchaseForm } from "./purchase-form";
import { PurchaseFormData } from "@/lib/validations";
import { Purchase, Product, Operator } from "@/types";

interface PurchaseListProps {
  initialPurchases: Purchase[];
  products: Product[];
  operators: Operator[];
}

export function PurchaseList({ initialPurchases, products, operators }: PurchaseListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

  const filteredPurchases = initialPurchases.filter(
    (p) =>
      p.product?.alimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product?.provider?.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.operator?.nombreOperador.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: PurchaseFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingPurchase 
        ? `/api/purchases/${editingPurchase.id}` 
        : `/api/purchases`;
      
      const method = editingPurchase ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      toast.success(editingPurchase ? "Compra actualizada" : "Compra registrada");
      setIsOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este registro de compra?")) return;

    try {
      const res = await fetch(`/api/purchases/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar");
      }
      toast.success("Registro eliminado");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const openEditModal = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setIsOpen(true);
  };

  const openCreateModal = () => {
    setEditingPurchase(null);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Buscar por producto, proveedor u operador..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-white"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={openCreateModal} />}>
            <Plus className="mr-2 h-4 w-4" /> Registrar Compra
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-none h-[90vh] overflow-y-auto p-0 flex flex-col">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="text-2xl font-bold">
                {editingPurchase ? "Editar Compra" : "Registrar Compra"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6">
              <PurchaseForm 
                initialData={editingPurchase} 
                products={products}
                operators={operators}
                onSubmit={onSubmit} 
                isSubmitting={isSubmitting} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Operador</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No se encontraron compras registradas.
                </TableCell>
              </TableRow>
            ) : (
              filteredPurchases.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {format(new Date(p.fechaCompra), "dd MMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-xs">{p.operator?.nombreOperador}</div>
                  </TableCell>
                  <TableCell className="font-medium">{p.product?.alimento}</TableCell>
                  <TableCell className="text-xs">{p.product?.provider?.razonSocial}</TableCell>
                  <TableCell className="text-right">
                    {p.cantidadComprada} <span className="text-muted-foreground text-xs">{p.product?.unidadMedida}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${p.valorTotal.toLocaleString("es-CO")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(p)}>
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
