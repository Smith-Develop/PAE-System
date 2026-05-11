"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RecipeForm } from "./recipe-form";
import { RecipeFormData } from "@/lib/validations";
import { Recipe, Product } from "@/types";

interface RecipeListProps {
  recipes: Recipe[];
  products: Product[];
}

export function RecipeList({ recipes, products }: RecipeListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const filteredRecipes = recipes.filter((r) =>
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingRecipe ? `/api/recipes/${editingRecipe.id}` : `/api/recipes`;
      const method = editingRecipe ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      toast.success(editingRecipe ? "Receta actualizada" : "Receta creada");
      setIsOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta receta?")) return;

    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar");
      }
      toast.success("Receta eliminada");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsOpen(true);
  };

  const openCreateModal = () => {
    setEditingRecipe(null);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar receta por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-white"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={openCreateModal} />}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Receta
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-none h-[90vh] overflow-y-auto p-0 flex flex-col">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="text-2xl font-bold text-primary">
                {editingRecipe ? "Editar Receta / Menú" : "Nueva Receta / Menú"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6">
              <RecipeForm 
                initialData={editingRecipe} 
                products={products}
                onSubmit={onSubmit} 
                isSubmitting={isSubmitting} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecipes.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground border rounded-lg bg-white">
            No se encontraron recetas.
          </div>
        ) : (
          filteredRecipes.map((r) => (
            <Card key={r.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-primary">{r.nombre}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {r.descripcion || "Sin descripción"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-sm font-medium mb-2">
                  {r.ingredients.length} Ingredientes
                </div>
                <div className="space-y-1">
                  {r.ingredients.slice(0, 3).map((ing) => (
                    <div key={ing.id} className="text-xs text-muted-foreground flex justify-between">
                      <span>• {ing.product?.alimento || 'Producto'}</span>
                      <span>{ing.cantidadBrutaUnitaria} g/ml</span>
                    </div>
                  ))}
                  {r.ingredients.length > 3 && (
                    <div className="text-xs text-muted-foreground italic">
                      + {r.ingredients.length - 3} ingredientes más
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t flex justify-end gap-2">
                <Dialog>
                  <DialogTrigger render={<Button variant="outline" size="sm" />}>
                    <Eye className="h-4 w-4 mr-1" /> Ver Detalle
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-none h-[90vh] overflow-y-auto p-0 flex flex-col">
                    <DialogHeader className="p-6 border-b bg-primary/5">
                      <DialogTitle className="text-3xl font-bold text-primary">{r.nombre}</DialogTitle>
                      {r.descripcion && <p className="text-muted-foreground mt-2">{r.descripcion}</p>}
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6">
                      <div className="mt-4">
                        <h4 className="font-bold text-xl mb-4 text-primary">Ingredientes y Porciones</h4>
                        <div className="rounded-xl border shadow-lg overflow-hidden">
                          <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/80 font-bold text-sm uppercase tracking-widest text-primary">
                            <div>Componente</div>
                            <div>Preparación</div>
                            <div>Producto Maestro</div>
                            <div className="text-right">Cant. Bruta (g/ml)</div>
                          </div>
                          <div className="divide-y max-h-full overflow-y-auto bg-white">
                            {r.ingredients.map((ing) => (
                              <div key={ing.id} className="grid grid-cols-4 gap-4 p-4 text-sm items-center hover:bg-slate-50 transition-colors">
                                <div className="font-medium">{ing.componente}</div>
                                <div>{ing.preparacion}</div>
                                <div className="text-muted-foreground italic">{ing.product?.alimento}</div>
                                <div className="text-right font-mono font-bold text-lg text-primary">{ing.cantidadBrutaUnitaria}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={() => openEditModal(r)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(r.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
