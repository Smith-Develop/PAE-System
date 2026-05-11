"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, ClientFormData } from "@/lib/validations";
import { Client } from "@/types";

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
import { Building } from "lucide-react";

interface ClientFormProps {
  initialData?: Client | null;
  onSubmit: (data: ClientFormData) => void;
  isSubmitting: boolean;
}

export function ClientForm({
  initialData,
  onSubmit,
  isSubmitting,
}: ClientFormProps) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: initialData || {
      nombre: "",
      nit: "",
      direccion: "",
      municipio: "",
      contacto: "",
      telefono: "",
      correo: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-10 flex flex-col h-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Building className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">
                Datos de la Institución
              </h3>
            </div>

            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                    Nombre *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. I.E. Rural San José"
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
              name="nit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                    NIT *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. 900123456-7"
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
              name="municipio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                    Municipio
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. Medellín"
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
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                    Dirección
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. Vereda El Placer, Km 3"
                      {...field}
                      className="bg-white h-11 border-slate-200 focus:ring-success"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Building className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Contacto</h3>
            </div>

            <FormField
              control={form.control}
              name="contacto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                    Persona de Contacto
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. María Pérez"
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
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                    Teléfono
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. 3124567890"
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
              name="correo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                    Correo Electrónico
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Ej. rectoria@ierural.edu.co"
                      {...field}
                      className="bg-white h-11 border-slate-200 focus:ring-success"
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
            {isSubmitting ? "Guardando..." : "Registrar Cliente →"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
