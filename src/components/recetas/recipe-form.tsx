"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recipeSchema, RecipeFormData } from "@/lib/validations";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { Recipe, MasterProduct } from "@/types";

interface RecipeFormProps {
  initialData?: Recipe | null;
  masterProducts: MasterProduct[];
  onSubmit: (data: RecipeFormData) => void;
  isSubmitting: boolean;
}

export function RecipeForm({ initialData, masterProducts, onSubmit, isSubmitting }: RecipeFormProps) {
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema) as any,
    defaultValues: initialData ? {
      nombre: initialData.nombre,
      descripcion: initialData.descripcion || "",
      ingredients: initialData.ingredients.map(ing => ({
        componente: ing.componente,
        preparacion: ing.preparacion,
        masterProductId: ing.masterProductId,
        cantidadBrutaUnitaria: ing.cantidadBrutaUnitaria
      }))
    } : {
      nombre: "",
      descripcion: "",
      ingredients: [{ componente: "", preparacion: "", masterProductId: "", cantidadBrutaUnitaria: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Receta / Menú *</FormLabel>
                <FormControl><Input placeholder="Ej. Menú No. 1" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción (Opcional)</FormLabel>
                <FormControl><Textarea placeholder="Breve descripción del menú" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary">Ingredientes</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ componente: "", preparacion: "", masterProductId: "", cantidadBrutaUnitaria: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar Ingrediente
            </Button>
          </div>

          <div className="rounded-xl border bg-slate-50/50 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b bg-muted/80 font-bold text-xs uppercase tracking-wider text-primary">
              <div className="col-span-3">Componente</div>
              <div className="col-span-3">Preparación</div>
              <div className="col-span-3">Producto</div>
              <div className="col-span-2 text-center">Cant. Bruta (g/ml)</div>
              <div className="col-span-1 text-center">Acción</div>
            </div>
            
            <div className="p-4 space-y-6 md:space-y-3 max-h-[50vh] overflow-y-auto scrollbar-thin">
              {fields.map((field, index) => (
                <div key={field.id} className="relative flex flex-col md:grid md:grid-cols-12 gap-4 items-start p-4 md:p-0 border rounded-lg md:border-0 bg-white md:bg-transparent shadow-sm md:shadow-none">
                  <div className="md:hidden font-bold text-sm text-primary mb-2 flex justify-between w-full">
                    <span>Ingrediente #{index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.componente`}
                    render={({ field }) => (
                      <FormItem className="col-span-3 w-full">
                        <FormLabel className="md:hidden text-xs">Componente</FormLabel>
                        <FormControl><Input placeholder="Ej. Proteína" className="bg-white" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.preparacion`}
                    render={({ field }) => (
                      <FormItem className="col-span-3 w-full">
                        <FormLabel className="md:hidden text-xs">Preparación</FormLabel>
                        <FormControl><Input placeholder="Ej. Carne Sudada" className="bg-white" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.masterProductId`}
                    render={({ field }) => {
                      // Filtrar productos que tienen stock > 0 en alguna de sus variantes
                      const availableProducts = masterProducts.filter(p => 
                        p.providerProducts?.some(v => v.currentStock > 0)
                      );

                      return (
                        <FormItem className="col-span-3 w-full">
                          <FormLabel className="md:hidden text-xs">Producto</FormLabel>
                          <FormControl>
                            <Combobox
                              options={availableProducts.map(p => ({ label: p.nombre, value: p.id }))}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Seleccionar..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.cantidadBrutaUnitaria`}
                    render={({ field }) => (
                      <FormItem className="col-span-2 w-full text-center">
                        <FormLabel className="md:hidden text-xs">Cant. Bruta (g/ml)</FormLabel>
                        <FormControl><Input type="number" step="0.01" className="bg-white text-center" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="hidden md:col-span-1 md:flex justify-center pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {form.formState.errors.ingredients?.root && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.ingredients.root.message}
            </p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar Receta"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
