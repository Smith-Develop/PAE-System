"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormData } from "@/lib/validations";
import { MasterProduct, Product, Provider, FoodGroup } from "@/types";
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
import { PackageSearch, Info } from "lucide-react";

interface ProductFormProps {
  initialData?: Product | null;
  providers: Provider[];
  masterProducts: MasterProduct[];
  foodGroups: FoodGroup[];
  onSubmit: (data: ProductFormData) => void;
  isSubmitting: boolean;
}

export function ProductForm({ initialData, providers, masterProducts, foodGroups, onSubmit, isSubmitting }: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: initialData ? {
      masterProductId: initialData.masterProductId,
      providerId: initialData.providerId,
      descripcionMarca: initialData.descripcionMarca,
      registroSanitario: initialData.registroSanitario,
      currentStock: initialData.currentStock,
    } : {
      masterProductId: "",
      providerId: "",
      descripcionMarca: "",
      registroSanitario: "",
      currentStock: 0,
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
              name="masterProductId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Producto del Catálogo *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={masterProducts.map(p => ({ label: p.nombre, value: p.id }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Seleccione el producto..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcionMarca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Descripción y Marca Específica *</FormLabel>
                  <FormControl><Input placeholder="Ej. Grano Largo, Marca Diana" {...field} className="bg-white h-11 border-slate-200 focus:ring-success" /></FormControl>
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
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <PackageSearch className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Inventario</h3>
            </div>

            <FormField
              control={form.control}
              name="currentStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Stock Actual</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                      className="bg-white h-11 border-slate-200 focus:ring-success"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("masterProductId") && (() => {
              const master = masterProducts.find(p => p.id === form.watch("masterProductId"));
              return (
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 border-dashed space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Info del Catálogo</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-slate-400">Unidad de Medida</span>
                      <p className="text-sm font-bold text-primary">{master?.unidadMedida}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Grupo de Alimentos</span>
                      <p className="text-sm font-bold text-slate-700">{master?.foodGroup?.name || "No definido"}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
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
