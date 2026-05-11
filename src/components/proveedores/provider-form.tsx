"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { providerSchema, ProviderFormData } from "@/lib/validations";
import { Provider } from "@/types";

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
import { Checkbox } from "@/components/ui/checkbox";

interface ProviderFormProps {
  initialData?: Provider | null;
  onSubmit: (data: ProviderFormData) => void;
  isSubmitting: boolean;
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, User, MapPin, ShieldCheck } from "lucide-react";

export function ProviderForm({ initialData, onSubmit, isSubmitting }: ProviderFormProps) {
  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema) as any,
    defaultValues: initialData || {
      razonSocial: "",
      nit: "",
      codigoInscripcion: "",
      representanteLegal: "",
      municipio: "",
      direccionEstablecimiento: "",
      telefono: "",
      correo: "",
      tipoActividad: "",
      compraLocal: false,
      fechaVisita: "",
      conceptoSanitario: "",
      entidadEmisora: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0 h-full w-full flex flex-col">
        <Tabs defaultValue="id" className="w-full flex-1 flex flex-col">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none mb-8">
            <TabsTrigger
              value="id"
              className="flex items-center gap-2 px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-success rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold text-muted-foreground data-[state=active]:text-success"
            >
              <User className="h-4 w-4" />
              1. Identificación
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="flex items-center gap-2 px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-success rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold text-muted-foreground data-[state=active]:text-success"
            >
              <MapPin className="h-4 w-4" />
              2. Ubicación y Contacto
            </TabsTrigger>
            <TabsTrigger
              value="sanitary"
              className="flex items-center gap-2 px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-success rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold text-muted-foreground data-[state=active]:text-success"
            >
              <ShieldCheck className="h-4 w-4" />
              3. Datos Sanitarios
            </TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="id" className="space-y-8 mt-0 outline-none">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Información de Identificación</h3>
                <div className="text-xs text-muted-foreground bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest font-semibold">
                  Paso 1 de 3
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                <FormField
                  control={form.control}
                  name="razonSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold">Razón Social *</FormLabel>
                      <FormControl><Input {...field} className="bg-white border-slate-200 h-11 focus:ring-success" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold">NIT *</FormLabel>
                      <FormControl><Input {...field} className="bg-white border-slate-200 h-11 focus:ring-success" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="codigoInscripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold">Código Inscripción</FormLabel>
                      <FormControl><Input {...field} className="bg-white border-slate-200 h-11 focus:ring-success" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tipoActividad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold">Tipo de Actividad *</FormLabel>
                      <FormControl><Input {...field} className="bg-white border-slate-200 h-11 focus:ring-success" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="compraLocal"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border border-slate-200 p-4 bg-slate-50/50 h-11 self-end">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-semibold text-slate-700">¿Es Compra Local?</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-8 mt-0 outline-none">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Información de Ubicación y Contacto</h3>
                <div className="text-xs text-muted-foreground bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest font-semibold">
                  Paso 2 de 3
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                <FormField
                  control={form.control}
                  name="representanteLegal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold">Representante Legal *</FormLabel>
                      <FormControl><Input {...field} className="bg-white border-slate-200 h-11 focus:ring-success" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="municipio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold">Municipio *</FormLabel>
                      <FormControl><Input {...field} className="bg-white border-slate-200 h-11 focus:ring-success" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="direccionEstablecimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold">Dirección Establecimiento</FormLabel>
                      <FormControl><Input {...field} className="bg-white border-slate-200 h-11 focus:ring-success" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold">Número Telefónico</FormLabel>
                      <FormControl><Input {...field} className="bg-white border-slate-200 h-11 focus:ring-success" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="correo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold">Correo Electrónico</FormLabel>
                      <FormControl><Input {...field} type="email" className="bg-white border-slate-200 h-11 focus:ring-success" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="sanitary" className="space-y-8 mt-0 outline-none">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Información Sanitaria</h3>
                <div className="text-xs text-muted-foreground bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest font-semibold">
                  Paso 3 de 3
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                <FormField
                  control={form.control}
                  name="fechaVisita"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold">Fecha Última Visita</FormLabel>
                      <FormControl><Input {...field} type="date" className="bg-white border-slate-200 h-11 focus:ring-success" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="conceptoSanitario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold">Concepto Sanitario</FormLabel>
                      <FormControl><Input {...field} className="bg-white border-slate-200 h-11 focus:ring-success" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="entidadEmisora"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold">Entidad Emisora</FormLabel>
                      <FormControl><Input {...field} className="bg-white border-slate-200 h-11 focus:ring-success" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-success shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-primary uppercase tracking-wider">Cumplimiento Resolución 719</p>
                  <p className="text-sm text-slate-600">
                    Asegúrese de que todos los datos sanitarios coincidan con el acta física. Estos datos se cruzarán automáticamente para generar el reporte de la Gobernación.
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

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
            className="px-10 h-12 font-bold bg-success  bg-blue-600 hover:bg-success/90 text-white uppercase tracking-widest text-xs shadow-lg shadow-success/20"
          >
            {isSubmitting ? "Procesando..." : "Guardar y Continuar →"}
          </Button>
        </div>
      </form>
    </Form>

  );
}
