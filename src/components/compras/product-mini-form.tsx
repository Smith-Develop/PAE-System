"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormData } from "@/lib/validations";
import { MasterProduct, Provider, Product } from "@/types";
import { toast } from "sonner";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PackagePlus } from "lucide-react";

interface ProductMiniFormProps {
  onProductCreated: (product: Product) => void;
  onClose: () => void;
}

export function ProductMiniForm({ onProductCreated, onClose }: ProductMiniFormProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masterProducts, setMasterProducts] = useState<MasterProduct[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/master-products").then((r) => r.json()),
      fetch("/api/providers").then((r) => r.json()),
    ]).then(([mp, pv]) => {
      setMasterProducts(Array.isArray(mp) ? mp : []);
      setProviders(Array.isArray(pv) ? pv : []);
    });
  }, []);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      masterProductId: "",
      providerId: "",
      descripcionMarca: "",
      registroSanitario: "",
      currentStock: 0,
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al crear producto");
      }

      const product = await res.json();
      toast.success("Producto creado");
      onProductCreated(product);
      handleClose();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <PackagePlus className="h-5 w-5 text-primary" />
            Nuevo Producto
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="masterProductId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Producto del Catálogo *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={masterProducts.map((p) => ({ label: p.nombre, value: p.id }))}
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
              name="providerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Proveedor *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={providers.map((p) => ({ label: p.razonSocial, value: p.id }))}
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
              name="descripcionMarca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Descripción / Marca *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Grano Largo, Marca Diana" {...field} className="bg-white h-11 border-slate-200" />
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
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Registro Sanitario</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. RSAA123456" {...field} className="bg-white h-11 border-slate-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Stock Inicial</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                      className="bg-white h-11 border-slate-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="px-6 h-10 font-bold text-slate-500 border-slate-300 hover:bg-slate-100 uppercase tracking-widest text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 h-10 font-bold bg-blue-600 hover:bg-blue-700 text-white uppercase tracking-widest text-xs"
              >
                {isSubmitting ? "Guardando..." : "Crear Producto"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
