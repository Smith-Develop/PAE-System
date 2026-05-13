"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, ChefHat, Info } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { DishForm } from "./dish-form";
import { DishFormData } from "@/lib/validations";
import { Dish, MasterProduct, Component } from "@/types";

const COMPONENTE_COLORS: Record<string, string> = {};

interface DishListProps {
  dishes: Dish[];
  masterProducts: MasterProduct[];
  components: Component[];
}

export function DishList({ dishes, masterProducts, components }: DishListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const filteredDishes = dishes.filter(
    (d) =>
      d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.componente?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDishes.length / pageSize);
  const paginatedDishes = filteredDishes.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = async (data: DishFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingDish
        ? `/api/dishes/${editingDish.id}`
        : `/api/dishes`;
      const method = editingDish ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      toast.success(editingDish ? "Plato actualizado" : "Plato creado");
      setIsOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este plato?")) return;

    try {
      const res = await fetch(`/api/dishes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar");
      }
      toast.success("Plato eliminado");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar plato por nombre o componente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-white"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button
                onClick={() => {
                  setEditingDish(null);
                  setIsOpen(true);
                }}
              />
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Nuevo Plato
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-4xl h-[90vh] overflow-y-auto p-0 flex flex-col">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="text-2xl font-bold">
                {editingDish ? "Editar Plato" : "Nuevo Plato"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6">
              <DishForm
                initialData={editingDish}
                masterProducts={masterProducts}
                components={components}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-white shadow-lg overflow-hidden">
        <div className="w-full overflow-x-auto">
        <Table className="min-w-[400px] table-fixed">
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">
                Nombre
              </TableHead>
              <TableHead className="font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">
                Componente
              </TableHead>
              <TableHead className="font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">
                Ingredientes
              </TableHead>
              <TableHead className="text-right font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDishes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-20 text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <ChefHat className="h-10 w-10 opacity-20" />
                    <p className="text-lg font-medium">
                      No se encontraron platos
                    </p>
                    <p className="text-sm">
                      Crea platos individuales para luego agruparlos en menús.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedDishes.map((d) => (
                <TableRow
                  key={d.id}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  onClick={() => setSelectedDish(d)}
                >
                  <TableCell>
                    <div className="font-bold text-slate-800 break-all whitespace-normal overflow-hidden max-w-[250px]">{d.nombre}</div>
                    {d.descripcion && (
                      <div className="text-xs text-muted-foreground mt-0.5 break-all whitespace-normal overflow-hidden max-w-[250px]">
                        {d.descripcion}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-semibold border bg-slate-100 text-slate-700 break-all whitespace-normal"
                    >
                      {d.componente?.name || "Sin componente"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-500">
                      {d.ingredients.length} producto
                      {d.ingredients.length !== 1 ? "s" : ""}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {d.ingredients.slice(0, 3).map((ing) => (
                        <span
                          key={ing.id}
                          className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                        >
                          {ing.masterProduct?.nombre || "?"}{" "}
                          {ing.cantidadBrutaUnitaria}g
                        </span>
                      ))}
                      {d.ingredients.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{d.ingredients.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingDish(d);
                          setIsOpen(true);
                        }}
                        className="h-9 w-9 text-primary hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(d.id)}
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

      <Pagination currentPage={page} totalPages={totalPages} totalItems={filteredDishes.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />

      <Dialog open={!!selectedDish} onOpenChange={(v) => { if (!v) setSelectedDish(null); }}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto p-0 flex flex-col">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Info className="h-5 w-5 text-primary" />
              Detalle del Plato
            </DialogTitle>
          </DialogHeader>
          {selectedDish && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border text-sm">
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Nombre</span>
                  <p className="font-bold text-slate-800">{selectedDish.nombre}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Componente</span>
                  <Badge variant="outline" className="font-semibold border bg-slate-100 text-slate-700">
                    {selectedDish.componente?.name || "Sin componente"}
                  </Badge>
                </div>
                {selectedDish.descripcion && (
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground uppercase">Descripción</span>
                    <p className="text-sm text-slate-600">{selectedDish.descripcion}</p>
                  </div>
                )}
                {selectedDish.createdAt && (
                  <div>
                    <span className="text-xs text-muted-foreground uppercase">Creado</span>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedDish.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-700">
                  Ingredientes ({selectedDish.ingredients.length})
                </h4>
                {selectedDish.ingredients.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin ingredientes registrados.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="table-fixed w-full">
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Producto</TableHead>
                        <TableHead className="text-right font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Cantidad Bruta Unitaria</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedDish.ingredients.map((ing) => (
                        <TableRow key={ing.id}>
                          <TableCell className="text-sm font-medium break-all whitespace-normal overflow-hidden">
                            {ing.masterProduct?.nombre || "Desconocido"}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {ing.cantidadBrutaUnitaria.toLocaleString("es-CO")} g
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
