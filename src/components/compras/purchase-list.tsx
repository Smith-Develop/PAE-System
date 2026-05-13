"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Upload } from "lucide-react";
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
import { Purchase, Product, Operator, Client } from "@/types";
import { InvoiceScanner } from "./invoice-scanner";
import { InvoiceMapper } from "./invoice-mapper";

interface PurchaseListProps {
  initialPurchases: Purchase[];
  products: Product[];
  operators: Operator[];
  clients: Client[];
}

export function PurchaseList({ initialPurchases, products: initialProducts, operators, clients }: PurchaseListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [scannedItems, setScannedItems] = useState<any[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showMapper, setShowMapper] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/ai-status")
      .then((r) => r.json())
      .then((d) => setAiEnabled(d.enabled))
      .catch(() => {});
  }, []);

  const filteredPurchases = initialPurchases.filter(
    (p) =>
      p.product?.masterProduct?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product?.descripcionMarca.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        {aiEnabled && (
          <Button variant="outline" size="sm" onClick={() => setShowScanner(!showScanner)}>
            <Upload className="mr-2 h-4 w-4" />
            {showScanner ? "Ocultar Escáner" : "Escanear Factura"}
          </Button>
        )}
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
                clients={clients}
                onProductCreated={(newProduct) => setProducts((prev) => [newProduct, ...prev])}
                onSubmit={onSubmit} 
                isSubmitting={isSubmitting} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Escáner de Facturas IA */}
      {aiEnabled && showScanner && (
        <div className="space-y-4">
          {!showMapper && (
            <InvoiceScanner
              onItemsExtracted={(items) => {
                setScannedItems(items);
                setShowMapper(true);
              }}
            />
          )}
          {showMapper && scannedItems.length > 0 && (
            <InvoiceMapper
              items={scannedItems}
              onSaved={() => {
                setScannedItems([]);
                setShowMapper(false);
                setShowScanner(false);
                toast.success("Factura guardada exitosamente");
                setTimeout(() => router.refresh(), 300);
              }}
              onCancel={() => {
                setScannedItems([]);
                setShowMapper(false);
              }}
            />
          )}
        </div>
      )}

      <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
        <Table className="min-w-[650px] table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Fecha</TableHead>
              <TableHead className="font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Operador</TableHead>
              <TableHead className="font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Producto</TableHead>
              <TableHead className="font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Proveedor</TableHead>
              <TableHead className="text-right font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Cantidad</TableHead>
              <TableHead className="text-right font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Valor Total</TableHead>
              <TableHead className="text-right font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Acciones</TableHead>
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
                    <div className="font-medium text-xs break-all whitespace-normal overflow-hidden max-w-[250px]">{p.operator?.nombreOperador}</div>
                  </TableCell>
                  <TableCell className="font-medium break-all whitespace-normal overflow-hidden max-w-[250px]">
                        {p.product?.masterProduct?.nombre}
                        <div className="text-[10px] text-muted-foreground italic break-all whitespace-normal overflow-hidden">{p.product?.descripcionMarca}</div>
                      </TableCell>
                  <TableCell className="text-xs break-all whitespace-normal overflow-hidden max-w-[250px]">{p.product?.provider?.razonSocial}</TableCell>
                  <TableCell className="text-right">
                    {p.cantidadComprada} <span className="text-muted-foreground text-xs">{p.product?.masterProduct?.unidadMedida}</span>
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
