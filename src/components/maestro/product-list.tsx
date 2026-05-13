"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { ProductForm } from "./product-form";
import { ProductFormData } from "@/lib/validations";
import { MasterProduct, Product, Provider, FoodGroup } from "@/types";

interface ProductListProps {
  products: Product[];
  masterProducts: MasterProduct[];
  providers: Provider[];
  foodGroups: FoodGroup[];
}

export function ProductList({ products, masterProducts, providers, foodGroups }: ProductListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.masterProduct?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descripcionMarca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.provider?.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.provider?.nit.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}` 
        : `/api/products`;
      
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      toast.success(editingProduct ? "Producto actualizado" : "Producto creado");
      setIsOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar");
      }
      toast.success("Producto eliminado");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsOpen(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar producto, proveedor o NIT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-white"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={openCreateModal} />}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-none h-[90vh] overflow-y-auto p-0 flex flex-col">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="text-2xl font-bold">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6">
              <ProductForm 
                initialData={editingProduct} 
                providers={providers}
                masterProducts={masterProducts}
                foodGroups={foodGroups}
                onSubmit={onSubmit} 
                isSubmitting={isSubmitting} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-white shadow-lg overflow-hidden">
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <Table className="min-w-[1200px]">
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px] font-bold text-primary py-4">Producto / Marca</TableHead>
                <TableHead className="font-bold text-primary py-4">Grupo Alimentos</TableHead>
                <TableHead className="font-bold text-primary py-4">Proveedor</TableHead>
                <TableHead className="font-bold text-primary py-4">Reg. Sanitario</TableHead>
                <TableHead className="text-right font-bold text-primary py-4">Stock Actual</TableHead>
                <TableHead className="text-right font-bold text-primary py-4">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-10 w-10 opacity-20" />
                      <p className="text-lg font-medium">No se encontraron productos</p>
                      <p className="text-sm">Intenta ajustar tu búsqueda o registra un nuevo producto.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((p) => (
                  <TableRow key={p.id} className="cursor-pointer hover:bg-slate-50/80 transition-colors" onClick={() => setSelectedItem(p)}>
                    <TableCell>
                      <div className="font-bold text-slate-800 truncate max-w-[280px]" title={p.descripcionMarca}>{p.descripcionMarca}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200">
                        {p.masterProduct?.foodGroup?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-slate-700 truncate max-w-[200px]" title={p.provider?.razonSocial}>{p.provider?.razonSocial}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-tight">NIT: {p.provider?.nit}</div>
                    </TableCell>
                    <TableCell>
                      <code className="text-[11px] bg-slate-100 px-2 py-0.5 rounded font-mono border border-slate-200 truncate max-w-[120px] block" title={p.registroSanitario}>
                        {p.registroSanitario}
                      </code>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className={cn(
                          "font-bold text-lg",
                          p.currentStock <= 0 ? "text-destructive" : "text-success"
                        )}>
                          {p.currentStock.toLocaleString("es-CO", { minimumFractionDigits: 1 })}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {p.masterProduct?.unidadMedida}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditModal(p); }} className="h-9 w-9 text-primary hover:bg-primary/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="h-9 w-9 text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} totalItems={filteredProducts.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />

      <Dialog open={!!selectedItem} onOpenChange={(open) => { if (!open) setSelectedItem(null); }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Detalle del Producto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Producto Maestro</p>
                <p className="text-base font-medium">{selectedItem?.masterProduct?.nombre || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Unidad</p>
                <code className="text-sm bg-slate-100 px-2 py-0.5 rounded font-mono border border-slate-200">{selectedItem?.masterProduct?.unidadMedida || "—"}</code>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Grupo Alimentario</p>
              <Badge variant="secondary" className="font-semibold">{selectedItem?.masterProduct?.foodGroup?.name || "Sin grupo"}</Badge>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Proveedor</p>
              <p className="text-sm font-medium text-slate-700">{selectedItem?.provider?.razonSocial || "—"}</p>
              <p className="text-xs text-muted-foreground">NIT: {selectedItem?.provider?.nit || "—"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Descripción y Marca</p>
                <p className="text-base">{selectedItem?.descripcionMarca}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Registro Sanitario</p>
                <p className="text-sm">{selectedItem?.registroSanitario || "—"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Stock Actual</p>
              <span className={cn(
                "font-bold text-lg",
                (selectedItem?.currentStock ?? 0) <= 0 ? "text-destructive" : "text-success"
              )}>
                {selectedItem?.currentStock.toLocaleString?.("es-CO", { minimumFractionDigits: 1 }) ?? "0.0"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Creado</p>
                <p className="text-xs text-muted-foreground">{selectedItem?.createdAt ? new Date(selectedItem.createdAt).toLocaleDateString("es-CO", { dateStyle: "long" }) : "—"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Actualizado</p>
                <p className="text-xs text-muted-foreground">{selectedItem?.updatedAt ? new Date(selectedItem.updatedAt).toLocaleDateString("es-CO", { dateStyle: "long" }) : "—"}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
