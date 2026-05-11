"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  masterProductSchema,
  MasterProductFormData,
} from "@/lib/validations";
import { MasterProduct, FoodGroup } from "@/types";
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
import { Combobox } from "@/components/ui/combobox";
import { PackageSearch, Layers } from "lucide-react";

interface MasterProductFormProps {
  initialData?: MasterProduct | null;
  foodGroups: FoodGroup[];
  onSubmit: (data: MasterProductFormData) => void;
  isSubmitting: boolean;
}

export function MasterProductForm({
  initialData,
  foodGroups,
  onSubmit,
  isSubmitting,
}: MasterProductFormProps) {
  const form = useForm<MasterProductFormData>({
    resolver: zodResolver(masterProductSchema) as any,
    defaultValues: initialData
      ? {
          nombre: initialData.nombre,
          unidadMedida: initialData.unidadMedida,
          foodGroupId: initialData.foodGroupId,
        }
      : {
          nombre: "",
          unidadMedida: "",
          foodGroupId: "",
        },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-10 flex flex-col h-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Columna 1: Nombre y Unidad */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <PackageSearch className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">
                Datos del Producto
              </h3>
            </div>

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
                      placeholder="Ej. ARROZ, MARACUYA, SAL"
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
              name="unidadMedida"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                    Unidad de Medida *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. Kilogramos, Litros, Unidad"
                      {...field}
                      className="bg-white h-11 border-slate-200 focus:ring-success"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Columna 2: Grupo */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">
                Clasificación
              </h3>
            </div>

            <FormField
              control={form.control}
              name="foodGroupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                    Grupo de Alimentos *
                  </FormLabel>
                  <FormControl>
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
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-8 mt-auto border-t">
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
            className="px-10 h-12 font-bold bg-success bg-blue-600 hover:bg-success/90 text-white uppercase tracking-widest text-xs shadow-lg shadow-success/20"
          >
            {isSubmitting ? "Guardando..." : "Registrar Producto →"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
