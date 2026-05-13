"use client";

import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Search, Filter, Box } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Pagination } from "@/components/ui/pagination";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { masterProductSchema, MasterProductFormData } from "@/lib/validations";

interface MasterProductWithGroup {
  id: string;
  nombre: string;
  unidadMedida: string;
  foodGroupId: string;
  foodGroup?: { id: string; name: string } | null;
}

interface FoodGroup {
  id: string;
  name: string;
}

interface ProductsByGroupProps {
  masterProducts: MasterProductWithGroup[];
  foodGroups: FoodGroup[];
}

export function ProductsByGroup({ masterProducts, foodGroups }: ProductsByGroupProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroupId, setFilterGroupId] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MasterProductWithGroup | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedItem, setSelectedItem] = useState<MasterProductWithGroup | null>(null);

  const form = useForm<MasterProductFormData>({
    resolver: zodResolver(masterProductSchema) as any,
    defaultValues: {
      nombre: "",
      unidadMedida: "Kilogramos",
      foodGroupId: "",
    },
  });

  const filteredProducts = useMemo(() => {
    let filtered = masterProducts;
    if (filterGroupId !== "all") {
      filtered = filtered.filter((p) => p.foodGroupId === filterGroupId);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          p.unidadMedida.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [masterProducts, filterGroupId, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = async (data: MasterProductFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingProduct
        ? `/api/master-products/${editingProduct.id}`
        : "/api/master-products";
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
        editingProduct ? "Producto actualizado" : "Producto creado"
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
    if (!confirm("¿Estás seguro de eliminar este producto del catálogo?")) return;
    try {
      const res = await fetch(`/api/master-products/${id}`, { method: "DELETE" });
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

  const openEditModal = (product: MasterProductWithGroup) => {
    setEditingProduct(product);
    form.reset({
      nombre: product.nombre,
      unidadMedida: product.unidadMedida,
      foodGroupId: product.foodGroupId,
    });
    setIsOpen(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    form.reset({
      nombre: "",
      unidadMedida: "Kilogramos",
      foodGroupId: filterGroupId !== "all" ? filterGroupId : "",
    });
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingProduct(null);
      form.reset({ nombre: "", unidadMedida: "Kilogramos", foodGroupId: "" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterGroupId} onValueChange={(val) => setFilterGroupId(val || "all")}>
              <SelectTrigger className="h-9 w-[200px] bg-white">
                <SelectValue placeholder="Filtrar por grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los grupos</SelectItem>
                {foodGroups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger render={<Button onClick={openCreateModal} />}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
          </DialogTrigger>
          <DialogContent className="sm:min-w-[50%] sm:max-w-[80%] sm:min-h-[20%]">
            <DialogHeader>
              <DialogTitle>
                {editingProduct
                  ? "Editar Producto del Catálogo"
                  : "Nuevo Producto del Catálogo"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                        Nombre del Producto *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej. ARROZ BLANCO, CARNE DE RES"
                          {...field}
                          className="bg-white h-11 border-slate-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="foodGroupId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                        Grupo Alimentario *
                      </FormLabel>
                      <FormControl >
                        <Combobox
                          options={foodGroups.map((g) => ({
                            label: g.name,
                            value: g.id,
                          }))}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Seleccione el grupo..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unidadMedida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                        Unidad de Medida *
                      </FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="h-11 bg-white border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Kilogramos">Kilogramos</SelectItem>
                            <SelectItem value="Litros">Litros</SelectItem>
                            <SelectItem value="Unidad">Unidad</SelectItem>
                            <SelectItem value="Gramos">Gramos</SelectItem>
                            <SelectItem value="Mililitros">Mililitros</SelectItem>
                            <SelectItem value="Libras">Libras</SelectItem>
                            <SelectItem value="Paquete">Paquete</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : "Guardar Producto"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-white shadow-lg overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-bold text-primary py-4 w-[30%]">Nombre</TableHead>
                <TableHead className="font-bold text-primary py-4 w-[25%]">Grupo</TableHead>
                <TableHead className="font-bold text-primary py-4 w-[20%]">Unidad</TableHead>
                <TableHead className="text-right font-bold text-primary py-4 w-[25%]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Box className="h-10 w-10 opacity-20" />
                      <p className="text-lg font-medium">
                        {filterGroupId === "all"
                          ? "No se encontraron productos"
                          : "No hay productos para este grupo"}
                      </p>
                      <p className="text-sm">
                        Agrega productos al catálogo general para usarlos en platos y pedidos.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((p) => (
                  <TableRow key={p.id} className="cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => setSelectedItem(p)}>
                    <TableCell className="py-3">
                      <span
                        className="font-bold text-slate-800 block truncate max-w-[260px]"
                        title={p.nombre}
                      >
                        {p.nombre}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="secondary"
                        className="font-semibold truncate max-w-[200px] block"
                        title={p.foodGroup?.name || ""}
                      >
                        {p.foodGroup?.name || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono border border-slate-200">
                        {p.unidadMedida}
                      </code>
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); openEditModal(p); }}
                          className="h-9 w-9 text-primary hover:bg-primary/10"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                          className="h-9 w-9 text-destructive hover:bg-destructive/10"
                          title="Eliminar"
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

      <div className="text-xs text-muted-foreground text-right">
        {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
        {filterGroupId !== "all" && " en este grupo"}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => { if (!open) setSelectedItem(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalle del Producto</DialogTitle>
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
              <Badge variant="secondary" className="font-semibold">{selectedItem?.foodGroup?.name || "—"}</Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
