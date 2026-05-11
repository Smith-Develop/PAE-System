"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, ChefHat } from "lucide-react";
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

  const filteredDishes = dishes.filter(
    (d) =>
      d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.componente?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-primary py-4">
                Nombre
              </TableHead>
              <TableHead className="font-bold text-primary py-4">
                Componente
              </TableHead>
              <TableHead className="font-bold text-primary py-4">
                Ingredientes
              </TableHead>
              <TableHead className="text-right font-bold text-primary py-4">
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
              filteredDishes.map((d) => (
                <TableRow
                  key={d.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <TableCell>
                    <div className="font-bold text-slate-800">{d.nombre}</div>
                    {d.descripcion && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {d.descripcion}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-semibold border bg-slate-100 text-slate-700"
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
  );
}
