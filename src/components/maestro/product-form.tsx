"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormData } from "@/lib/validations";
import { Product, Provider, FoodGroup } from "@/types";

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
import { PackageSearch, Info, Database } from "lucide-react";

interface ProductFormProps {
  initialData?: Product | null;
  providers: Provider[];
  foodGroups: FoodGroup[];
  onSubmit: (data: ProductFormData) => void;
  isSubmitting: boolean;
}

export function ProductForm({ initialData, providers, foodGroups, onSubmit, isSubmitting }: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: initialData ? {
      alimento: initialData.alimento,
      foodGroupId: initialData.foodGroupId,
      descripcionMarca: initialData.descripcionMarca,
      registroSanitario: initialData.registroSanitario,
      unidadMedida: initialData.unidadMedida,
      providerId: initialData.providerId,
    } : {
      alimento: "",
      foodGroupId: "",
      descripcionMarca: "",
      registroSanitario: "",
      unidadMedida: "Kilogramos",
      providerId: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 flex flex-col h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Columna 1: Datos Generales */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Info className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Datos Generales</h3>
            </div>

            <FormField
              control={form.control}
              name="alimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Nombre del Alimento *</FormLabel>
                  <FormControl><Input placeholder="Ej. Arroz Blanco" {...field} className="bg-white h-11 border-slate-200 focus:ring-success" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcionMarca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Descripción y Marca *</FormLabel>
                  <FormControl><Input placeholder="Ej. Marca X, Grano Largo" {...field} className="bg-white h-11 border-slate-200 focus:ring-success" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="foodGroupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Grupo Alimentos (Res 719) *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={foodGroups.map(g => ({ label: g.name, value: g.id }))}
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

          {/* Columna 2: Identificación y Origen */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <PackageSearch className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Origen y Registro</h3>
            </div>

            <FormField
              control={form.control}
              name="providerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Proveedor Responsable *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={providers.map(p => ({ label: p.razonSocial, value: p.id }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Seleccione el proveedor..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registroSanitario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Registro Sanitario *</FormLabel>
                  <FormControl><Input placeholder="Ej. RSAA123456" {...field} className="bg-white h-11 border-slate-200 focus:ring-success" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Columna 3: Unidades y Stock */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Unidades de Medida</h3>
            </div>

            <FormField
              control={form.control}
              name="unidadMedida"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Unidad de Medida Base *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={[
                        { label: "Kilogramos", value: "Kilogramos" },
                        { label: "Litros", value: "Litros" },
                        { label: "Unidades (Huevos)", value: "Unidades" },
                      ]}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Seleccione unidad..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-8 p-6 rounded-xl bg-slate-50 border border-slate-200 border-dashed">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  La unidad de medida seleccionada determinará cómo se realiza la explosión de materiales en los pedidos y el reporte de compras.
                </p>
              </div>
            </div>
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
