"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { purchaseSchema, PurchaseFormData } from "@/lib/validations";
import { Purchase, Product, Operator } from "@/types";

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

interface PurchaseFormProps {
  initialData?: Purchase | null;
  products: Product[];
  operators: Operator[];
  onSubmit: (data: PurchaseFormData) => void;
  isSubmitting: boolean;
}

import { ShoppingCart, CalendarDays, DollarSign } from "lucide-react";

export function PurchaseForm({ initialData, products, operators, onSubmit, isSubmitting }: PurchaseFormProps) {
  // Configurar valor por defecto para la fecha
  let defaultDateStr = "";
  if (initialData?.fechaCompra) {
    defaultDateStr = new Date(initialData.fechaCompra).toISOString().split('T')[0];
  } else {
    defaultDateStr = new Date().toISOString().split('T')[0];
  }

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema) as any,
    defaultValues: initialData ? {
      productId: initialData.productId,
      operatorId: initialData.operatorId || "",
      fechaCompra: new Date(initialData.fechaCompra),
      cantidadComprada: initialData.cantidadComprada,
      valorTotal: initialData.valorTotal,
    } : {
      productId: "",
      operatorId: "",
      fechaCompra: new Date(),
      cantidadComprada: 0,
      valorTotal: 0,
    },
  });

  const handleSubmitWrapper = (values: PurchaseFormData) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitWrapper)} className="space-y-10 flex flex-col h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Columna 1: Actores de la Compra */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Actores</h3>
            </div>

            <FormField
              control={form.control}
              name="operatorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Operador Comprador *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={operators.map(op => ({ label: op.nombreOperador, value: op.id }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Seleccione el operador..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Producto / Insumo *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={products.map(p => ({ 
                        label: `${p.masterProduct?.nombre} (${p.provider?.razonSocial} - ${p.descripcionMarca})`, 
                        value: p.id 
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Seleccione el producto..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Columna 2: Fecha y Tiempos */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Temporalidad</h3>
            </div>

            <FormField
              control={form.control}
              name="fechaCompra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Fecha de Factura *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="bg-white h-11 border-slate-200 focus:ring-success"
                      defaultValue={defaultDateStr}
                      onChange={(e) => {
                        if (e.target.value) {
                          field.onChange(new Date(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Columna 3: Valores y Cantidades */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Cantidades y Costos</h3>
            </div>

            <FormField
              control={form.control}
              name="cantidadComprada"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Cantidad Comprada *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" className="bg-white h-11 border-slate-200 focus:ring-success" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valorTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Valor Total ($) *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" className="bg-white h-11 border-slate-200 focus:ring-success" {...field} />
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
            {isSubmitting ? "Guardando..." : "Registrar Compra →"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
