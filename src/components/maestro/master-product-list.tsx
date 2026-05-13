"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
import { MasterProductForm } from "./master-product-form";
import { MasterProductFormData } from "@/lib/validations";
import { MasterProduct, FoodGroup } from "@/types";

interface MasterProductListProps {
  masterProducts: MasterProduct[];
  foodGroups: FoodGroup[];
}

export function MasterProductList({
  masterProducts,
  foodGroups,
}: MasterProductListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MasterProduct | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedItem, setSelectedItem] = useState<MasterProduct | null>(null);

  const filteredProducts = masterProducts.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.unidadMedida.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.foodGroup?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = async (data: MasterProductFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingProduct
        ? `/api/master-products/${editingProduct.id}`
        : `/api/master-products`;

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

      toast.success(
        editingProduct
          ? "Producto del catálogo actualizado"
          : "Producto del catálogo creado"
      );
      setIsOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto del catálogo?"))
      return;

    try {
      const res = await fetch(`/api/master-products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar");
      }
      toast.success("Producto del catálogo eliminado");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const openEditModal = (product: MasterProduct) => {
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
          placeholder="Buscar por nombre, unidad o grupo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-white"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={openCreateModal} />}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto Catálogo
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl h-[85vh] overflow-y-auto p-0 flex flex-col">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="text-2xl font-bold">
                {editingProduct
                  ? "Editar Producto del Catálogo"
                  : "Nuevo Producto del Catálogo"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6">
              <MasterProductForm
                initialData={editingProduct}
                foodGroups={foodGroups}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-white shadow-lg overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-primary py-4">
                  Nombre
                </TableHead>
                <TableHead className="font-bold text-primary py-4">
                  Unidad de Medida
                </TableHead>
                <TableHead className="font-bold text-primary py-4">
                  Grupo de Alimentos
                </TableHead>
                <TableHead className="text-right font-bold text-primary py-4">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-20 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-10 w-10 opacity-20" />
                      <p className="text-lg font-medium">
                        No se encontraron productos en el catálogo
                      </p>
                      <p className="text-sm">
                        Agrega productos genéricos para usarlos en el maestro de
                        productos por proveedor.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                    onClick={() => setSelectedItem(p)}
                  >
                    <TableCell>
                      <div className="font-bold text-slate-800 truncate max-w-[280px]" title={p.nombre}>
                        {p.nombre}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-slate-100 px-2 py-0.5 rounded font-mono border border-slate-200">
                        {p.unidadMedida}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        {p.foodGroup?.name || "Sin grupo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); openEditModal(p); }}
                          className="h-9 w-9 text-primary hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                          className="h-9 w-9 text-destructive hover:bg-destructive/10"
                        >
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
            <DialogTitle>Detalle del Producto del Catálogo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Nombre</p>
              <p className="text-base font-medium">{selectedItem?.nombre}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Unidad de Medida</p>
              <code className="text-sm bg-slate-100 px-2 py-0.5 rounded font-mono border border-slate-200">{selectedItem?.unidadMedida}</code>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Grupo Alimentario</p>
              <Badge variant="secondary" className="font-semibold whitespace-normal break-all text-left">{selectedItem?.foodGroup?.name || "Sin grupo"}</Badge>
            </div>
            {selectedItem?.providerProducts && selectedItem.providerProducts.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Productos Vinculados por Proveedor</p>
                <div className="space-y-2">
                  {selectedItem.providerProducts.map((pp) => (
                    <div key={pp.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 border">
                      <span className="text-sm font-medium text-slate-700">{pp.provider?.razonSocial || "Sin proveedor"}</span>
                      <span className="text-sm text-slate-500">Stock: {pp.currentStock.toLocaleString("es-CO", { minimumFractionDigits: 1 })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(!selectedItem?.providerProducts || selectedItem.providerProducts.length === 0) && (
              <p className="text-sm text-muted-foreground italic">Sin productos vinculados a proveedores</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
