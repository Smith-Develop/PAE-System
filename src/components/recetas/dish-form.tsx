"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dishSchema, DishFormData } from "@/lib/validations";
import { Plus, Trash2, ChefHat, Apple } from "lucide-react";
import { Dish, MasterProduct, Component } from "@/types";

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
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";

interface DishFormProps {
  initialData?: Dish | null;
  masterProducts: MasterProduct[];
  components: Component[];
  onSubmit: (data: DishFormData) => void;
  isSubmitting: boolean;
}

export function DishForm({
  initialData,
  masterProducts,
  components,
  onSubmit,
  isSubmitting,
}: DishFormProps) {
  const form = useForm<DishFormData>({
    resolver: zodResolver(dishSchema) as any,
    defaultValues: initialData
      ? {
          nombre: initialData.nombre,
          componenteId: initialData.componenteId,
          descripcion: initialData.descripcion || "",
          ingredients: initialData.ingredients.map((ing) => ({
            masterProductId: ing.masterProductId,
            cantidadBrutaUnitaria: ing.cantidadBrutaUnitaria,
          })),
        }
      : {
          nombre: "",
          componenteId: "",
          descripcion: "",
          ingredients: [
            { masterProductId: "", cantidadBrutaUnitaria: 0 as any },
          ],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 flex flex-col h-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <ChefHat className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">
                Datos del Plato
              </h3>
            </div>

            <FormField
              control={form.control}
              name="componenteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                    Componente *
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      options={components.map((c) => ({
                        label: c.name,
                        value: c.id,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Seleccione el componente..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                    Nombre del Plato *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. Carne Sudada"
                      {...field}
                      className="bg-white h-11 border-slate-200 focus:ring-success"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                    Descripción
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles del plato (opcional)"
                      {...field}
                      className="bg-white border-slate-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200 flex-1">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Apple className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-800">
                  Ingredientes
                </h3>
              </div>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border rounded-lg bg-white shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary uppercase">
                      Ingrediente #{index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.masterProductId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500">
                          Producto del Catálogo *
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            options={masterProducts.map((p) => ({
                              label: `${p.nombre} (${p.unidadMedida})`,
                              value: p.id,
                            }))}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Seleccionar producto..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.cantidadBrutaUnitaria`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500">
                          Cantidad Bruta (g/ml por ración) *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value)
                              )
                            }
                            className="bg-white h-10 border-slate-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed border-2 text-primary h-10"
                onClick={() =>
                  append({
                    masterProductId: "",
                    cantidadBrutaUnitaria: 0 as any,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Agregar Ingrediente
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 mt-auto border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            className="px-8 h-12 font-bold text-slate-500 border-slate-300 hover:bg-slate-100 uppercase tracking-widest text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-10 h-12 font-bold bg-blue-600 hover:bg-blue-700 text-white uppercase tracking-widest text-xs shadow-lg"
          >
            {isSubmitting ? "Guardando..." : "Registrar Plato →"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
