"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { operatorSchema, OperatorFormData } from "@/lib/validations";
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
import { Building2, MapPinned, PhoneCall } from "lucide-react";

import { Operator } from "@/types";

interface OperatorFormProps {
  initialData?: Operator | null;
  onSubmit: (data: OperatorFormData) => void;
  isSubmitting: boolean;
}

export function OperatorForm({ initialData, onSubmit, isSubmitting }: OperatorFormProps) {
  const form = useForm<OperatorFormData>({
    resolver: zodResolver(operatorSchema) as any,
    defaultValues: initialData || {
      nombreOperador: "",
      nitOperador: "",
      modeloAtencion: "",
      modalidadAtencion: "",
      direccionBodega: "",
      municipioBodega: "",
      contactoBodega: "",
      telefonoBodega: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 flex flex-col h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Columna 1: Identificación del Operador */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Identificación</h3>
            </div>

            <FormField
              control={form.control}
              name="nombreOperador"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Nombre del Operador *</FormLabel>
                  <FormControl><Input placeholder="Ej. Unión Temporal PAE" {...field} className="bg-white h-11 border-slate-200 focus:ring-success" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nitOperador"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">NIT Operador *</FormLabel>
                  <FormControl><Input placeholder="Ej. 900.123.456-7" {...field} className="bg-white h-11 border-slate-200 focus:ring-success" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Columna 2: Logística y Bodega */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <MapPinned className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Ubicación Bodega</h3>
            </div>

            <FormField
              control={form.control}
              name="direccionBodega"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Dirección Bodega *</FormLabel>
                  <FormControl><Input placeholder="Ej. Calle 10 # 20-30" {...field} className="bg-white h-11 border-slate-200 focus:ring-success" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="municipioBodega"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Municipio Bodega *</FormLabel>
                  <FormControl><Input placeholder="Ej. Medellín" {...field} className="bg-white h-11 border-slate-200 focus:ring-success" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Columna 3: Contacto y Atención */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <PhoneCall className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Contacto y Atención</h3>
            </div>

            <FormField
              control={form.control}
              name="contactoBodega"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Contacto Bodega *</FormLabel>
                  <FormControl><Input placeholder="Ej. Juan Pérez" {...field} className="bg-white h-11 border-slate-200 focus:ring-success" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefonoBodega"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Teléfono Bodega *</FormLabel>
                  <FormControl><Input placeholder="Ej. 300 123 4567" {...field} className="bg-white h-11 border-slate-200 focus:ring-success" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="modeloAtencion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Modelo *</FormLabel>
                    <FormControl><Input placeholder="Atención..." {...field} className="bg-white h-11 border-slate-200 focus:ring-success" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modalidadAtencion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">Modalidad *</FormLabel>
                    <FormControl><Input placeholder="Atención..." {...field} className="bg-white h-11 border-slate-200 focus:ring-success" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            {isSubmitting ? "Guardando..." : "Guardar Operador →"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
