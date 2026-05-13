"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { purchaseSchema, PurchaseFormData } from "@/lib/validations";
import { Purchase, Product, Operator, Client } from "@/types";

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
import { ProductMiniForm } from "./product-mini-form";

interface PurchaseFormProps {
  initialData?: Purchase | null;
  products: Product[];
  operators: Operator[];
  clients: Client[];
  onProductCreated: (product: Product) => void;
  onSubmit: (data: PurchaseFormData) => void;
  isSubmitting: boolean;
}

import { ShoppingCart, CalendarDays, DollarSign, Plus } from "lucide-react";

export function PurchaseForm({ initialData, products, operators, clients, onProductCreated, onSubmit, isSubmitting }: PurchaseFormProps) {
  const [showMiniForm, setShowMiniForm] = useState(false);

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
      clientId: initialData.clientId || "",
      fechaCompra: new Date(initialData.fechaCompra),
      precioUnitario: initialData.precioUnitario || 0,
      cantidadComprada: initialData.cantidadComprada,
      valorTotal: initialData.valorTotal,
    } : {
      productId: "",
      operatorId: "",
      clientId: "",
      fechaCompra: new Date(),
      precioUnitario: 0,
      cantidadComprada: 0,
      valorTotal: 0,
    },
  });

  const precioUnitario = form.watch("precioUnitario");
  const cantidadComprada = form.watch("cantidadComprada");

  useEffect(() => {
    const total = (precioUnitario || 0) * (cantidadComprada || 0);
    form.setValue("valorTotal", total);
  }, [precioUnitario, cantidadComprada, form]);

  const valorTotal = form.watch("valorTotal") || 0;

  const handleSubmitWrapper = (values: PurchaseFormData) => {
    onSubmit(values);
  };

  const formattedTotal = valorTotal.toLocaleString("es-CO");

  return (
    <>
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
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Cliente / Institución</FormLabel>
                    <FormControl>
                      <Combobox
                        options={clients.map(c => ({ label: c.nombre, value: c.id }))}
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        placeholder="Seleccione el cliente..."
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
                    <div className="flex gap-2 items-start">
                      <div className="flex-1">
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
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-11 shrink-0 border-dashed border-primary/40 text-primary hover:bg-primary/5"
                        onClick={() => setShowMiniForm(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
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
                name="precioUnitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Precio por Unidad ($) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                        className="bg-white h-11 border-slate-200 focus:ring-success"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cantidadComprada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Cantidad Comprada *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                        className="bg-white h-11 border-slate-200 focus:ring-success"
                      />
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
                      <Input
                        type="number"
                        step="0.01"
                        readOnly
                        className="bg-slate-50 h-11 border-slate-200 text-slate-700 font-mono cursor-default"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {valorTotal > 0 && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Total</span>
                    <span className="text-xl font-bold text-emerald-700 font-mono">
                      ${formattedTotal}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">
                    {precioUnitario > 0 && cantidadComprada > 0
                      ? `$${precioUnitario.toLocaleString("es-CO")} × ${cantidadComprada.toLocaleString("es-CO")} unidades`
                      : "Ingrese precio y cantidad para calcular"}
                  </p>
                </div>
              )}
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

      {showMiniForm && (
        <ProductMiniForm
          onProductCreated={(product) => {
            onProductCreated(product);
            setShowMiniForm(false);
          }}
          onClose={() => setShowMiniForm(false)}
        />
      )}
    </>
  );
}
